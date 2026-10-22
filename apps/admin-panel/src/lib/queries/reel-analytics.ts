// apps/admin-panel/src/lib/queries/reel-analytics.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type Period = "7d" | "30d" | "90d" | "all";
/** GET /admin/reels/analytics/leaderboard types (reels-service). */
export type LeaderboardType = "top_reels" | "top_creators";

export interface DeltaCount {
  value: number;
  deltaPct: number | null;
}
export interface DeltaRate {
  value: number;
  deltaPp: number | null;
}
/** GET /admin/reels/analytics/overview. Engagement only: impressions, likes, saves. */
export interface Overview {
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

export function useAdminReelOverview(period: Period, vendorId?: string) {
  return useQuery({
    queryKey: ["admin-reel-analytics", "overview", period, vendorId ?? ""],
    queryFn: async () => {
      const { data } = await api.get<{ data: Overview }>("/admin/reels/analytics/overview", {
        params: { period, vendor_id: vendorId },
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}

export interface LeaderboardRow {
  id: string;
  label: string | null;
  sub_label?: string | null;
  avatar_url?: string | null;
  thumbnail_url?: string | null;
  impressions: number;
  likes: number;
  saves: number;
  /** top_creators only. */
  reels?: number;
}

export function useAdminReelLeaderboard(
  type: LeaderboardType,
  period: Period,
  vendorId?: string,
  limit = 20,
) {
  return useQuery({
    queryKey: ["admin-reel-analytics", "leaderboard", type, period, vendorId ?? "", limit],
    queryFn: async () => {
      const { data } = await api.get<{ data: { rows: LeaderboardRow[]; asOf: string } }>(
        "/admin/reels/analytics/leaderboard",
        {
          params: { type, period, vendor_id: vendorId, limit },
        },
      );
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function adminLeaderboardCsvUrl(
  type: LeaderboardType,
  period: Period,
  vendorId?: string,
): string {
  const params = new URLSearchParams({ type, period, limit: "500" });
  if (vendorId) params.set("vendor_id", vendorId);
  return `/admin/reels/analytics/leaderboard.csv?${params.toString()}`;
}

export function formatCount(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-AE");
}

export function formatDeltaPct(d: number | null): {
  text: string;
  tone: "up" | "down" | "flat" | "na";
} {
  if (d == null) return { text: "—", tone: "na" };
  if (d === 0) return { text: "0%", tone: "flat" };
  return { text: `${d > 0 ? "+" : ""}${d.toFixed(1)}%`, tone: d > 0 ? "up" : "down" };
}

export function formatDeltaPp(d: number | null): {
  text: string;
  tone: "up" | "down" | "flat" | "na";
} {
  if (d == null) return { text: "—", tone: "na" };
  if (d === 0) return { text: "0pp", tone: "flat" };
  return { text: `${d > 0 ? "+" : ""}${d.toFixed(2)}pp`, tone: d > 0 ? "up" : "down" };
}
