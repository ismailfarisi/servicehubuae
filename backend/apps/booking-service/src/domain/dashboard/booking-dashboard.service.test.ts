import { describe, expect, it } from "bun:test";
import { BookingDashboardService, DASHBOARD_TIME_ZONE } from "./booking-dashboard.service.ts";

const NOW = new Date("2026-10-22T08:00:00.000Z");

function fakeQuery(row: Record<string, unknown> | undefined) {
  const calls: Array<{ sql: string; params: unknown[] }> = [];
  const query = async (sql: string, params: unknown[] = []) => {
    calls.push({ sql, params });
    return row ? [row] : [];
  };
  return { query, calls };
}

describe("BookingDashboardService.vendorDashboard", () => {
  it("maps the aggregate row (pg returns counts/sums as strings) to numbers", async () => {
    const { query } = fakeQuery({
      bookings_today: "3",
      upcoming_7d: "11",
      completed_30d: "40",
      cancelled_30d: "2",
      revenue_30d_fils: "1250000",
      commission_30d_fils: "125000",
      published_services: "7",
      pending_review_services: "1",
      rating_avg: "4.6666666667",
      rating_count: "9",
    });
    const service = new BookingDashboardService(query);

    const data = await service.vendorDashboard("vendor-1", NOW);

    expect(data).toEqual({
      bookings_today: 3,
      upcoming_7d: 11,
      completed_30d: 40,
      cancelled_30d: 2,
      revenue_30d_fils: 1_250_000,
      commission_30d_fils: 125_000,
      published_services: 7,
      pending_review_services: 1,
      rating_avg: 4.67,
      rating_count: 9,
    });
  });

  it("returns rating_avg null (not 0) when the vendor has no approved reviews", async () => {
    const { query } = fakeQuery({ rating_avg: null, rating_count: "0" });
    const data = await new BookingDashboardService(query).vendorDashboard("vendor-1", NOW);
    expect(data.rating_avg).toBeNull();
    expect(data.rating_count).toBe(0);
    expect(data.bookings_today).toBe(0);
    expect(data.revenue_30d_fils).toBe(0);
  });

  it("scopes every tile to the vendor and computes windows in Asia/Dubai from the injected now", async () => {
    const { query, calls } = fakeQuery({});
    await new BookingDashboardService(query).vendorDashboard("vendor-1", NOW);

    expect(calls).toHaveLength(1);
    const { sql, params } = calls[0]!;
    expect(params[0]).toBe(NOW);
    expect(params[1]).toBe("vendor-1");
    expect(sql).toContain(`AT TIME ZONE '${DASHBOARD_TIME_ZONE}'`);
    expect(sql).toContain("interval '29 days'");
    // Every FROM over a per-vendor table filters by the vendor param.
    const perVendorFroms =
      sql.match(
        /FROM (bookings|commissions|service_offerings|service_reviews) \w+\s+WHERE [^\n]*/g,
      ) ?? [];
    expect(perVendorFroms.length).toBe(10);
    for (const clause of perVendorFroms) expect(clause).toContain("vendor_id = $2");
  });
});

describe("BookingDashboardService.adminDashboard", () => {
  it("maps the platform aggregate row to numbers", async () => {
    const { query, calls } = fakeQuery({
      bookings_today: "25",
      bookings_30d: "610",
      completed_30d: "540",
      gmv_30d_fils: "98765400",
      commission_30d_fils: "9876540",
      active_vendors: "42",
      pending_service_approvals: "5",
      customers_total: "1200",
    });

    const data = await new BookingDashboardService(query).adminDashboard(NOW);

    expect(data).toEqual({
      bookings_today: 25,
      bookings_30d: 610,
      completed_30d: 540,
      gmv_30d_fils: 98_765_400,
      commission_30d_fils: 9_876_540,
      active_vendors: 42,
      pending_service_approvals: 5,
      customers_total: 1200,
    });
    expect(calls[0]!.params[0]).toBe(NOW);
    expect(calls[0]!.params).toContain("approved");
    expect(calls[0]!.params).toContain("customer");
  });

  it("returns zeros when the query yields no row", async () => {
    const { query } = fakeQuery(undefined);
    const data = await new BookingDashboardService(query).adminDashboard(NOW);
    expect(Object.values(data).every((v) => v === 0)).toBe(true);
  });
});
