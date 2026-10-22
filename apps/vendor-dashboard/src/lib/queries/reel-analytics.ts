// apps/vendor-dashboard/src/lib/queries/reel-analytics.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export type Period = "7d" | "30d" | "90d" | "all";
export type LeaderboardType = "top_reels" | "top_creators";

// Engagement-only analytics for reels linked to the vendor (product taps and
// attributed orders/GMV went away with the product catalogue).
export interface VendorOverview {
  kpis: {
    impressions: { value: number; deltaPct: number | null };
    likes: { value: number; deltaPct: number | null };
    saves: { value: number; deltaPct: number | null };
  };
  timeseries: Array<{
    date: string;
    impressions: number;
    likes: number;
    saves: number;
  }>;
  asOf: string;
}

export function useVendorReelOverview(period: Period) {
  return useQuery({
    queryKey: ["vendor-reel-analytics", "overview", period],
    queryFn: async () => {
      const { data } = await api.get<{ data: VendorOverview }>("/vendor/reels/analytics/overview", {
        params: { period },
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}

// One-shot fetch that bypasses the server's today-cache. Used by the Refresh
// button to surface the very latest impressions even within the cache window.
export async function fetchVendorReelOverviewFresh(period: Period): Promise<VendorOverview> {
  const { data } = await api.get<{ data: VendorOverview }>("/vendor/reels/analytics/overview", {
    params: { period, fresh: "1" },
  });
  return data.data;
}

/** top_reels rows carry thumbnail_url; top_creators rows carry avatar_url + reels. */
export interface VendorLeaderboardRow {
  id: string;
  label: string | null;
  sub_label?: string | null;
  thumbnail_url?: string | null;
  avatar_url?: string | null;
  reels?: number;
  impressions: number;
  likes: number;
  saves: number;
}

export function useVendorReelLeaderboard(type: LeaderboardType, period: Period, limit = 20) {
  return useQuery({
    queryKey: ["vendor-reel-analytics", "leaderboard", type, period, limit],
    queryFn: async () => {
      const { data } = await api.get<{
        data: { rows: VendorLeaderboardRow[]; asOf: string };
      }>("/vendor/reels/analytics/leaderboard", {
        params: { type, period, limit },
      });
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function vendorLeaderboardCsvUrl(type: LeaderboardType, period: Period): string {
  const params = new URLSearchParams({ type, period });
  return `/vendor/reels/analytics/leaderboard.csv?${params.toString()}`;
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
  return {
    text: `${d > 0 ? "+" : ""}${d.toFixed(1)}%`,
    tone: d > 0 ? "up" : "down",
  };
}
