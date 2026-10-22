import { AppDataSource } from "@servicehubuae/database";
import { reelLinkedToVendorSql } from "../shared/reel-vendor-link.ts";
import {
  type Period,
  type PeriodRange,
  type ReelMetricsRow,
  RollupService,
  resolvePeriod,
} from "./rollup.service.ts";

/** Platform-wide reel engagement. Commerce metrics (product taps, attributed
 *  orders/GMV, creator commissions) went away with products. */
export interface Overview {
  impressions: number;
  unique_viewers: number;
  likes: number;
  saves: number;
  engagementRate: number;
}

export interface DeltaCount {
  value: number;
  deltaPct: number | null;
}
export interface DeltaRate {
  value: number;
  deltaPp: number | null;
}
export interface OverviewWithDeltas {
  kpis: {
    impressions: DeltaCount;
    likes: DeltaCount;
    saves: DeltaCount;
    engagementRate: DeltaRate;
  };
  timeseries: Array<{
    date: string;
    impressions: number;
    likes: number;
    saves: number;
    engagementRate: number;
  }>;
  asOf: string;
}

export type AdminLeaderboardType = "top_reels" | "top_creators";

export function rollUpOverview(rows: ReelMetricsRow[]): Overview {
  const sum = rows.reduce(
    (acc, r) => ({
      impressions: acc.impressions + r.impressions,
      unique_viewers: acc.unique_viewers + r.unique_viewers,
      likes: acc.likes + r.likes,
      saves: acc.saves + r.saves,
      engagement_events: acc.engagement_events + r.likes + r.saves + r.shares, // shares always 0 in v1
    }),
    { impressions: 0, unique_viewers: 0, likes: 0, saves: 0, engagement_events: 0 },
  );
  return {
    impressions: sum.impressions,
    unique_viewers: sum.unique_viewers,
    likes: sum.likes,
    saves: sum.saves,
    engagementRate: sum.impressions > 0 ? sum.engagement_events / sum.impressions : 0,
  };
}

export function computeDeltas(curr: Overview, prev: Overview): OverviewWithDeltas["kpis"] {
  const pct = (c: number, p: number): number | null =>
    p === 0 ? (c === 0 ? 0 : null) : ((c - p) / p) * 100;
  const pp = (c: number, p: number): number => (c - p) * 100;
  return {
    impressions: { value: curr.impressions, deltaPct: pct(curr.impressions, prev.impressions) },
    likes: { value: curr.likes, deltaPct: pct(curr.likes, prev.likes) },
    saves: { value: curr.saves, deltaPct: pct(curr.saves, prev.saves) },
    engagementRate: {
      value: curr.engagementRate,
      deltaPp: pp(curr.engagementRate, prev.engagementRate),
    },
  };
}

export class AdminAnalyticsService {
  constructor(private readonly rollup: RollupService = new RollupService()) {}

