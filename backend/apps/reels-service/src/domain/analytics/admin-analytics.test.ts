import { describe, expect, it } from "bun:test";
import { computeDeltas, rollUpOverview } from "./admin-analytics.service.ts";
import type { ReelMetricsRow } from "./rollup.service.ts";

function row(over: Partial<ReelMetricsRow> = {}): ReelMetricsRow {
  return {
    reel_id: over.reel_id ?? "r",
    bucket_date: over.bucket_date ?? "2026-04-19",
    impressions: 0,
    unique_viewers: 0,
    likes: 0,
    saves: 0,
    shares: 0,
    product_taps: 0,
    attributed_orders: 0,
    attributed_gmv_fils: 0,
    earned_commission_fils: 0,
    ...over,
  };
}

describe("rollUpOverview", () => {
  it("sums engagement across rows and ignores the zeroed commerce columns", () => {
    const rows = [
      row({ impressions: 100, likes: 5, saves: 2, shares: 1, product_taps: 10 }),
      row({ impressions: 50, likes: 1, saves: 1, shares: 0 }),
    ];
    const o = rollUpOverview(rows);
    expect(o.impressions).toBe(150);
    expect(o.likes).toBe(6);
    expect(o.saves).toBe(3);
    expect(o.engagementRate).toBeCloseTo((5 + 2 + 1 + 1 + 1 + 0) / 150, 4);
    expect(o).not.toHaveProperty("productTapRate");
    expect(o).not.toHaveProperty("attributedGmvFils");
  });

  it("returns zeros (no NaN) when no rows", () => {
    const o = rollUpOverview([]);
    expect(o.impressions).toBe(0);
    expect(o.engagementRate).toBe(0);
  });
});

describe("computeDeltas", () => {
  it("returns percent delta on counts and pp delta on rates", () => {
    const d = computeDeltas(
      { impressions: 120, unique_viewers: 0, likes: 10, saves: 4, engagementRate: 0.08 },
      { impressions: 100, unique_viewers: 0, likes: 5, saves: 4, engagementRate: 0.05 },
    );
    expect(d.impressions.deltaPct).toBeCloseTo(20);
    expect(d.likes.deltaPct).toBeCloseTo(100);
    expect(d.saves.deltaPct).toBeCloseTo(0);
    expect(d.engagementRate.deltaPp).toBeCloseTo(3);
  });

  it("prev=0 and curr>0 → deltaPct = null (undefined growth)", () => {
    const d = computeDeltas(
      { impressions: 100, unique_viewers: 0, likes: 1, saves: 1, engagementRate: 0.08 },
      { impressions: 0, unique_viewers: 0, likes: 0, saves: 0, engagementRate: 0 },
    );
    expect(d.impressions.deltaPct).toBeNull();
  });
});
