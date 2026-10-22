import { describe, expect, test } from "bun:test";
import { BidStatus, SourceMode } from "@servicehubuae/database";
import { LayoutResolverService } from "./layout-resolver.service.ts";

describe("LayoutResolverService.resolveBidded with previewBidId", () => {
  test("hot-swaps a pending bid into the top slot when its bid_id matches the section", async () => {
    const service = new LayoutResolverService();

    const section: any = {
      id: "section-A",
      bid_config: { slots: 2 },
      source_mode: SourceMode.bidded,
    };

    const winningBid = {
      id: "won-bid-1",
      vendor_id: "v1",
      product_id: "p1",
      content: { image: { desktop: { url: "won.jpg" } } },
      bid_amount_fils: 30000,
    };
    const previewBid = {
      id: "pending-bid-1",
      vendor_id: "v2",
      product_id: "p2",
      content: { image: { desktop: { url: "pending.jpg" } } },
      bid_amount_fils: 10000,
      section_id: "section-A",
      status: BidStatus.pending,
    };

    (service as any)._bidRepo = {
      createQueryBuilder: () => ({
        where: () => ({
          andWhere: () => ({
            andWhere: () => ({
              andWhere: () => ({
                orderBy: () => ({
                  take: () => ({ getMany: async () => [winningBid] }),
                }),
              }),
            }),
          }),
        }),
      }),
      findOne: async () => previewBid,
    };

    const result = await (service as any).resolveBidded(section, "pending-bid-1");

    expect(result).toHaveLength(2);
    expect(result[0].bid_id).toBe("pending-bid-1");
    expect(result[1].bid_id).toBe("won-bid-1");
  });

  test("ignores previewBidId when bid is on a different section", async () => {
    const service = new LayoutResolverService();
    const section: any = {
      id: "section-A",
      bid_config: { slots: 4 },
      source_mode: SourceMode.bidded,
    };
    (service as any)._bidRepo = {
      createQueryBuilder: () => ({
        where: () => ({
          andWhere: () => ({
            andWhere: () => ({
              andWhere: () => ({
                orderBy: () => ({ take: () => ({ getMany: async () => [] }) }),
              }),
            }),
          }),
        }),
      }),
      findOne: async () => ({
        id: "preview-bid",
        section_id: "section-B",
        bid_amount_fils: 1,
        content: {},
      }),
    };
    const result = await (service as any).resolveBidded(section, "preview-bid");
    expect(result).toEqual([]);
  });

  test("ignores previewBidId when bid does not exist", async () => {
    const service = new LayoutResolverService();
    const section: any = {
      id: "section-A",
      bid_config: { slots: 4 },
      source_mode: SourceMode.bidded,
    };
    (service as any)._bidRepo = {
      createQueryBuilder: () => ({
        where: () => ({
          andWhere: () => ({
            andWhere: () => ({
              andWhere: () => ({
                orderBy: () => ({ take: () => ({ getMany: async () => [] }) }),
              }),
            }),
          }),
        }),
      }),
      findOne: async () => null,
    };
    const result = await (service as any).resolveBidded(section, "missing-bid");
    expect(result).toEqual([]);
  });
});

