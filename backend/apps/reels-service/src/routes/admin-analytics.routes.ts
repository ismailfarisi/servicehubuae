import { jwtAuth, requireRole } from "@servicehubuae/guards";
import { Elysia, t } from "elysia";
import { container } from "../container.ts";
import type { AdminLeaderboardType } from "../domain/analytics/admin-analytics.service.ts";
import { leaderboardToCsv } from "../domain/analytics/csv.ts";
import type { Period } from "../domain/analytics/rollup.service.ts";

const PERIODS: Period[] = ["7d", "30d", "90d", "all"];
function parsePeriod(raw: unknown): Period {
  return typeof raw === "string" && (PERIODS as string[]).includes(raw) ? (raw as Period) : "30d";
}

type LeaderboardType = AdminLeaderboardType;
const LB_TYPES: LeaderboardType[] = ["top_reels", "top_creators"];

export const adminAnalyticsRoutes = new Elysia({ prefix: "/admin/reels/analytics" })
  .use(container)
  .use(jwtAuth)
  .use(requireRole("admin", "super_admin"))
  .get(
    "/overview",
    async ({ query, adminAnalyticsService }: any) => {
      const period = parsePeriod(query.period);
      const vendorId = typeof query.vendor_id === "string" ? query.vendor_id : undefined;
      const data = await adminAnalyticsService.overview(period, { vendorId });
      return { statusCode: 200, data, timestamp: new Date().toISOString() };
    },
    {
      query: t.Object({
        period: t.Optional(t.String()),
        vendor_id: t.Optional(t.String({ format: "uuid" })),
      }),
    },
  )
  .get(
    "/leaderboard",
    async ({ query, adminAnalyticsService }: any) => {
      const type = LB_TYPES.includes(query.type) ? (query.type as LeaderboardType) : "top_reels";
      const period = parsePeriod(query.period);
      const vendorId = typeof query.vendor_id === "string" ? query.vendor_id : undefined;
      const limit = Math.min(Number(query.limit ?? 20), 100);
      const { rows, asOf } = await adminAnalyticsService.leaderboard(type, period, limit, {
        vendorId,
      });
      return { statusCode: 200, data: { rows, asOf }, timestamp: new Date().toISOString() };
    },
    {
      query: t.Object({
        type: t.Optional(t.String()),
        period: t.Optional(t.String()),
        vendor_id: t.Optional(t.String({ format: "uuid" })),
        limit: t.Optional(t.Numeric()),
      }),
    },
  )
  .get(
    "/leaderboard.csv",
    async ({ query, adminAnalyticsService, set }: any) => {
      const type = LB_TYPES.includes(query.type) ? (query.type as LeaderboardType) : "top_reels";
      const period = parsePeriod(query.period);
      const vendorId = typeof query.vendor_id === "string" ? query.vendor_id : undefined;
      const limit = Math.min(Number(query.limit ?? 100), 500);
      const { rows } = await adminAnalyticsService.leaderboard(type, period, limit, { vendorId });

      const columnsByType: Record<LeaderboardType, string[]> = {
        top_reels: ["id", "label", "sub_label", "impressions", "likes", "saves"],
        top_creators: ["id", "label", "sub_label", "reels", "impressions", "likes", "saves"],
      };
      const csv = leaderboardToCsv(columnsByType[type], rows);
      set.headers["content-type"] = "text/csv; charset=utf-8";
      set.headers["content-disposition"] =
        `attachment; filename="reel-analytics-${type}-${period}.csv"`;
      return csv;
    },
    {
      query: t.Object({
        type: t.Optional(t.String()),
        period: t.Optional(t.String()),
        vendor_id: t.Optional(t.String({ format: "uuid" })),
        limit: t.Optional(t.Numeric()),
      }),
    },
  );
