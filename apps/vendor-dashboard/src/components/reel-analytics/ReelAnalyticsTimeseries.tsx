"use client";
import type { VendorOverview } from "@/lib/queries/reel-analytics";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@servicehubuae/ui";
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

export function ReelAnalyticsTimeseries({
  overview,
  isLoading,
}: {
  overview?: VendorOverview;
  isLoading: boolean;
}) {
  if (isLoading) return <Skeleton className="h-72 rounded-xl" />;
  if (!overview || overview.timeseries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-gray-500">
          No reel activity in this period.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Engagement over time</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={overview.timeseries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis yAxisId="L" fontSize={11} />
            <YAxis yAxisId="R" orientation="right" fontSize={11} />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="L"
              type="monotone"
              dataKey="impressions"
              stroke="#3b82f6"
              dot={false}
              name="Impressions"
            />
            <Line
              yAxisId="R"
              type="monotone"
              dataKey="likes"
              stroke="#10b981"
              dot={false}
              name="Likes"
            />
            <Line
              yAxisId="R"
              type="monotone"
              dataKey="saves"
              stroke="#f59e0b"
              dot={false}
              name="Saves"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
