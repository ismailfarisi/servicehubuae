import { afterEach, describe, expect, it } from "bun:test";
import {
  AppDataSource,
  CollabApplication,
  CollabEvent,
  CollabEventType,
  CollabOpportunity,
  CollabOpportunityStatus,
  CollabOpportunityType,
  CollabVisibility,
  SiteSetting,
  User,
  Vendor,
} from "@mypickuae/database";
import { CollabService } from "./collab.service.ts";

/** Phase 1/2 collab types move no money; any escrow call here is a bug. */
const fakeEscrow = {
  placeHold: async () => {
    throw new Error("escrow must not be touched by a non-paid collab");
  },
  releaseActiveHold: async () => false,
  captureAndComplete: async () => {
    throw new Error("escrow must not be touched by a non-paid collab");
  },
};

/**
 * CollabService runs everything through AppDataSource.transaction, so the fake
 * below stands in for the EntityManager: one in-memory repo per entity, with
 * `findOne` honouring the pessimistic lock option as a no-op.
 */
function makeHarness(seed: { opportunity?: Partial<CollabOpportunity>; committed?: number } = {}) {
  const opportunities: any[] = [];
  const events: any[] = [];
  let idSeq = 0;

  if (seed.opportunity) {
    opportunities.push({
      id: "opp-1",
      vendor_id: "v1",
      type: CollabOpportunityType.paid_campaign,
      visibility: CollabVisibility.board,
      status: CollabOpportunityStatus.draft,
      title: "t",
      description: "d",
      slots_total: 1,
      slots_filled: 0,
      applications_close_at: new Date("2026-12-01T00:00:00Z"),
      fee_fils: "50000",
      funding_source: "payout_balance",
      location_id: null,
      starts_at: null,
      ends_at: null,
      ...seed.opportunity,
    });
  }

  const repoFor = (entity: unknown) => {
    if (entity === CollabOpportunity) {
      return {
        findOne: async ({ where }: any) => opportunities.find((o) => o.id === where.id) ?? null,
        create: (x: any) => ({ id: `opp-${++idSeq}`, ...x }),
        save: async (x: any) => {
          const i = opportunities.findIndex((o) => o.id === x.id);
          if (i >= 0) opportunities[i] = x;
          else opportunities.push(x);
          return x;
        },
        find: async () => opportunities,
      };
    }
    if (entity === CollabEvent) {
      return {
        create: (x: any) => ({ id: `ev-${++idSeq}`, ...x }),
        save: async (x: any) => {
          events.push(x);
          return x;
        },
        find: async () => events,
      };
    }
    if (entity === CollabApplication) {
      return { count: async () => seed.committed ?? 0 };
    }
    // approveDelivery reads the shared platform fee rate; null falls back to the default.

    if (entity === SiteSetting) return { findOne: async () => null };

    throw new Error(`unexpected repository request: ${String(entity)}`);
  };

  const manager = { getRepository: repoFor } as any;

  const originalTransaction = AppDataSource.transaction;
  const originalGetRepository = AppDataSource.getRepository;
  (AppDataSource as any).transaction = async (cb: any) => cb(manager);
  (AppDataSource as any).getRepository = repoFor;

  const restore = () => {
    (AppDataSource as any).transaction = originalTransaction;
    (AppDataSource as any).getRepository = originalGetRepository;
  };

  return { svc: new CollabService(fakeEscrow as any), opportunities, events, restore };
}

let harness: ReturnType<typeof makeHarness> | null = null;
const use = (seed?: Parameters<typeof makeHarness>[0]) => {
  harness = makeHarness(seed);
  return harness;
};

afterEach(() => {
  harness?.restore();
  harness = null;
});

const baseCreate = {
  vendorId: "v1",
  type: CollabOpportunityType.paid_campaign,
  visibility: CollabVisibility.board,
  title: "Feature our salon",
  description: "Post a reel about your visit",
  feeFils: 50_000,
  fundingSource: "payout_balance" as any,
  applicationsCloseAt: new Date("2026-12-01T00:00:00Z"),
};

