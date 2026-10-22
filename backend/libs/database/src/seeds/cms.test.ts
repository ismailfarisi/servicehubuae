import { describe, expect, test } from "bun:test";
import { SourceMode } from "../enums/layout.enums.ts";
import { HOME_SECTIONS, SECTION_TYPES } from "./cms.ts";

const isLocalized = (v: unknown) =>
  typeof v === "object" &&
  v !== null &&
  typeof (v as { en?: unknown }).en === "string" &&
  typeof (v as { ar?: unknown }).ar === "string" &&
  (v as { en: string }).en.length > 0 &&
  (v as { ar: string }).ar.length > 0;

describe("CMS seed data", () => {
  test("section type names are unique", () => {
    const names = SECTION_TYPES.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test("every home section uses a seeded section type", () => {
    const names = new Set(SECTION_TYPES.map((t) => t.name));
    for (const s of HOME_SECTIONS) expect(names.has(s.type)).toBe(true);
  });

  test("single-use section types appear at most once on the home page", () => {
    for (const t of SECTION_TYPES.filter((t) => t.max_per_layout === 1)) {
      expect(HOME_SECTIONS.filter((s) => s.type === t.name).length).toBeLessThanOrEqual(1);
    }
  });

  test("query sections name a source the cms resolver knows", () => {
    const known = new Set(["services", "categories", "areas", "vendors", "reels"]);
    for (const s of HOME_SECTIONS.filter((s) => s.source_mode === SourceMode.query)) {
      expect(known.has((s.data_source as { type: string }).type)).toBe(true);
    }
  });

  test("home copy is provided in English and Arabic", () => {
    for (const s of HOME_SECTIONS) {
      if (s.settings.title) expect(isLocalized(s.settings.title)).toBe(true);
      for (const b of s.blocks ?? []) {
        const data = b.data as Record<string, unknown>;
        expect(isLocalized(data.title)).toBe(true);
      }
    }
  });

  test("feature blocks use icons the storefront renders", () => {
    const icons = new Set([
      "search",
      "compare",
      "calendar",
      "check",
      "shield",
      "star",
      "tag",
      "map",
      "clock",
      "chat",
      "wallet",
      "sparkles",
    ]);
    for (const s of HOME_SECTIONS.filter((s) => s.type === "feature_grid")) {
      for (const b of s.blocks ?? []) {
        expect(icons.has((b.data as { icon: string }).icon)).toBe(true);
      }
    }
  });
});
