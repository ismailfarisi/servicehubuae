"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, Skeleton } from "@servicehubuae/ui";
import {
  adminLeaderboardCsvUrl,
  formatCount,
  useAdminReelLeaderboard,
  type LeaderboardType,
  type Period,
} from "@/lib/queries/reel-analytics";

const TABS: { key: LeaderboardType; label: string }[] = [
  { key: "top_reels", label: "Top Reels" },
  { key: "top_creators", label: "Top Creators" },
];

export function ReelLeaderboard({ period, vendorId }: { period: Period; vendorId?: string }) {
  const [tab, setTab] = useState<LeaderboardType>("top_reels");
  const { data, isLoading } = useAdminReelLeaderboard(tab, period, vendorId);
  const showReels = tab === "top_creators";
  const colSpan = showReels ? 6 : 5;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-2.5 py-1 text-xs rounded-md ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <a
          href={adminLeaderboardCsvUrl(tab, period, vendorId)}
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
              <thead className="text-xs uppercase tracking-wide text-taupe">
                <tr>
                  <th className="text-left py-2 w-8">#</th>
                  <th className="text-left py-2">{showReels ? "Creator" : "Reel"}</th>
                  {showReels && <th className="text-right py-2">Reels</th>}
                  <th className="text-right py-2">Impressions</th>
                  <th className="text-right py-2">Likes</th>
                  <th className="text-right py-2">Saves</th>
                </tr>
              </thead>
              <tbody>
                {(data?.rows ?? []).map((row, i) => (
                  <tr key={row.id} className="border-t">
                    <td className="py-2 text-taupe">{i + 1}</td>
                    <td className="py-2">
                      <div className="font-medium">
                        {row.label || (showReels ? "Unnamed creator" : "Untitled reel")}
                      </div>
                      {row.sub_label?.trim() && (
                        <div className="text-xs text-taupe">{row.sub_label}</div>
                      )}
                    </td>
                    {showReels && <td className="text-right">{formatCount(row.reels)}</td>}
                    <td className="text-right font-medium">{formatCount(row.impressions)}</td>
                    <td className="text-right">{formatCount(row.likes)}</td>
                    <td className="text-right">{formatCount(row.saves)}</td>
                  </tr>
                ))}
                {data?.rows?.length === 0 && (
                  <tr>
                    <td colSpan={colSpan} className="py-6 text-center text-sm text-taupe">
                      No data in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {data?.rows && data.rows.length > 0 && (
              <p className="text-xs text-taupe pt-3">
                Total: {data.rows.length} {data.rows.length === 1 ? "entry" : "entries"}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
