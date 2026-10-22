import { describe, expect, test } from "bun:test";
import { UPSTREAM_SERVICES, checkUpstreams, upstreamHealthUrl } from "./health.ts";

describe("gateway upstream health", () => {
  test("probes every live upstream at its root /health", () => {
    const services: string[] = [...UPSTREAM_SERVICES].sort();
    expect(services).toEqual(
      [
        "auth",
        "booking",
        "catalog",
        "cms",
        "integration",
        "notification",
        "reels",
        "vendor",
      ].sort(),
    );
    expect(upstreamHealthUrl("catalog")).toMatch(/:3002\/health$/);
    expect(upstreamHealthUrl("booking")).toMatch(/:3009\/health$/);
  });

  test("reports up/down per service", async () => {
    const calls: string[] = [];
    const result = await checkUpstreams(async (url) => {
      calls.push(url);
      if (url.includes(":3002/")) throw new Error("ECONNREFUSED");
      if (url.includes(":3006/")) return new Response("nope", { status: 503 });
      return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
    });
    expect(calls).toHaveLength(UPSTREAM_SERVICES.length);
    expect(result.catalog).toBe("down");
    expect(result.cms).toBe("down");
    expect(result.auth).toBe("up");
    expect(result.booking).toBe("up");
    expect(result.reels).toBe("up");
  });
});