  async overview(period: Period, opts: { vendorId?: string } = {}): Promise<OverviewWithDeltas> {
    const today = new Date();
    const curr = await this.fetchRowsForPeriod(resolvePeriod(period, today), opts);
    const prev = await this.fetchRowsForPeriod(
      resolvePeriod(period, today, { previous: true }),
      opts,
    );

    const timeseriesMap = new Map<
      string,
      { date: string; impressions: number; likes: number; saves: number; _eng: number }
    >();
    for (const r of curr) {
      const bucket = timeseriesMap.get(r.bucket_date) ?? {
        date: r.bucket_date,
        impressions: 0,
        likes: 0,
        saves: 0,
        _eng: 0,
      };
      bucket.impressions += r.impressions;
      bucket.likes += r.likes;
      bucket.saves += r.saves;
      bucket._eng += r.likes + r.saves + r.shares;
      timeseriesMap.set(r.bucket_date, bucket);
    }
    const timeseries = [...timeseriesMap.values()]
      .map((b) => ({
        date: b.date,
        impressions: b.impressions,
        likes: b.likes,
        saves: b.saves,
        engagementRate: b.impressions > 0 ? b._eng / b.impressions : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      kpis: computeDeltas(rollUpOverview(curr), rollUpOverview(prev)),
      timeseries,
      asOf: new Date().toISOString(),
    };
  }

  private async fetchRowsForPeriod(
    range: PeriodRange,
    opts: { vendorId?: string },
  ): Promise<ReelMetricsRow[]> {
    const rollupRows = await this.rollup.getReelRollup(range);
    const todayStr = new Date().toISOString().slice(0, 10);
    const includeToday = range.to >= todayStr;
    const todayRows = includeToday ? await this.rollup.getTodayReelLive() : [];

    let all = [...rollupRows, ...todayRows];
    if (opts.vendorId) {
      const reelIds = await vendorReelIds(opts.vendorId);
      all = all.filter((r) => reelIds.has(r.reel_id));
    }
    return all;
  }

  async leaderboard(
    type: AdminLeaderboardType,
    period: Period,
    limit: number,
    opts: { vendorId?: string } = {},
  ): Promise<{ rows: Record<string, unknown>[]; asOf: string }> {
    // Defense in depth: `limit` is interpolated into SQL below; clamp here even though the
    // route layer also clamps. Any non-finite or negative value falls back to 20.
    const safeLimit = Math.min(500, Math.max(1, Math.trunc(Number(limit)) || 20));
    const range = resolvePeriod(period, new Date());
    const params: unknown[] = [range.from, range.to];
    // Optional vendor filter: reels linked to the vendor (licence grant,
    // delivered collab or team upload).
    const vendorClause = opts.vendorId ? ` AND ${reelLinkedToVendorSql("r", "$3")} ` : " ";
    if (opts.vendorId) params.push(opts.vendorId);

    // users has first_name/last_name/email/avatar_url; reels.user_id links to users.
    const sql =
      type === "top_creators"
        ? `
        SELECT u.id AS id,
               u.email AS label,
               (COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) AS sub_label,
               u.avatar_url,
               COUNT(DISTINCT r.id)::int    AS reels,
               SUM(drm.impressions)::int    AS impressions,
               SUM(drm.likes)::int          AS likes,
               SUM(drm.saves)::int          AS saves
          FROM daily_reel_metrics drm
          JOIN reels r ON r.id = drm.reel_id
          JOIN users u ON u.id = r.user_id
         WHERE drm.bucket_date BETWEEN $1 AND $2 ${vendorClause}
         GROUP BY u.id, u.email, u.first_name, u.last_name, u.avatar_url
         ORDER BY impressions DESC
         LIMIT ${safeLimit};`
        : `
        SELECT drm.reel_id AS id,
               r.caption   AS label,
               u.email     AS sub_label,
               r.thumbnail_url,
               SUM(drm.impressions)::int AS impressions,
               SUM(drm.likes)::int       AS likes,
               SUM(drm.saves)::int       AS saves
          FROM daily_reel_metrics drm
          JOIN reels r ON r.id = drm.reel_id
          JOIN users u ON u.id = r.user_id
         WHERE drm.bucket_date BETWEEN $1 AND $2 ${vendorClause}
         GROUP BY drm.reel_id, r.caption, u.email, r.thumbnail_url
         ORDER BY impressions DESC
         LIMIT ${safeLimit};`;
    const rows: Record<string, unknown>[] = await AppDataSource.query(sql, params);
    return {
      rows: rows.map((r) => ({
        ...r,
        impressions: Number(r.impressions ?? 0),
        likes: Number(r.likes ?? 0),
        saves: Number(r.saves ?? 0),
        reels: r.reels != null ? Number(r.reels) : undefined,
      })),
      asOf: new Date().toISOString(),
    };
  }
}

async function vendorReelIds(vendorId: string): Promise<Set<string>> {
  const rows: { id: string }[] = await AppDataSource.query(
    `SELECT r.id FROM reels r WHERE ${reelLinkedToVendorSql("r", "$1")}`,
    [vendorId],
  );
  return new Set(rows.map((r) => r.id));
}
