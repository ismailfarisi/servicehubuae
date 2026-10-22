import { AppDataSource } from "@mypickuae/database";
import { reelLinkedToVendorSql } from "../shared/reel-vendor-link.ts";
import { type Period, RollupService, resolvePeriod } from "./rollup.service.ts";

/** Engagement for the vendor's linked reels on one day. Commerce metrics
 *  (product taps, attributed orders/GMV) went away with products. */
export interface VendorMetricsRow {
  bucket_date: string;
  impressions: number;
  likes: number;
  saves: number;
}

export type VendorLeaderboardType = "top_reels" | "top_creators";

export function buildVendorTimeseries(rows: VendorMetricsRow[]) {
  const m = new Map<string, { date: string; impressions: number; likes: number; saves: number }>();
  for (const r of rows) {
    const existing = m.get(r.bucket_date) ?? {
      date: r.bucket_date,
      impressions: 0,
      likes: 0,
      saves: 0,
    };
    existing.impressions += r.impressions;
    existing.likes += r.likes;
    existing.saves += r.saves;
    m.set(r.bucket_date, existing);
  }
  return [...m.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function pct(c: number, p: number): number | null {
  return p === 0 ? (c === 0 ? 0 : null) : ((c - p) / p) * 100;
}

export class VendorAnalyticsService {
  constructor(private readonly rollup: RollupService = new RollupService()) {}

  async overview(vendorId: string, period: Period, opts: { fresh?: boolean } = {}) {
    const today = new Date();
    const range = resolvePeriod(period, today);
    const prevRange = resolvePeriod(period, today, { previous: true });

    const [currRows, prevRows] = await Promise.all([
      this.fetchVendorRows(vendorId, range.from, range.to, opts),
      this.fetchVendorRows(vendorId, prevRange.from, prevRange.to, opts),
    ]);

    const sum = (rs: VendorMetricsRow[]) =>
      rs.reduce(
        (a, r) => ({
          impressions: a.impressions + r.impressions,
          likes: a.likes + r.likes,
          saves: a.saves + r.saves,
        }),
        { impressions: 0, likes: 0, saves: 0 },
      );
    const curr = sum(currRows);
    const prev = sum(prevRows);

    return {
      kpis: {
        impressions: { value: curr.impressions, deltaPct: pct(curr.impressions, prev.impressions) },
        likes: { value: curr.likes, deltaPct: pct(curr.likes, prev.likes) },
        saves: { value: curr.saves, deltaPct: pct(curr.saves, prev.saves) },
      },
      timeseries: buildVendorTimeseries(currRows),
      asOf: new Date().toISOString(),
    };
  }

  async leaderboard(vendorId: string, type: VendorLeaderboardType, period: Period, limit: number) {
    // Defense in depth: `limit` is interpolated into SQL below; clamp here even
    // though the route layer also clamps (same pattern as AdminAnalyticsService).
    const safeLimit = Math.min(500, Math.max(1, Math.trunc(Number(limit)) || 20));
    const range = resolvePeriod(period, new Date());
    // Nightly rollup rows (yesterday and earlier) merged with today's live
    // views, so a brand-new view shows up the same day.
    const metricsCte = `
      WITH metrics AS (
        SELECT reel_id, impressions, likes, saves
          FROM daily_reel_metrics
         WHERE bucket_date BETWEEN $2::date AND $3::date
           AND bucket_date < CURRENT_DATE
        UNION ALL
        SELECT reel_id, COUNT(*)::int, 0, 0
          FROM reel_views
         WHERE viewed_at::date = CURRENT_DATE
           AND CURRENT_DATE BETWEEN $2::date AND $3::date
         GROUP BY reel_id
      )`;
    const sql =
      type === "top_creators"
        ? `${metricsCte}
        SELECT u.id AS id, u.email AS label,
               (COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) AS sub_label,
               u.avatar_url,
               COUNT(DISTINCT r.id)::int    AS reels,
               SUM(m.impressions)::int      AS impressions,
               SUM(m.likes)::int            AS likes,
               SUM(m.saves)::int            AS saves
          FROM metrics m
          JOIN reels r ON r.id = m.reel_id AND r.deleted_at IS NULL
          JOIN users u ON u.id = r.user_id
         WHERE ${reelLinkedToVendorSql("r", "$1")}
         GROUP BY u.id, u.email, u.first_name, u.last_name, u.avatar_url
         ORDER BY impressions DESC
         LIMIT ${safeLimit};`
        : `${metricsCte}
        SELECT r.id AS id, r.caption AS label, u.email AS sub_label, r.thumbnail_url,
               SUM(m.impressions)::int AS impressions,
               SUM(m.likes)::int       AS likes,
               SUM(m.saves)::int       AS saves
          FROM metrics m
          JOIN reels r ON r.id = m.reel_id AND r.deleted_at IS NULL
          JOIN users u ON u.id = r.user_id
         WHERE ${reelLinkedToVendorSql("r", "$1")}
         GROUP BY r.id, r.caption, u.email, r.thumbnail_url
         ORDER BY impressions DESC
         LIMIT ${safeLimit};`;
    const rows: Record<string, unknown>[] = await AppDataSource.query(sql, [
      vendorId,
      range.from,
      range.to,
    ]);
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

  private async fetchVendorRows(
    vendorId: string,
    from: string,
    to: string,
    opts: { fresh?: boolean } = {},
  ): Promise<VendorMetricsRow[]> {
    const rollupRows: Record<string, unknown>[] = await AppDataSource.query(
      `SELECT m.bucket_date::text AS bucket_date,
              SUM(m.impressions)::int AS impressions,
              SUM(m.likes)::int       AS likes,
              SUM(m.saves)::int       AS saves
         FROM daily_reel_metrics m
         JOIN reels r ON r.id = m.reel_id
        WHERE m.bucket_date BETWEEN $2 AND $3
          AND m.bucket_date < CURRENT_DATE
          AND ${reelLinkedToVendorSql("r", "$1")}
        GROUP BY m.bucket_date`,
      [vendorId, from, to],
    );
    const fromRollup: VendorMetricsRow[] = rollupRows.map((r) => ({
      bucket_date: r.bucket_date as string,
      impressions: Number(r.impressions ?? 0),
      likes: Number(r.likes ?? 0),
      saves: Number(r.saves ?? 0),
    }));

    const todayStr = new Date().toISOString().slice(0, 10);
    if (to < todayStr) return fromRollup;

    // Today's row isn't in the nightly rollup yet — compute it from raw events,
    // filtered to the vendor's linked reels.
    const todayLive = await this.rollup.getTodayReelLive({ bypassCache: opts.fresh });
    if (todayLive.length === 0) return fromRollup;
    const reelIds = await this.vendorReelIds(vendorId);
    if (reelIds.size === 0) return fromRollup;
    const todayAgg = todayLive
      .filter((r) => reelIds.has(r.reel_id))
      .reduce(
        (acc, r) => ({
          impressions: acc.impressions + r.impressions,
          likes: acc.likes + r.likes,
          saves: acc.saves + r.saves,
        }),
        { impressions: 0, likes: 0, saves: 0 },
      );
    if (todayAgg.impressions === 0 && todayAgg.likes === 0 && todayAgg.saves === 0) {
      return fromRollup;
    }
    return [...fromRollup, { bucket_date: todayStr, ...todayAgg }];
  }

  private async vendorReelIds(vendorId: string): Promise<Set<string>> {
    const rows: { id: string }[] = await AppDataSource.query(
      `SELECT r.id FROM reels r
        WHERE r.deleted_at IS NULL AND ${reelLinkedToVendorSql("r", "$1")}`,
      [vendorId],
    );
    return new Set(rows.map((r) => r.id));
  }
}
