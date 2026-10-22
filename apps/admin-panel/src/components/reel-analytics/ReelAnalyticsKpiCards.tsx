"use client";
import {
  type Overview,
  formatCount,
  formatDeltaPct,
  formatDeltaPp,
} from "@/lib/queries/reel-analytics";
import { Card, CardContent, Skeleton } from "@servicehubuae/ui";

function DeltaBadge({
  tone,
  text,
}: {
  tone: "up" | "down" | "flat" | "na";
  text: string;
}) {
  const cls =
    tone === "up"
      ? "bg-green-50 text-green-700"
      : tone === "down"
        ? "bg-red-50 text-red-700"
        : "bg-pearl/100 text-taupe";
  return <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-md ${cls}`}>{text}</span>;
}

function KpiCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: { text: string; tone: "up" | "down" | "flat" | "na" };
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-taupe">{label}</div>
        <div className="mt-1 text-2xl font-semibold">
          {value}
          <DeltaBadge tone={delta.tone} text={delta.text} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ReelAnalyticsKpiCards({
  overview,
  isLoading,
}: {
  overview?: Overview;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {["impressions", "likes", "saves", "engagement"].map((k) => (
          <Skeleton key={k} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }
  if (!overview) return null;
  const { kpis } = overview;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard
        label="Impressions"
        value={formatCount(kpis.impressions.value)}
        delta={formatDeltaPct(kpis.impressions.deltaPct)}
      />
      <KpiCard
        label="Likes"
        value={formatCount(kpis.likes.value)}
        delta={formatDeltaPct(kpis.likes.deltaPct)}
      />
      <KpiCard
        label="Saves"
        value={formatCount(kpis.saves.value)}
        delta={formatDeltaPct(kpis.saves.deltaPct)}
      />
      <KpiCard
        label="Engagement Rate"
        value={`${(kpis.engagementRate.value * 100).toFixed(2)}%`}
        delta={formatDeltaPp(kpis.engagementRate.deltaPp)}
      />
    </div>
  );
}
