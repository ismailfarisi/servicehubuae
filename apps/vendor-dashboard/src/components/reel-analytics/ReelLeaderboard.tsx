"use client";
import {
  type LeaderboardType,
  type Period,
  formatCount,
  useVendorReelLeaderboard,
  vendorLeaderboardCsvUrl,
} from "@/lib/queries/reel-analytics";
import { Card, CardContent, CardHeader, Skeleton } from "@servicehubuae/ui";
import { useState } from "react";

const TABS: { key: LeaderboardType; label: string }[] = [
  { key: "top_reels", label: "Top Reels" },
  { key: "top_creators", label: "Top Creators" },
];

export function ReelLeaderboard({ period }: { period: Period }) {
  const [tab, setTab] = useState<LeaderboardType>("top_reels");
  const { data, isLoading } = useVendorReelLeaderboard(tab, period);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-2.5 py-1 text-xs rounded-md ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <a
          href={vendorLeaderboardCsvUrl(tab, period)}
          className="text-xs px-2.5 py-1 rounded-md border hover:bg-muted"
          download
        >
          ⇩ CSV
        </a>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="text-left py-2 w-8">#</th>
                  <th className="text-left py-2">Name</th>
                  {tab === "top_creators" && <th className="text-right py-2">Reels</th>}
                  <th className="text-right py-2">Impressions</th>
                  <th className="text-right py-2">Likes</th>
                  <th className="text-right py-2">Saves</th>
                </tr>
              </thead>
              <tbody>
                {(data?.rows ?? []).map((row, i) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-2 text-gray-500">{i + 1}</td>
                    <td className="py-2">
                      <div className="font-medium">
                        {row.label || (tab === "top_reels" ? "Untitled reel" : "Creator")}
                      </div>
                      {row.sub_label && <div className="text-xs text-gray-500">{row.sub_label}</div>}
                    </td>
                    {tab === "top_creators" && (
                      <td className="text-right">{formatCount(row.reels)}</td>
                    )}
                    <td className="text-right font-medium">{formatCount(row.impressions)}</td>
                    <td className="text-right">{formatCount(row.likes)}</td>
                    <td className="text-right">{formatCount(row.saves)}</td>
                  </tr>
                ))}
                {data?.rows?.length === 0 && (
                  <tr>
                    <td colSpan={tab === "top_creators" ? 6 : 5} className="py-6 text-center text-sm text-gray-500">
                      No data in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {(data?.rows?.length ?? 0) > 0 && (
              <div className="pt-2 text-xs text-gray-500">
                Total: {data?.rows?.length} {data?.rows?.length === 1 ? "entry" : "entries"}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
