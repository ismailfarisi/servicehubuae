// service-review-public.service.test.ts
//
// Mocked-query unit tests (no live DB) for the storefront review list: the
// row -> wire mapping (reviewer name shortened to "First L."), the star
// distribution / average built from the GROUP BY rows, and paging bounds.
import { describe, expect, it, mock } from "bun:test";
import { ServiceReviewPublicService, shortReviewerName } from "./service-review-public.service.ts";

const ROW = {
  id: "r1",
  rating: 5,
  title: "Spot on",
  body: "Great job.",
  vendor_reply: null,
  created_at: new Date("2026-05-02T10:00:00Z"),
  first_name: "Fatima",
  last_name: "Al Mansoori",
};

function makeService(rows: any[], dist: any[]) {
  const query = mock(async (sql: string, _params?: unknown[]) =>
    sql.includes("GROUP BY") ? dist : rows,
  );
  return { service: new ServiceReviewPublicService(query as any), query };
}

describe("shortReviewerName", () => {
  it("keeps the first name and the last-name initial", () => {
    expect(shortReviewerName("Fatima", "Al Mansoori")).toBe("Fatima A.");
  });
  it("falls back when names are missing", () => {
    expect(shortReviewerName(null, null)).toBe("Verified customer");
    expect(shortReviewerName("Rahul", null)).toBe("Rahul");
  });
});

describe("ServiceReviewPublicService.listForOffering", () => {
  it("maps rows, never leaking the full surname", async () => {
    const { service } = makeService([ROW], [{ rating: 5, count: 1 }]);
    const page = await service.listForOffering("o1", {});
    expect(page.items).toEqual([
      {
        id: "r1",
        rating: 5,
        title: "Spot on",
        body: "Great job.",
        vendor_reply: null,
        created_at: "2026-05-02T10:00:00.000Z",
        reviewer_name: "Fatima A.",
      },
    ]);
    expect(JSON.stringify(page)).not.toContain("Mansoori");
  });

  it("builds the distribution, average and total from the grouped counts", async () => {
    const { service } = makeService(
      [],
      [
        { rating: 5, count: "3" },
        { rating: 4, count: "1" },
      ],
    );
    const page = await service.listForOffering("o1", {});
    expect(page.rating_count).toBe(4);
    expect(page.total).toBe(4);
    expect(page.rating_avg).toBe(4.75);
    expect(page.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 3 });
  });

  it("returns a null average when there are no reviews", async () => {
    const { service } = makeService([], []);
    const page = await service.listForOffering("o1", {});
    expect(page.rating_avg).toBeNull();
    expect(page.rating_count).toBe(0);
  });

  it("scopes to approved reviews of the offering and clamps paging", async () => {
    const { service, query } = makeService([], []);
    const page = await service.listForOffering("o1", { page: 0, limit: 500 });
    expect(page.page).toBe(1);
    expect(page.limit).toBe(50);
    const listCall = query.mock.calls.find(([sql]) => !sql.includes("GROUP BY"));
    expect(listCall?.[1]).toEqual(["o1", "approved", 50, 0]);
    const aggCall = query.mock.calls.find(([sql]) => sql.includes("GROUP BY"));
    expect(aggCall?.[1]).toEqual(["o1", "approved"]);
  });
});