describe("LayoutResolverService.resolveBidded — vendor_showcase hydration", () => {
  const buildBidRepo = (winningBids: any[]) => ({
    createQueryBuilder: () => ({
      where: () => ({
        andWhere: () => ({
          andWhere: () => ({
            andWhere: () => ({
              orderBy: () => ({ take: () => ({ getMany: async () => winningBids }) }),
            }),
          }),
        }),
      }),
    }),
    findOne: async () => null,
  });

  test("merges name/logo_url/rating_avg/slug into vendor_showcase items", async () => {
    const service = new LayoutResolverService();
    const section: any = {
      id: "vs-1",
      bid_config: { slots: 2 },
      source_mode: SourceMode.bidded,
      section_type: { name: "vendor_showcase", scope: "platform" },
    };
    (service as any)._bidRepo = buildBidRepo([
      { id: "bid-1", vendor_id: "v-1", product_id: null, content: null, bid_amount_fils: 50000 },
      { id: "bid-2", vendor_id: "v-2", product_id: null, content: null, bid_amount_fils: 30000 },
    ]);
    (service as any)._vendorRepo = {
      find: async () => [
        {
          id: "v-1",
          slug: "alpha",
          name: "Alpha Beauty",
          logo_url: "alpha.png",
          rating_avg: "4.50",
          total_orders: 12,
          follower_count: 88,
        },
        {
          id: "v-2",
          slug: "beta",
          name: "Beta Glow",
          logo_url: null,
          rating_avg: "0.00",
          total_orders: 0,
          follower_count: 0,
        },
      ],
    };

    const result = await (service as any).resolveBidded(section);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: "v-1",
      bid_id: "bid-1",
      sponsored: true,
      name: "Alpha Beauty",
      slug: "alpha",
      logo_url: "alpha.png",
      rating_avg: "4.50",
      total_orders: 12,
      follower_count: 88,
    });
    expect(result[1]).toMatchObject({
      id: "v-2",
      bid_id: "bid-2",
      name: "Beta Glow",
      slug: "beta",
      logo_url: null,
    });
  });

  test("drops items whose vendor was soft-deleted (not returned by repo)", async () => {
    const service = new LayoutResolverService();
    const section: any = {
      id: "vs-2",
      bid_config: { slots: 2 },
      source_mode: SourceMode.bidded,
      section_type: { name: "vendor_showcase", scope: "platform" },
    };
    (service as any)._bidRepo = buildBidRepo([
      { id: "bid-x", vendor_id: "v-gone", product_id: null, content: null, bid_amount_fils: 50000 },
    ]);
    (service as any)._vendorRepo = { find: async () => [] };

    const result = await (service as any).resolveBidded(section);
    expect(result).toEqual([]);
  });

  test("does not hydrate non-vendor_showcase bidded sections via vendor lookup", async () => {
    const service = new LayoutResolverService();
    const section: any = {
      id: "pc-1",
      bid_config: { slots: 1 },
      source_mode: SourceMode.bidded,
      section_type: { name: "product_carousel", scope: "platform" },
    };
    (service as any)._bidRepo = buildBidRepo([
      { id: "bid-p", vendor_id: "v-1", product_id: "p-1", content: null, bid_amount_fils: 1000 },
    ]);
    let vendorRepoCalled = false;
    (service as any)._vendorRepo = {
      find: async () => {
        vendorRepoCalled = true;
        return [];
      },
    };

    const originalFetch = globalThis.fetch;
    (globalThis as any).fetch = async () => ({ ok: false }) as any;
    try {
      await (service as any).resolveBidded(section);
    } finally {
      globalThis.fetch = originalFetch;
    }
    expect(vendorRepoCalled).toBe(false);
  });
});

