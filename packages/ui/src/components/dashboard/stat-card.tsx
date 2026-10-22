"use client";

import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../../lib/utils";

type TrendObject = { value: number; direction: "up" | "down" };

interface StatCardProps {
	title: string;
	value: string | number;
	// Accepts a raw percentage-change number (direction derived from its sign)
	// or an explicit { value, direction }. null/undefined/0/NaN hides the trend.
	trend?: number | TrendObject | null;
	icon?: React.ReactNode;
}

function normalizeTrend(trend: StatCardProps["trend"]): TrendObject | null {
	if (trend == null) return null;
	if (typeof trend === "number") {
		if (!Number.isFinite(trend) || trend === 0) return null;
		return { value: Math.abs(trend), direction: trend > 0 ? "up" : "down" };
	}
	if (!Number.isFinite(trend.value)) return null;
	return trend;
}

export function StatCard({ title, value, trend, icon }: StatCardProps) {
	const t = normalizeTrend(trend);
	return (
		<Card className="p-6 transition-shadow hover:shadow-md">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-3">
				<CardTitle className="text-sm font-medium text-taupe">{title}</CardTitle>
				{icon && (
					<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-amber">
						{icon}
					</span>
				)}
			</CardHeader>
			<CardContent className="p-0">
				<div className="text-3xl font-bold tracking-tight text-cacao">{value}</div>
				{t && (
					<div
						className={cn(
							"flex items-center gap-1 mt-1 text-xs font-medium",
							t.direction === "up" ? "text-success" : "text-russet",
						)}
					>
						{t.direction === "up" ? (
							<ArrowUp className="w-3.5 h-3.5" />
						) : (
							<ArrowDown className="w-3.5 h-3.5" />
						)}
						<span>{Math.abs(t.value)}%</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