describe("CollabService.createOpportunity", () => {
  it("starts in draft and records a `created` event", async () => {
    const { svc, events } = use();
    const opp = await svc.createOpportunity(baseCreate);
    expect(opp.status).toBe(CollabOpportunityStatus.draft);
    expect(opp.vendor_id).toBe("v1");
    expect(events).toHaveLength(1);
    expect(events[0].event_type).toBe(CollabEventType.created);
  });

  it("defaults slots_total to 1 and slots_filled to 0", async () => {
    const { svc } = use();
    const opp = await svc.createOpportunity(baseCreate);
    expect(opp.slots_total).toBe(1);
    expect(opp.slots_filled).toBe(0);
  });

  it("stores fee as a string, since bigint columns round-trip as strings", async () => {
    const { svc } = use();
    const opp = await svc.createOpportunity({ ...baseCreate, feeFils: 24_900 });
    expect(opp.fee_fils).toBe("24900");
  });

  it("accepts paid_campaign now that phase 3 has landed its money path", async () => {
    const { svc } = use();
    const opp = await svc.createOpportunity({
      ...baseCreate,
      type: CollabOpportunityType.paid_campaign,
      feeFils: 50_000,
      fundingSource: "stripe" as any,
    });
    expect(opp.type).toBe(CollabOpportunityType.paid_campaign);
    expect(opp.fee_fils).toBe("50000");
  });

  it("still rejects a paid_campaign with no fee", async () => {
    const { svc } = use();
    await expect(
      svc.createOpportunity({
        ...baseCreate,
        type: CollabOpportunityType.paid_campaign,
        feeFils: undefined,
      }),
    ).rejects.toThrow("fee_required");
  });

  it("rejects an event_appearance with no venue or slot", async () => {
    // Phase 4 opened this type; the per-type field guard still applies.
    const { svc } = use();
    await expect(
      svc.createOpportunity({ ...baseCreate, type: CollabOpportunityType.event_appearance }),
    ).rejects.toThrow("location_required");
  });

  it("rejects product_seeding with 422 now that products are gone", async () => {
    const { svc } = use();
    await expect(
      svc.createOpportunity({ ...baseCreate, type: CollabOpportunityType.product_seeding }),
    ).rejects.toThrow("product_seeding_unavailable");
  });

  it("rejects slots_total of 0", async () => {
    const { svc } = use();
    await expect(svc.createOpportunity({ ...baseCreate, slotsTotal: 0 })).rejects.toThrow(
      "slots_total_invalid",
    );
  });
});

describe("CollabService.publishOpportunity", () => {
  it("moves draft -> open and records `published`", async () => {
    const { svc, events } = use({ opportunity: {} });
    const opp = await svc.publishOpportunity("v1", "opp-1");
    expect(opp.status).toBe(CollabOpportunityStatus.open);
    expect(events.at(-1).event_type).toBe(CollabEventType.published);
  });

  it("refuses a board opportunity with no closing date", async () => {
    // Without one it can never expire, so it would sit open forever and the
    // sweep job would never reach it.
    const { svc } = use({ opportunity: { applications_close_at: null } });
    await expect(svc.publishOpportunity("v1", "opp-1")).rejects.toThrow("close_date_required");
  });

  it("allows a direct opportunity with no closing date", async () => {
    const { svc } = use({
      opportunity: { visibility: CollabVisibility.direct, applications_close_at: null },
    });
    const opp = await svc.publishOpportunity("v1", "opp-1");
    expect(opp.status).toBe(CollabOpportunityStatus.open);
  });

  it("refuses to republish an already-open opportunity", async () => {
    const { svc } = use({ opportunity: { status: CollabOpportunityStatus.open } });
    await expect(svc.publishOpportunity("v1", "opp-1")).rejects.toThrow("opportunity_not_draft");
  });

  it("refuses a vendor publishing someone else's opportunity", async () => {
    const { svc } = use({ opportunity: {} });
    await expect(svc.publishOpportunity("v-other", "opp-1")).rejects.toThrow(
      "not_your_opportunity",
    );
  });

  it("404s on an unknown opportunity", async () => {
    const { svc } = use();
    await expect(svc.publishOpportunity("v1", "nope")).rejects.toThrow("opportunity_not_found");
  });
});