describe("LayoutResolverService.resolveBidded — service carousel hydration", () => {
  const buildBidRepo = (winningBids: any[]) => ({
    createQueryBuilder: () => ({
      where: () => ({
        andWhere: () => ({
          andWhere: () => ({
            andWhere: () => ({
              orderBy: () => ({ take: () => ({ getMany: async () => winningBids }) }),
            }),
          }),
        }),
      }),
    }),
    findOne: async () => null,
  });

  test("merges catalog service fields onto sponsored items", async () => {
    const service = new LayoutResolverService();
    const section: any = {
      id: "pc-1",
      bid_config: { slots: 2 },
      source_mode: SourceMode.bidded,
      section_type: { name: "service_carousel", scope: "platform" },
    };
    (service as any)._bidRepo = buildBidRepo([
      { id: "bid-1", vendor_id: "v-1", product_id: "s-1", content: null, bid_amount_fils: 5000 },
      { id: "bid-2", vendor_id: "v-2", product_id: "s-2", content: null, bid_amount_fils: 3000 },
    ]);

    const services: Record<string, any> = {
      "s-1": { id: "s-1", name: "Deep Cleaning", slug: "deep-cleaning", price_fils: 15000 },
      "s-2": { id: "s-2", name: "AC Service", slug: "ac-service", price_fils: 20000 },
    };
    const capturedUrls: string[] = [];
    const originalFetch = globalThis.fetch;
    (globalThis as any).fetch = async (url: string) => {
      capturedUrls.push(url);
      const id = url.split("/services/by-id/")[1] ?? "";
      return { ok: true, json: async () => ({ data: services[id] }) } as any;
    };
    try {
      const result = await (service as any).resolveBidded(section);
      expect(capturedUrls).toHaveLength(2);
      expect(capturedUrls[0]).toContain(":3002/services/by-id/s-1");
      expect(capturedUrls[1]).toContain(":3002/services/by-id/s-2");
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: "s-1",
        name: "Deep Cleaning",
        slug: "deep-cleaning",
        price_fils: 15000,
        sponsored: true,
        bid_id: "bid-1",
        product_id: "s-1",
      });
      expect(result[1]).toMatchObject({
        id: "s-2",
        name: "AC Service",
        sponsored: true,
        bid_id: "bid-2",
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("still hydrates legacy product_carousel sections from catalog", async () => {
    const service = new LayoutResolverService();
    const section: any = {
      id: "pc-legacy",
      bid_config: { slots: 1 },
      source_mode: SourceMode.bidded,
      section_type: { name: "product_carousel", scope: "platform" },
    };
    (service as any)._bidRepo = buildBidRepo([
      { id: "bid-1", vendor_id: "v-1", product_id: "s-1", content: null, bid_amount_fils: 5000 },
    ]);
    const originalFetch = globalThis.fetch;
    (globalThis as any).fetch = async () =>
      ({ ok: true, json: async () => ({ data: { id: "s-1", name: "Deep Cleaning" } }) }) as any;
    try {
      const result = await (service as any).resolveBidded(section);
      expect(result).toEqual([
        { id: "s-1", name: "Deep Cleaning", sponsored: true, bid_id: "bid-1", product_id: "s-1" },
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("drops items whose service was not returned (deleted/unpublished)", async () => {
    const service = new LayoutResolverService();
    const section: any = {
      id: "pc-2",
      bid_config: { slots: 2 },
      source_mode: SourceMode.bidded,
      section_type: { name: "service_carousel", scope: "platform" },
    };
    (service as any)._bidRepo = buildBidRepo([
      { id: "bid-x", vendor_id: "v-1", product_id: "s-gone", content: null, bid_amount_fils: 1000 },
    ]);
    const originalFetch = globalThis.fetch;
    (globalThis as any).fetch = async () =>
      ({ ok: false, status: 404, json: async () => ({ statusCode: 404 }) }) as any;
    try {
      const result = await (service as any).resolveBidded(section);
      expect(result).toEqual([]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("returns empty when catalog-service call fails (fail-soft)", async () => {
    const service = new LayoutResolverService();
    const section: any = {
      id: "pc-3",
      bid_config: { slots: 1 },
      source_mode: SourceMode.bidded,
      section_type: { name: "service_carousel", scope: "platform" },
    };
    (service as any)._bidRepo = buildBidRepo([
      { id: "bid-y", vendor_id: "v-1", product_id: "p-1", content: null, bid_amount_fils: 500 },
    ]);
    const originalFetch = globalThis.fetch;
    (globalThis as any).fetch = async () => {
      throw new Error("network down");
    };
    try {
      const result = await (service as any).resolveBidded(section);
      expect(result).toEqual([]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("LayoutResolverService.resolve — vendor context", () => {
  const baseSectionType = (name: string, scope: "platform" | "vendor" | "both" = "both") => ({
    id: `st-${name}`,
    name,
    scope,
  });

  const buildLayout = (overrides: Partial<any> = {}) => ({
    id: overrides.id ?? "layout-1",
    slug: overrides.slug ?? "vendor-storefront",
    vendor_id: overrides.vendor_id ?? "vendor-1",
    published_version_id: overrides.published_version_id ?? "ver-1",
    published_version: overrides.published_version ?? { version_number: 1 },
    ...overrides,
  });

  const buildSection = (overrides: Partial<any> = {}) => ({
    id: overrides.id ?? "sec-1",
    section_type: overrides.section_type ?? baseSectionType("product_carousel", "both"),
    position: overrides.position ?? 0,
    enabled: overrides.enabled ?? true,
    visibility: overrides.visibility ?? { mobile: true, web: true },
    targeting: overrides.targeting ?? null,
    settings: overrides.settings ?? {},
    source_mode: overrides.source_mode ?? "manual",
    blocks: overrides.blocks ?? [],
    data_source: overrides.data_source ?? null,
    ...overrides,
  });

  const buildVendor = () => ({
    id: "vendor-1",
    slug: "luxe-beauty",
    name: "Luxe Beauty",
    logo_url: "https://example.com/logo.png",
    banner_url: "https://example.com/banner.jpg",
  });

  test("returns owner='vendor' when vendor has a published layout", async () => {
    const service = new LayoutResolverService();
    const vendorLayout = buildLayout();
    (service as any)._vendorRepo = { findOne: async () => buildVendor() };
    (service as any)._layoutRepo = { findOne: async () => vendorLayout };
    (service as any)._sectionRepo = {
      find: async () => [buildSection()],
    };

    const result = await service.resolve("vendor-storefront", "en", "web", undefined, "vendor-1");
    expect(result.owner).toBe("vendor");
    expect(result.vendor_context?.id).toBe("vendor-1");
  });

  test("falls back to admin template when vendor has no published layout", async () => {
    const service = new LayoutResolverService();
    const adminTemplate = buildLayout({
      id: "tpl-1",
      slug: "vendor-default",
      vendor_id: null,
      published_version_id: "ver-tpl-1",
    });

    let lookupCount = 0;
    (service as any)._vendorRepo = { findOne: async () => buildVendor() };
    (service as any)._layoutRepo = {
      findOne: async (opts: any) => {
        lookupCount++;
        if (lookupCount === 1) {
          // First lookup: vendor-owned. Return null (no vendor layout).
          return null;
        }
        // Second lookup: admin template.
        expect(opts.where.slug).toBe("vendor-default");
        return adminTemplate;
      },
    };
    (service as any)._sectionRepo = { find: async () => [buildSection()] };

    const result = await service.resolve("vendor-storefront", "en", "web", undefined, "vendor-1");
    expect(result.owner).toBe("admin_template");
    expect(result.slug).toBe("vendor-default");
    expect(result.vendor_context?.id).toBe("vendor-1");
  });

  test("filters out platform-scope sections on vendor pages", async () => {
    const service = new LayoutResolverService();
    (service as any)._vendorRepo = { findOne: async () => buildVendor() };
    (service as any)._layoutRepo = { findOne: async () => buildLayout() };
    (service as any)._sectionRepo = {
      find: async () => [
        buildSection({
          id: "sec-keep",
          section_type: baseSectionType("product_carousel", "both"),
          position: 0,
        }),
        buildSection({
          id: "sec-drop",
          section_type: baseSectionType("vendor_showcase", "platform"),
          position: 1,
        }),
      ],
    };

    const result = await service.resolve("vendor-storefront", "en", "web", undefined, "vendor-1");
    expect(result.sections.map((s) => s.type)).toEqual(["product_carousel"]);
  });

  test("injects vendor_id into query-mode sections of allowed types", async () => {
    const service = new LayoutResolverService();
    (service as any)._vendorRepo = { findOne: async () => buildVendor() };
    (service as any)._layoutRepo = { findOne: async () => buildLayout() };
    (service as any)._sectionRepo = {
      find: async () => [
        buildSection({
          source_mode: "query",
          data_source: { type: "categories", query: { depth: 2 } },
        }),
      ],
    };

    let capturedUrl = "";
    const originalFetch = globalThis.fetch;
    (globalThis as any).fetch = async (url: string) => {
      capturedUrl = url;
      return { ok: true, json: async () => ({ data: [] }) } as any;
    };
    try {
      await service.resolve("vendor-storefront", "en", "web", undefined, "vendor-1");
      // catalog's /categories/tree expects snake_case `vendor_id`; the resolver maps per-type.
      expect(capturedUrl).toContain(":3002/categories/tree?");
      expect(capturedUrl).toContain("vendor_id=vendor-1");
      expect(capturedUrl).toContain("depth=2");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("filters out unscopable query types on vendor pages (returns empty items)", async () => {
    const service = new LayoutResolverService();
    (service as any)._vendorRepo = { findOne: async () => buildVendor() };
    (service as any)._layoutRepo = { findOne: async () => buildLayout() };
    (service as any)._sectionRepo = {
      find: async () => [
        buildSection({
          source_mode: "query",
          // catalog's GET /services has no vendor filter, so it must not
          // render on a vendor page (it would list every vendor's services).
          data_source: { type: "services", query: {} },
        }),
      ],
    };

    let fetchCalled = false;
    const originalFetch = globalThis.fetch;
    (globalThis as any).fetch = async () => {
      fetchCalled = true;
      return { ok: true, json: async () => ({ data: [] }) } as any;
    };
    try {
      const result = await service.resolve("vendor-storefront", "en", "web", undefined, "vendor-1");
      expect(fetchCalled).toBe(false);
      expect((result.sections[0]?.data as any).items ?? []).toEqual([]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("throws VENDOR_NOT_FOUND when vendor doesn't exist", async () => {
    const service = new LayoutResolverService();
    (service as any)._vendorRepo = { findOne: async () => null };
    (service as any)._layoutRepo = {
      findOne: async () => {
        throw new Error("Should not call layoutRepo when vendor missing");
      },
    };

    await expect(
      service.resolve("vendor-storefront", "en", "web", undefined, "vendor-1"),
    ).rejects.toMatchObject({ code: "VENDOR_NOT_FOUND" });
  });

  test("throws LAYOUT_NOT_PUBLISHED when vendor exists but no layout/template published", async () => {
    const service = new LayoutResolverService();
    (service as any)._vendorRepo = { findOne: async () => buildVendor() };
    (service as any)._layoutRepo = { findOne: async () => null };

    await expect(
      service.resolve("vendor-storefront", "en", "web", undefined, "vendor-1"),
    ).rejects.toMatchObject({ code: "LAYOUT_NOT_PUBLISHED" });
  });

  test("when contextVendorId absent, response has no owner/vendor_context fields", async () => {
    const service = new LayoutResolverService();
    (service as any)._layoutRepo = {
      findOne: async () => buildLayout({ vendor_id: null, slug: "homepage" }),
    };
    (service as any)._sectionRepo = { find: async () => [] };

    const result = await service.resolve("homepage", "en", "web");
    expect((result as any).owner).toBeUndefined();
    expect((result as any).vendor_context).toBeUndefined();
  });
});

describe("LayoutResolverService.resolveQuery — catalog sources", () => {
  const withFetch = async (body: unknown, fn: (fetched: string[]) => Promise<void>) => {
    const fetched: string[] = [];
    const restore = globalThis.fetch;
    (globalThis as any).fetch = async (url: string) => {
      fetched.push(url);
      return { ok: true, json: async () => body } as any;
    };
    try {
      await fn(fetched);
    } finally {
      (globalThis as any).fetch = restore;
    }
  };

  test("services hits catalog GET /services and returns the listing array", async () => {
    const service = new LayoutResolverService();
    await withFetch(
      { statusCode: 200, data: [{ id: "s1", name: "Deep Cleaning" }], total: 1 },
      async (fetched) => {
        const items = await (service as any).resolveQuery({
          type: "services",
          query: { category: "cleaning", limit: 8 },
        });
        expect(fetched).toHaveLength(1);
        expect(fetched[0]).toContain(":3002/services?");
        expect(fetched[0]).toContain("category=cleaning");
        expect(fetched[0]).toContain("limit=8");
        expect(items).toEqual([{ id: "s1", name: "Deep Cleaning" }]);
      },
    );
  });

  test("legacy products sections resolve from catalog GET /services", async () => {
    const service = new LayoutResolverService();
    await withFetch({ data: [{ id: "s1" }] }, async (fetched) => {
      const items = await (service as any).resolveQuery({ type: "products", query: { limit: 4 } });
      expect(fetched[0]).toContain(":3002/services?limit=4");
      expect(items).toEqual([{ id: "s1" }]);
    });
  });

  test("categories hits catalog GET /categories/tree", async () => {
    const service = new LayoutResolverService();
    await withFetch({ data: [{ id: "c1", slug: "cleaning" }] }, async (fetched) => {
      const items = await (service as any).resolveQuery({ type: "categories", query: {} });
      expect(fetched[0]).toContain(":3002/categories/tree");
      expect(items).toEqual([{ id: "c1", slug: "cleaning" }]);
    });
  });

  test("areas hits catalog GET /areas", async () => {
    const service = new LayoutResolverService();
    await withFetch({ data: [{ id: "a1", slug: "dubai-marina" }] }, async (fetched) => {
      const items = await (service as any).resolveQuery({ type: "areas", query: {} });
      expect(fetched[0]).toContain(":3002/areas");
      expect(items).toEqual([{ id: "a1", slug: "dubai-marina" }]);
    });
  });

  test("areas are not offered on vendor pages", async () => {
    const service = new LayoutResolverService();
    await withFetch({ data: [{ id: "a1" }] }, async (fetched) => {
      const items = await (service as any).resolveQuery({ type: "areas", query: {} }, "vendor-1");
      expect(fetched).toHaveLength(0);
      expect(items).toEqual([]);
    });
  });

  for (const type of ["brands", "brand_spotlight", "flash_deals", "collection"]) {
    test(`removed product-era source "${type}" resolves to no items without a fetch`, async () => {
      const service = new LayoutResolverService();
      await withFetch({ data: [{ id: "x" }] }, async (fetched) => {
        const items = await (service as any).resolveQuery({
          type,
          query: { collection_slug: "summer-picks", limit: 8 },
        });
        expect(fetched).toHaveLength(0);
        expect(items).toEqual([]);
      });
    });
  }
});

describe("LayoutResolverService.resolveSection — response shape", () => {
  test("does not leak data_source to the storefront", async () => {
    const service = new LayoutResolverService();
    const restore = globalThis.fetch;
    (globalThis as any).fetch = async () => ({ ok: true, json: async () => ({ data: [] }) }) as any;
    try {
      const resolved = await (service as any).resolveSection({
        id: "sec-1",
        section_type: { name: "service_carousel" },
        position: 0,
        settings: {},
        source_mode: "query",
        blocks: [],
        data_source: { type: "services", query: { limit: 5 } },
      });
      expect(resolved.data_source).toBeUndefined();
      expect(resolved.collection_slug).toBeUndefined();
      expect(resolved.data).toEqual({ items: [] });
    } finally {
      (globalThis as any).fetch = restore;
    }
  });
});
