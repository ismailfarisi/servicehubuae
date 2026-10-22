import { describe, expect, test } from "bun:test";
import { UAE_AREAS } from "./areas.ts";
import { DEFAULT_ROLE_PERMISSIONS } from "./role-permissions.ts";

describe("UAE_AREAS seed data", () => {
  test("slugs are unique and URL-safe", () => {
    const slugs = UAE_AREAS.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  test("covers all seven emirates", () => {
    expect(new Set(UAE_AREAS.map((a) => a.emirate))).toEqual(
      new Set([
        "Dubai",
        "Abu Dhabi",
        "Sharjah",
        "Ajman",
        "Umm Al Quwain",
        "Ras Al Khaimah",
        "Fujairah",
      ]),
    );
  });
});

describe("DEFAULT_ROLE_PERMISSIONS", () => {
  test("seeds every vendor member role, owner with the widest grant", () => {
    expect(Object.keys(DEFAULT_ROLE_PERMISSIONS).sort()).toEqual([
      "manager",
      "owner",
      "staff",
      "viewer",
    ]);
    const owner = new Set(DEFAULT_ROLE_PERMISSIONS.owner);
    for (const perms of Object.values(DEFAULT_ROLE_PERMISSIONS)) {
      for (const p of perms) expect(owner.has(p)).toBe(true);
    }
    expect(owner.has("products.write")).toBe(true);
  });
});
