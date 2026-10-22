import { describe, expect, test } from "bun:test";
import { config } from "./index.ts";

describe("config", () => {
  test("has all required port keys", () => {
    expect(config.port).not.toHaveProperty("product");
    expect(config.port).not.toHaveProperty("order");
    expect(config.port).toHaveProperty("gateway");
    expect(config.port).toHaveProperty("auth");
    expect(config.port).toHaveProperty("catalog");
    expect(config.port).toHaveProperty("booking");
    expect(config.port).toHaveProperty("vendor");
    expect(config.port).toHaveProperty("notification");
  });

  test("ports are numbers", () => {
    for (const [, port] of Object.entries(config.port)) {
      expect(typeof port).toBe("number");
      expect(Number.isNaN(port)).toBe(false);
    }
  });

  test("default ports are in expected range", () => {
    expect(config.port.gateway).toBe(3000);
    expect(config.port.auth).toBe(3001);
    expect(config.port.catalog).toBe(3002);
    expect(config.port.vendor).toBe(3004);
    expect(config.port.notification).toBe(3005);
    expect(config.port.booking).toBe(3009);
  });

  test("has database configuration", () => {
    expect(config.database).toHaveProperty("host");
    expect(config.database).toHaveProperty("port");
    expect(config.database).toHaveProperty("username");
    expect(config.database).toHaveProperty("password");
    expect(config.database).toHaveProperty("database");
  });

  test("database port is a number", () => {
    expect(typeof config.database.port).toBe("number");
  });

  test("has redis configuration", () => {
    expect(config.redis).toHaveProperty("host");
    expect(config.redis).toHaveProperty("port");
  });

  test("has jwt configuration", () => {
    expect(config.jwt).toHaveProperty("accessSecret");
    expect(config.jwt).toHaveProperty("refreshSecret");
    expect(config.jwt).toHaveProperty("accessExpiresIn");
    expect(config.jwt).toHaveProperty("refreshExpiresIn");
    expect(config.jwt.accessExpiresIn).toBe("15m");
    expect(config.jwt.refreshExpiresIn).toBe("7d");
  });

  test("env reads from NODE_ENV", () => {
    // Bun sets NODE_ENV=test during test runs
    expect(config.env).toBe(process.env.NODE_ENV || "development");
  });

  test("jwt secrets have default dev values", () => {
    expect(config.jwt.accessSecret).toBe("dev-access-secret");
    expect(config.jwt.refreshSecret).toBe("dev-refresh-secret");
  });

  test("payments.onlineEnabled defaults to false until MyFatoorah ships", () => {
    if (process.env.ONLINE_PAYMENTS_ENABLED === undefined) {
      expect(config.payments.onlineEnabled).toBe(false);
    }
    expect(typeof config.payments.onlineEnabled).toBe("boolean");
  });

  test("stripe keys default to empty strings (no committed secrets)", () => {
    if (!process.env.STRIPE_SECRET_KEY) expect(config.stripe.secretKey).toBe("");
    if (!process.env.STRIPE_CONNECT_WEBHOOK_SECRET) {
      expect(config.stripe.connectWebhookSecret).toBe("");
    }
  });

  // `config` is a single module-level object evaluated once at import time,
  // so exercising production mode requires re-importing the module with the
  // env already set (a cache-busting query string forces Bun to re-evaluate).
  test("loads in production when every required secret is set", async () => {
    const required = {
      NODE_ENV: "production",
      DB_PASSWORD: "test-db-password",
      JWT_ACCESS_SECRET: "test-access-secret",
      JWT_REFRESH_SECRET: "test-refresh-secret",
      TWO_FA_ENCRYPTION_KEY: "test-2fa-key",
      INTERNAL_SERVICE_SECRET: "test-internal-secret",
      VENDOR_ENCRYPTION_KEY: "test-vendor-encryption-key",
      ENCRYPTION_KEY: "test-encryption-key",
      TYPESENSE_API_KEY: "test-typesense-key",
      VENDOR_DASHBOARD_URL: "https://vendor.servicehubuae.com",
      ADMIN_PANEL_URL: "https://admin.servicehubuae.com",
    } as const;
    const keys = Object.keys(required) as (keyof typeof required)[];
    const originalValues = Object.fromEntries(keys.map((k) => [k, process.env[k]]));

    try {
      for (const key of keys) process.env[key] = required[key];
      const reimported: { config: typeof config } = await import(
        `./index.ts?reimport=${Date.now()}-${Math.random()}`
      );
      expect(reimported.config.isProduction).toBe(true);
      expect(reimported.config.port.catalog).toBe(3002);
      expect(reimported.config).not.toHaveProperty("tamara");
    } finally {
      for (const key of keys) {
        const original = originalValues[key];
        if (original === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = original;
        }
      }
    }
  });
});
