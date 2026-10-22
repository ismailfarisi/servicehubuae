"use client";
import type { Overview } from "@/lib/queries/reel-analytics";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@mypickuae/ui";
import { useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MetricKey = "impressions" | "likes_saves" | "engagementRate";

const METRICS: { key: MetricKey; label: string }[] = [
  { key: "impressions", label: "Impressions" },
  { key: "likes_saves", label: "Likes + saves" },
  { key: "engagementRate", label: "Engagement rate" },
];

export function ReelAnalyticsTimeseries({
  overview,
  isLoading,
}: {
  overview?: Overview;
  isLoading: boolean;
}) {
  const [metric, setMetric] = useState<MetricKey>("impressions");

  if (isLoading) return <Skeleton className="h-72 rounded-xl" />;
  if (!overview || overview.timeseries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-taupe">
          No reel activity in this period.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Trends</CardTitle>
        <select
          className="text-xs border rounded-md px-2 py-1"
          value={metric}
          onChange={(e) => setMetric(e.target.value as MetricKey)}
        >
          {METRICS.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent className="p-4 pt-0 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={overview.timeseries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis yAxisId="L" fontSize={11} />
            <Tooltip />
            <Legend />
            {metric === "impressions" && (
              <Line
                yAxisId="L"
                type="monotone"
                dataKey="impressions"
                stroke="#3b82f6"
                dot={false}
                name="Impressions"
              />
            )}
            {metric === "likes_saves" && (
              <>
                <Line
                  yAxisId="L"
                  type="monotone"
                  dataKey="likes"
                  stroke="#10b981"
                  dot={false}
                  name="Likes"
                />
                <Line
                  yAxisId="L"
                  type="monotone"
                  dataKey="saves"
                  stroke="#f59e0b"
                  dot={false}
                  name="Saves"
                />
              </>
            )}
            {metric === "engagementRate" && (
              <Line
                yAxisId="L"
                type="monotone"
                dataKey="engagementRate"
                stroke="#8b5cf6"
                dot={false}
                name="Engagement rate"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
