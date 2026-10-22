import { describe, expect, it } from "bun:test";
import type { Area } from "@mypickuae/database";
import { AreaService } from "./area.service.ts";

function makeArea(over: Partial<Area> = {}): Area {
  return {
    id: "a1",
    name: "Dubai Marina",
    slug: "dubai-marina",
    city: "Dubai",
    emirate: "Dubai",
    country_code: "AE",
    is_active: true,
    sort_order: 1,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    ...over,
  };
}

function makeRepo(rows: Area[]) {
  return {
    rows,
    find: async (opts: { where?: { is_active?: boolean } } = {}) =>
      rows.filter((r) => !r.deleted_at && (opts.where?.is_active === undefined || r.is_active)),
    findOne: async ({ where }: { where: Partial<Area> }) =>
      rows.find(
        (r) =>
          !r.deleted_at &&
          (where.id === undefined || r.id === where.id) &&
          (where.slug === undefined || r.slug === where.slug),
      ) ?? null,
    create: (a: Partial<Area>) => ({ ...makeArea(), id: `new-${rows.length}`, ...a }) as Area,
    save: async (a: Area) => {
      const i = rows.findIndex((r) => r.id === a.id);
      if (i >= 0) rows[i] = a;
      else rows.push(a);
      return a;
    },
    softRemove: async (a: Area) => {
      a.deleted_at = new Date();
      return a;
    },
  };
}

function makeService(rows: Area[], vendorIds: string[] = []) {
  const repo = makeRepo(rows);
  const resynced: string[] = [];
  const svc = new AreaService(repo as never, {
    findVendorIdsUsingArea: async () => vendorIds,
    onVendorAreasChanged: async (vendorId) => {
      resynced.push(vendorId);
    },
  });
  return { svc, repo, resynced };
}

describe("AreaService", () => {
  it("listPublic returns only active areas in the public shape", async () => {
    const { svc } = makeService([
      makeArea(),
      makeArea({ id: "a2", slug: "jlt", name: "JLT", is_active: false }),
    ]);
    const list = await svc.listPublic();
    expect(list.map((a) => a.slug)).toEqual(["dubai-marina"]);
    expect(Object.keys(list[0] ?? {})).not.toContain("created_at");
  });

  it("create derives the slug from the name and defaults country_code", async () => {
    const { svc } = makeService([]);
    const area = await svc.create({
      name: "Al Ain (Abu Dhabi)",
      city: "Al Ain",
      emirate: "Abu Dhabi",
    });
    expect(area.slug).toBe("al-ain-abu-dhabi");
    expect(area.country_code).toBe("AE");
  });

  it("create rejects a duplicate slug with 409", async () => {
    const { svc } = makeService([makeArea()]);
    await expect(
      svc.create({ name: "Dubai Marina", city: "Dubai", emirate: "Dubai" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("update re-indexes vendors only when a search-visible field changes", async () => {
    const { svc, resynced } = makeService([makeArea()], ["v1", "v2"]);
    await svc.update("a1", { sort_order: 5 });
    expect(resynced).toEqual([]);
    await svc.update("a1", { name: "Dubai Marina Walk" });
    expect(resynced).toEqual(["v1", "v2"]);
  });

  it("remove soft-deletes and re-indexes the vendors using the area", async () => {
    const { svc, repo, resynced } = makeService([makeArea()], ["v9"]);
    await svc.remove("a1");
    expect(repo.rows[0]?.deleted_at).toBeInstanceOf(Date);
    expect(resynced).toEqual(["v9"]);
  });

  it("update/remove 404 for an unknown id", async () => {
    const { svc } = makeService([]);
    await expect(svc.update("nope", { name: "x" })).rejects.toMatchObject({ statusCode: 404 });
    await expect(svc.remove("nope")).rejects.toMatchObject({ statusCode: 404 });
  });
});
