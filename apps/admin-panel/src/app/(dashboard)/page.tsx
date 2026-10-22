"use client";

import { QueryError } from "@/components/query-error";
import { formatFils } from "@/lib/booking-format";
import { useAdminBookingDashboard } from "@/lib/queries/dashboard";
import { Skeleton, StatCard } from "@mypickuae/ui";
import {
	CalendarCheck,
	CalendarDays,
	CheckCircle2,
	ClipboardList,
	Percent,
	Store,
	TrendingUp,
	Users,
} from "lucide-react";
import Link from "next/link";

function count(n: number | null | undefined) {
	return n != null ? n.toLocaleString("en-AE") : "—";
}

export default function AdminDashboardPage() {
	const { data: stats, isLoading, isError, error, refetch } =
		useAdminBookingDashboard();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-cacao mb-1">Platform Dashboard</h1>
				<p className="text-taupe text-sm">
					Bookings, revenue and vendor activity across MyPickUAE. Rolling
					figures cover the last 30 days.
				</p>
			</div>

			{isError ? (
				<QueryError
					title="Could not load dashboard figures."
					error={error}
					onRetry={() => refetch()}
				/>
			) : isLoading ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
					{Array.from({ length: 8 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
						<Skeleton key={i} className="h-28 rounded-xl" />
					))}
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
						<StatCard
							title="Bookings today"
							value={count(stats?.bookings_today)}
							icon={<CalendarCheck size={20} />}
						/>
						<StatCard
							title="Bookings (30d)"
							value={count(stats?.bookings_30d)}
							icon={<CalendarDays size={20} />}
						/>
						<StatCard
							title="Completed (30d)"
							value={count(stats?.completed_30d)}
							icon={<CheckCircle2 size={20} />}
						/>
						<StatCard
							title="GMV (30d)"
							value={formatFils(stats?.gmv_30d_fils)}
							icon={<TrendingUp size={20} />}
						/>
						<StatCard
							title="Commission (30d)"
							value={formatFils(stats?.commission_30d_fils)}
							icon={<Percent size={20} />}
						/>
						<StatCard
							title="Active vendors"
							value={count(stats?.active_vendors)}
							icon={<Store size={20} />}
						/>
						<Link
							href="/bookings/service-approvals"
							className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
							aria-label="Open the service approvals queue"
						>
							<StatCard
								title="Pending approvals"
								value={count(stats?.pending_service_approvals)}
								icon={<ClipboardList size={20} />}
							/>
						</Link>
						<StatCard
							title="Customers"
							value={count(stats?.customers_total)}
							icon={<Users size={20} />}
						/>
					</div>
					{stats && stats.pending_service_approvals > 0 && (
						<p className="text-sm text-taupe">
							{stats.pending_service_approvals === 1
								? "1 service is"
								: `${stats.pending_service_approvals} services are`}{" "}
							waiting for review.{" "}
							<Link
								href="/bookings/service-approvals"
								className="text-amber hover:underline"
							>
								Open the approvals queue
							</Link>
						</p>
					)}
				</>
			)}
		</div>
	);
}
