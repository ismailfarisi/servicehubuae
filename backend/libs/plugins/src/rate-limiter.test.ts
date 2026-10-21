import { afterAll, describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { rateLimiter, stopCleanupTimer } from "./rate-limiter.ts";

afterAll(() => {
  stopCleanupTimer();
});

/**
 * Rate limiter tests.
 * Tests use the in-memory fallback (no Redis in test env).
 */

function createApp() {
  return new Elysia().use(rateLimiter).get("/test", () => ({ ok: true }));
}

describe("rateLimiter", () => {
  test("allows requests under the limit", async () => {
    const app = createApp();
    const res = await app.handle(new Request("http://localhost/test"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(true);
  });

  test("returns 429 when limit is exceeded", async () => {
    const app = createApp();
    const ip = `rate-test-${Date.now()}-${Math.random()}`;
    let lastRes: Response | undefined;

    for (let i = 0; i < 101; i++) {
      lastRes = await app.handle(
        new Request("http://localhost/test", {
          headers: { "x-forwarded-for": ip },
        }),
      );
    }

    expect(lastRes!.status).toBe(429);
    const body = (await lastRes!.json()) as any;
    expect(body.error).toBe("RATE_LIMIT_EXCEEDED");
    expect(body.statusCode).toBe(429);
    expect(body.message).toContain("Too many requests");
    expect(body.timestamp).toBeDefined();
  });

  test("tracks different IPs independently", async () => {
    const app = createApp();
    const ip1 = `independent-a-${Date.now()}`;
    const ip2 = `independent-b-${Date.now()}`;

    // Exhaust ip1 limit
    for (let i = 0; i < 101; i++) {
      await app.handle(
        new Request("http://localhost/test", {
          headers: { "x-forwarded-for": ip1 },
        }),
      );
    }

    // ip2 should still work
    const res = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": ip2 },
      }),
    );
    expect(res.status).toBe(200);
  });

  test("first 100 requests from same IP succeed", async () => {
    const app = createApp();
    const ip = `hundred-test-${Date.now()}`;

    let allOk = true;
    for (let i = 0; i < 100; i++) {
      const res = await app.handle(
        new Request("http://localhost/test", {
          headers: { "x-forwarded-for": ip },
        }),
      );
      if (res.status !== 200) {
        allOk = false;
        break;
      }
    }
    expect(allOk).toBe(true);

    // The 101st should fail
    const res = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": ip },
      }),
    );
    expect(res.status).toBe(429);
  });

  test("429 response has standard error format", async () => {
    const app = createApp();
    const ip = `format-test-${Date.now()}`;

    // Exhaust limit
    for (let i = 0; i < 101; i++) {
      await app.handle(
        new Request("http://localhost/test", {
          headers: { "x-forwarded-for": ip },
        }),
      );
    }

    const res = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": ip },
      }),
    );
    const body = (await res.json()) as any;
    expect(body).toHaveProperty("statusCode");
    expect(body).toHaveProperty("message");
    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("timestamp");
  });
});