describe("CollabService.cancelOpportunity", () => {
  it("cancels an open opportunity with no committed creators", async () => {
    const { svc, opportunities, events } = use({
      opportunity: { status: CollabOpportunityStatus.open },
    });
    await svc.cancelOpportunity("v1", "opp-1");
    expect(opportunities[0].status).toBe(CollabOpportunityStatus.cancelled);
    expect(events.at(-1).event_type).toBe(CollabEventType.cancelled);
  });

  it("refuses once any application is accepted", async () => {
    const { svc } = use({ opportunity: { status: CollabOpportunityStatus.open }, committed: 1 });
    await expect(svc.cancelOpportunity("v1", "opp-1")).rejects.toThrow("has_accepted_applications");
  });

  it("refuses to cancel a completed opportunity", async () => {
    const { svc } = use({ opportunity: { status: CollabOpportunityStatus.completed } });
    await expect(svc.cancelOpportunity("v1", "opp-1")).rejects.toThrow(
      "opportunity_not_cancellable",
    );
  });
});

describe("CollabService.updateOpportunity", () => {
  it("applies a partial patch", async () => {
    const { svc } = use({ opportunity: {} });
    const opp = await svc.updateOpportunity("v1", "opp-1", { title: "New title" });
    expect(opp.title).toBe("New title");
    expect(opp.description).toBe("d");
  });

  it("has no way to change `type` — it is absent from the patch shape", async () => {
    const { svc } = use({ opportunity: {} });
    const opp = await svc.updateOpportunity("v1", "opp-1", {
      // @ts-expect-error type is deliberately excluded from UpdateOpportunityInput
      type: CollabOpportunityType.event_appearance,
    });
    expect(opp.type).toBe(CollabOpportunityType.paid_campaign);
  });

  it("refuses to shrink slots_total below slots_filled", async () => {
    const { svc } = use({ opportunity: { slots_total: 5, slots_filled: 3 } });
    await expect(svc.updateOpportunity("v1", "opp-1", { slotsTotal: 2 })).rejects.toThrow(
      "slots_total_below_filled",
    );
  });

  it("refuses a patch that would break the type's required fields", async () => {
    const { svc } = use({ opportunity: {} });
    await expect(svc.updateOpportunity("v1", "opp-1", { feeFils: 0 })).rejects.toThrow(
      "fee_required",
    );
  });

  it("refuses to edit a cancelled opportunity", async () => {
    const { svc } = use({ opportunity: { status: CollabOpportunityStatus.cancelled } });
    await expect(svc.updateOpportunity("v1", "opp-1", { title: "x" })).rejects.toThrow(
      "opportunity_not_editable",
    );
  });

  it("refuses another vendor's opportunity", async () => {
    const { svc } = use({ opportunity: {} });
    await expect(svc.updateOpportunity("v-other", "opp-1", { title: "x" })).rejects.toThrow(
      "not_your_opportunity",
    );
  });
});

/**
 * Shared read-repo stub for the hydration describe blocks below. No
 * where-filtering — each test seeds exactly the rows it expects a query to
 * return, so ignoring the (TypeORM-internal-shaped) `where` clause is both
 * simpler and doesn't depend on FindOperator internals.
 */
function patchReadRepos(seed: {
  opportunities: any[];
  applications?: any[];
  vendors?: any[];
  users?: any[];
}) {
  const repoFor = (entity: unknown) => {
    if (entity === CollabOpportunity) {
      return {
        find: async () => seed.opportunities,
        findOne: async ({ where }: any) =>
          seed.opportunities.find((o) => o.id === where.id) ?? null,
      };
    }
    if (entity === CollabApplication) {
      return { find: async () => seed.applications ?? [] };
    }
    if (entity === Vendor) {
      return { find: async () => seed.vendors ?? [] };
    }
    if (entity === User) {
      return { find: async () => seed.users ?? [] };
    }
    throw new Error(`unexpected repository request: ${String(entity)}`);
  };
  const original = AppDataSource.getRepository;
  (AppDataSource as any).getRepository = repoFor;
  return () => {
    (AppDataSource as any).getRepository = original;
  };
}

