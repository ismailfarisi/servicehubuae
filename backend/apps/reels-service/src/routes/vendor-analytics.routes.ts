import { jwtAuth, vendorMembership } from "@servicehubuae/guards";
import { Elysia, t } from "elysia";
import { container } from "../container.ts";
import { leaderboardToCsv } from "../domain/analytics/csv.ts";
import type { Period } from "../domain/analytics/rollup.service.ts";
import type { VendorLeaderboardType } from "../domain/analytics/vendor-analytics.service.ts";

/**
 * Vendor analytics HTTP endpoints. All responses are scoped to the vendor
 * derived from the session by `vendorMembership("analytics.read")` —
 * `member.vid` never comes from a query parameter. The guard short-circuits
 * unauthenticated, no-membership, and unauthorized-role sessions before
 * reaching the handler.
 *
 * Phase 2 migration: replaces `vendorOwnership` with the permission-aware
 * `vendorMembership("analytics.read")` guard, and `vendor.id` with `member.vid`.
 */

const PERIODS: Period[] = ["7d", "30d", "90d", "all"];
function parsePeriod(raw: unknown): Period {
  return typeof raw === "string" && (PERIODS as string[]).includes(raw) ? (raw as Period) : "30d";
}

type LBType = VendorLeaderboardType;
const LB_TYPES: LBType[] = ["top_reels", "top_creators"];

export const vendorAnalyticsRoutes = new Elysia({ prefix: "/vendor/reels/analytics" })
  .use(container)
  .use(jwtAuth)
  .use(vendorMembership("analytics.read"))
  .get(
    "/overview",
    async ({ query, member, vendorAnalyticsService }: any) => {
      const data = await vendorAnalyticsService.overview(member.vid, parsePeriod(query.period), {
        fresh: query.fresh === "1" || query.fresh === "true",
      });
      return { statusCode: 200, data, timestamp: new Date().toISOString() };
    },
    {
      query: t.Object({
        period: t.Optional(t.String()),
        fresh: t.Optional(t.String()),
      }),
    },
  )
  .get(
    "/leaderboard",
    async ({ query, member, vendorAnalyticsService }: any) => {
      const type: LBType = LB_TYPES.includes(query.type) ? query.type : "top_reels";
      const limit = Math.min(Number(query.limit ?? 20), 100);
      const data = await vendorAnalyticsService.leaderboard(
        member.vid,
        type,
        parsePeriod(query.period),
        limit,
      );
      return { statusCode: 200, data, timestamp: new Date().toISOString() };
    },
    {
      query: t.Object({
        type: t.Optional(t.String()),
        period: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
      }),
    },
  )
  .get(
    "/leaderboard.csv",
    async ({ query, member, vendorAnalyticsService, set }: any) => {
      const type: LBType = LB_TYPES.includes(query.type) ? query.type : "top_reels";
      const period = parsePeriod(query.period);
      const { rows } = await vendorAnalyticsService.leaderboard(member.vid, type, period, 500);

      const columnsByType: Record<LBType, string[]> = {
        top_reels: ["id", "label", "sub_label", "impressions", "likes", "saves"],
        top_creators: ["id", "label", "sub_label", "reels", "impressions", "likes", "saves"],
      };
      const csv = leaderboardToCsv(columnsByType[type], rows);
      set.headers["content-type"] = "text/csv; charset=utf-8";
      set.headers["content-disposition"] =
        `attachment; filename="my-reel-analytics-${type}-${period}.csv"`;
      return csv;
    },
    { query: t.Object({ type: t.Optional(t.String()), period: t.Optional(t.String()) }) },
  );
