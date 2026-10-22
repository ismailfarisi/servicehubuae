import { describe, expect, it } from "bun:test";
import { ServiceSearchAdapter } from "./service-search.adapter.ts";
import { ServiceSuggestService, escapeLike } from "./service-suggest.service.ts";

const SERVICE = {
  id: "o1",
  slug: "haircut-1a2b3c4d",
  name: "Haircut",
  media_url: null,
  price_fils: 12000,
  vendor_name: "MyPickUAE Demo Salon",
};

describe("ServiceSuggestService", () => {
  it("returns services and categories, clamping the limit to 10", async () => {
    const calls: Array<[string, number]> = [];
    const svc = new ServiceSuggestService({
      suggestServices: async (q, limit) => {
        calls.push([q, limit]);
        return [SERVICE];
      },
      findCategories: async () => [
        { id: "c1", name: "Beauty & Wellness", slug: "beauty-wellness" },
      ],
    });
    const res = await svc.suggest("  hair ", 50);
    expect(calls).toEqual([["hair", 10]]);
    expect(res.services).toEqual([SERVICE]);
    expect(res.categories.map((c) => c.slug)).toEqual(["beauty-wellness"]);
  });

  it("short-circuits a blank query without touching either source", async () => {
    let touched = false;
    const svc = new ServiceSuggestService({
      suggestServices: async () => {
        touched = true;
        return [];
      },
      findCategories: async () => {
        touched = true;
        return [];
      },
    });
    expect(await svc.suggest("   ")).toEqual({ services: [], categories: [] });
    expect(touched).toBe(false);
  });

  it("degrades to category-only suggestions when Typesense is down", async () => {
    const svc = new ServiceSuggestService({
      suggestServices: async () => {
        throw new Error("ECONNREFUSED");
      },
      findCategories: async () => [{ id: "c2", name: "Home Cleaning", slug: "cleaning" }],
    });
    const res = await svc.suggest("clean");
    expect(res.services).toEqual([]);
    expect(res.categories).toHaveLength(1);
  });
});

describe("escapeLike", () => {
  it("escapes LIKE wildcards and backslashes", () => {
    expect(escapeLike("50%_off\\")).toBe("50\\%\\_off\\\\");
  });
});

describe("ServiceSearchAdapter.buildSuggestParams", () => {
  it("prefix-matches the name of published offerings only", () => {
    const params = new ServiceSearchAdapter().buildSuggestParams("hai", 25);
    expect(params.query_by).toBe("name");
    expect(params.prefix).toBe(true);
    expect(params.filter_by).toBe("status:=published");
    expect(params.per_page).toBe(10);
  });
});
