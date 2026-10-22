import { describe, expect, it, mock } from "bun:test";
import { FeedCacheClient, type RedisLike } from "./feed-cache.client.ts";
import { FeedService } from "./feed.service.ts";

describe("FeedService.getHomeFeedForYou", () => {
  it("returns ranked reels filtered for already-viewed by user", async () => {
    const fakeCache = {
      getCohort: mock(async () => ["r1", "r2", "r3", "r4", "r5"]),
    };
    const fakeViewRepo = {
      createQueryBuilder: () => ({
        select: function () {
          return this;
        },
        where: function () {
          return this;
        },
        andWhere: function () {
          return this;
        },
        getRawMany: async () => [{ reel_id: "r2" }, { reel_id: "r4" }],
      }),
    };
    const fakeReelRepo = {
      findByIds: async (ids: string[]) =>
        ids.map((id) => ({
          id,
          status: "approved",
          published_at: new Date(),
        })),
    };
    const service = new FeedService(fakeCache as any, fakeViewRepo as any, fakeReelRepo as any);
    const result = await service.getHomeFeed({
      tab: "for_you",
      language: "en",
      country: "AE",
      userId: "user-1",
      limit: 20,
    });
    const returnedIds = result.reels.map((r) => r.id);
    expect(returnedIds).not.toContain("r2");
    expect(returnedIds).not.toContain("r4");
    expect(returnedIds).toEqual(["r1", "r3", "r5"]);
  });

  it("anonymous viewer gets full cohort without dedup", async () => {
    const fakeCache = { getCohort: mock(async () => ["r1", "r2", "r3"]) };
    const fakeViewRepo = {
      createQueryBuilder: () => {
        throw new Error("should not call");
      },
    };
    const fakeReelRepo = {
      findByIds: async (ids: string[]) =>
        ids.map((id) => ({
          id,
          status: "approved",
          published_at: new Date(),
        })),
    };
    const service = new FeedService(fakeCache as any, fakeViewRepo as any, fakeReelRepo as any);
    const result = await service.getHomeFeed({
      tab: "for_you",
      language: "en",
      country: "AE",
      userId: null,
      limit: 20,
    });
    expect(result.reels.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
  });
});

function makeCacheStub(): FeedCacheClient {
  const pipe = {
    del: () => pipe,
    zadd: () => pipe,
    expire: () => pipe,
    exec: async () => [],
  };
  const redis: RedisLike = {
    multi: () => pipe,
    zrevrange: async () => [],
    del: async () => 0,
  };
  return new FeedCacheClient(redis);
}

describe("FeedService.getVendorFeed", () => {
  function captureQb(rows: unknown[]) {
    const calls: { where: string[]; params: Record<string, unknown>[] } = {
      where: [],
      params: [],
    };
    const qb: any = {
      where(sql: string, params?: Record<string, unknown>) {
        calls.where.push(sql);
        if (params) calls.params.push(params);
        return qb;
      },
      andWhere(sql: string, params?: Record<string, unknown>) {
        calls.where.push(sql);
        if (params) calls.params.push(params);
        return qb;
      },
      orderBy: () => qb,
      offset: () => qb,
      limit: () => qb,
      getMany: async () => rows,
    };
    return { qb, calls };
  }

  it("falls back to a live query on the vendor link (no product joins) when the cohort is empty", async () => {
    const fakeCache = { getCohort: mock(async () => []) };
    const { qb, calls } = captureQb([{ id: "r1" }, { id: "r2" }]);
    const fakeReelRepo = { createQueryBuilder: () => qb };
    const service = new FeedService(fakeCache as any, {} as any, fakeReelRepo as any);

    const result = await service.getVendorFeed("v1", { userId: null, limit: 1 });

    expect(result.reels.map((r) => r.id)).toEqual(["r1"]);
    expect(result.nextCursor).toBe("1");
    const sql = calls.where.join("\n");
    expect(sql).toContain("reel_license_grants");
    expect(sql).toContain("collab_applications");
    expect(sql).toContain("vendor_members");
    expect(sql).not.toContain("reel_product_tags");
    expect(sql).not.toContain("products");
    expect(calls.params).toContainEqual({ vendorId: "v1" });
  });

  it("serves the vendor cohort in order when warm", async () => {
    const fakeCache = { getCohort: mock(async () => ["r2", "r1"]) };
    const fakeReelRepo = {
      findByIds: async (ids: string[]) => ids.map((id) => ({ id })),
    };
    const service = new FeedService(fakeCache as any, {} as any, fakeReelRepo as any);
    const result = await service.getVendorFeed("v1", { userId: null, limit: 20 });
    expect(result.reels.map((r) => r.id)).toEqual(["r2", "r1"]);
    expect(fakeCache.getCohort).toHaveBeenCalledWith("vendor:v1", 0, 60);
  });
});
