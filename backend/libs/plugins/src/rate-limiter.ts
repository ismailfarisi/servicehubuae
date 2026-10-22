import { config } from "@servicehubuae/config";
import { Elysia } from "elysia";
import { type RedisClientType, createClient } from "redis";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const IP_LIMIT: RateLimitConfig = { maxRequests: 100, windowMs: 60_000 };
const USER_LIMIT: RateLimitConfig = { maxRequests: 1000, windowMs: 60_000 };

let redis: RedisClientType | null = null;

let redisUnavailable = false;
let redisRetryAt = 0;
const REDIS_RETRY_MS = 30_000;

async function getRedis(): Promise<RedisClientType | null> {
  if (redisUnavailable) {
    if (Date.now() < redisRetryAt) return null;
    redisUnavailable = false;
  }
  if (redis?.isOpen) return redis;
  try {
    redis = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        connectTimeout: 2000,
        reconnectStrategy: false,
      },
      password: config.redis.password,
    });
    redis.on("error", () => {
      redis = null;
      redisUnavailable = true;
      redisRetryAt = Date.now() + REDIS_RETRY_MS;
    });
    await redis.connect();
    return redis;
  } catch {
    redis = null;
    redisUnavailable = true;
    redisRetryAt = Date.now() + REDIS_RETRY_MS;
    return null;
  }
}

// In-memory fallback when Redis is unavailable
const memoryStore = new Map<string, { count: number; resetAt: number }>();

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore) {
    if (now > entry.resetAt) {
      memoryStore.delete(key);
    }
  }
}, 60_000);

/** Call this to stop the background cleanup timer (e.g. in tests). */
export function stopCleanupTimer() {
  clearInterval(cleanupTimer);
}

async function checkRateLimitRedis(
  client: RedisClientType,
  key: string,
  cfg: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redisKey = `ratelimit:${key}`;
  const windowSec = Math.ceil(cfg.windowMs / 1000);

  // Atomic increment with expiry using Lua script to prevent orphaned keys
  const luaScript = `
    local count = redis.call('INCR', KEYS[1])
    if count == 1 then
      redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    local ttl = redis.call('TTL', KEYS[1])
    if ttl < 0 then
      redis.call('EXPIRE', KEYS[1], ARGV[1])
      ttl = tonumber(ARGV[1])
    end
    return {count, ttl}
  `;

  const result = (await client.eval(luaScript, {
    keys: [redisKey],
    arguments: [String(windowSec)],
  })) as [number, number];

  const count = result[0];
  const ttl = result[1];
  const resetAt = Date.now() + ttl * 1000;
  const remaining = Math.max(0, cfg.maxRequests - count);

  return {
    allowed: count <= cfg.maxRequests,
    remaining,
    resetAt,
  };
}

function checkRateLimitMemory(
  key: string,
  cfg: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + cfg.windowMs });
    return { allowed: true, remaining: cfg.maxRequests - 1, resetAt: now + cfg.windowMs };
  }

  if (entry.count >= cfg.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: cfg.maxRequests - entry.count, resetAt: entry.resetAt };
}

async function checkRateLimit(
  key: string,
  cfg: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const client = await getRedis();
  if (client) {
    return checkRateLimitRedis(client, key, cfg);
  }
  return checkRateLimitMemory(key, cfg);
}

/**
 * Rate limiter plugin — Redis-backed with in-memory fallback.
 * 100 req/min per IP, 1000 req/min per authenticated user.
 */
export const rateLimiter = new Elysia({ name: "rate-limiter" }).onBeforeHandle(
  { as: "scoped" },
  async ({ request, set, ...ctx }) => {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const user = (ctx as Record<string, unknown>).user as { id?: string } | undefined;
    const isAuthenticated = user?.id;

    const cfg = isAuthenticated ? USER_LIMIT : IP_LIMIT;
    const key = isAuthenticated ? `user:${user.id}` : `ip:${ip}`;

    const result = await checkRateLimit(key, cfg);

    set.headers["x-ratelimit-limit"] = String(cfg.maxRequests);
    set.headers["x-ratelimit-remaining"] = String(result.remaining);
    set.headers["x-ratelimit-reset"] = String(Math.ceil(result.resetAt / 1000));

    if (!result.allowed) {
      set.status = 429;
      return {
        statusCode: 429,
        message: "Too many requests. Please try again later.",
        error: "RATE_LIMIT_EXCEEDED",
        timestamp: new Date().toISOString(),
      };
    }
  },
);