describe("listBoard and listApplicationsForCreator hydration", () => {
  const baseOpp = {
    id: "opp-1",
    vendor_id: "v1",
    type: CollabOpportunityType.paid_campaign,
    visibility: CollabVisibility.board,
    status: CollabOpportunityStatus.open,
    title: "Feature our salon",
    description: "d",
    slots_total: 3,
    slots_filled: 0,
    applications_close_at: new Date("2026-12-01T00:00:00Z"),
    fee_fils: "50000",
    min_follower_count: null,
    required_categories: null,
    required_platforms: null,
  };

  it("hydrates vendor identity onto board rows", async () => {
    const restore = patchReadRepos({
      opportunities: [baseOpp],
      vendors: [{ id: "v1", business_name: "Glow Labs", logo_url: "https://cdn/glow.png" }],
    });
    try {
      const svc = new CollabService({} as any);
      const rows = await svc.listBoard();
      expect(rows).toHaveLength(1);
      expect(rows[0]!.opportunity.vendor_name).toBe("Glow Labs");
      expect(rows[0]!.opportunity.vendor_logo_url).toBe("https://cdn/glow.png");
    } finally {
      restore();
    }
  });

  it("nulls the vendor logo when the vendor has none", async () => {
    const restore = patchReadRepos({
      opportunities: [{ ...baseOpp }],
      vendors: [{ id: "v1", business_name: "Glow Labs", logo_url: null }],
    });
    try {
      const svc = new CollabService({} as any);
      const rows = await svc.listBoard();
      expect(rows[0]!.opportunity.vendor_name).toBe("Glow Labs");
      expect(rows[0]!.opportunity.vendor_logo_url).toBeNull();
    } finally {
      restore();
    }
  });

  it("pairs each application with its hydrated opportunity", async () => {
    const restore = patchReadRepos({
      opportunities: [baseOpp],
      applications: [
        {
          id: "app-1",
          opportunity_id: "opp-1",
          creator_id: "c1",
          status: "applied",
          created_at: new Date(),
        },
      ],
      vendors: [{ id: "v1", business_name: "Glow Labs", logo_url: null }],
    });
    try {
      const svc = new CollabService({} as any);
      const rows = await svc.listApplicationsForCreator("c1");
      expect(rows).toHaveLength(1);
      expect(rows[0]!.application.id).toBe("app-1");
      expect(rows[0]!.opportunity?.title).toBe("Feature our salon");
      expect(rows[0]!.opportunity?.vendor_name).toBe("Glow Labs");
    } finally {
      restore();
    }
  });

  it("returns an empty array without querying anything when the creator has no applications", async () => {
    const restore = patchReadRepos({ opportunities: [], applications: [] });
    try {
      const svc = new CollabService({} as any);
      const rows = await svc.listApplicationsForCreator("c-none");
      expect(rows).toEqual([]);
    } finally {
      restore();
    }
  });
});

describe("application creator hydration", () => {
  const opp = {
    id: "opp-1",
    vendor_id: "v1",
    type: CollabOpportunityType.paid_campaign,
    visibility: CollabVisibility.board,
    status: CollabOpportunityStatus.open,
    title: "Feature our salon",
    description: "d",
    slots_total: 3,
    slots_filled: 0,
    fee_fils: "50000",
  };
  const app = {
    id: "app-1",
    opportunity_id: "opp-1",
    creator_id: "c1",
    status: "applied",
    created_at: new Date(),
  };

  it("attaches the applicant's name and avatar for the vendor's own opportunity", async () => {
    const restore = patchReadRepos({
      opportunities: [opp],
      applications: [app],
      users: [
        { id: "c1", first_name: "Nora", last_name: "Ali", avatar_url: "https://cdn/nora.png" },
      ],
    });
    try {
      const svc = new CollabService({} as any);
      const apps = await svc.listApplicationsForOpportunity("v1", "opp-1");
      expect(apps[0]!.creator_name).toBe("Nora Ali");
      expect(apps[0]!.creator_avatar_url).toBe("https://cdn/nora.png");
    } finally {
      restore();
    }
  });

  it("nulls the name/avatar when the applicant's user row is missing", async () => {
    const restore = patchReadRepos({ opportunities: [opp], applications: [app], users: [] });
    try {
      const svc = new CollabService({} as any);
      const apps = await svc.listApplicationsForOpportunity("v1", "opp-1");
      expect(apps[0]!.creator_name).toBeNull();
      expect(apps[0]!.creator_avatar_url).toBeNull();
    } finally {
      restore();
    }
  });

  it("hydrates applicant identity in the admin opportunity view too", async () => {
    const restore = patchReadRepos({
      opportunities: [opp],
      applications: [app],
      vendors: [{ id: "v1", business_name: "Glow Labs", logo_url: null }],
      users: [{ id: "c1", first_name: "Nora", last_name: "Ali", avatar_url: null }],
    });
    try {
      const svc = new CollabService({} as any);
      const { applications } = await svc.getOpportunityForAdmin("opp-1");
      expect(applications[0]!.creator_name).toBe("Nora Ali");
    } finally {
      restore();
    }
  });
});
