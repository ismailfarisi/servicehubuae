"use client";

import { getMembershipsFromToken } from "@/lib/auth";
import { formatAED } from "@/lib/queries/creator-content";
import { useVendorBookingDashboard } from "@/lib/queries/dashboard";
import { Card, CardContent, Skeleton, StatCard } from "@servicehubuae/ui";
import {
  CalendarBlank,
  CalendarCheck,
  CheckCircle,
  ClockCountdown,
  ListChecks,
  Percent,
  Star,
  Wallet,
} from "@phosphor-icons/react";
import Link from "next/link";

const QUICK_LINKS = [
  {
    href: "/calendar",
    label: "Bookings calendar",
    description: "See today's bookings, block time and take walk-ins.",
    icon: <CalendarBlank size={22} />,
  },
  {
    href: "/services",
    label: "Services",
    description: "Add services, set prices and send them for review.",
    icon: <ListChecks size={22} />,
  },
];

function formatRating(avg: number | null | undefined, count: number | undefined) {
  if (avg == null || !count) return "No ratings yet";
  return `${Number(avg).toFixed(1)} (${count})`;
}

export default function DashboardPage() {
  // The endpoint needs an active vendor membership; an admin session without
  // one would only get a 400.
  const isVendorScoped = getMembershipsFromToken().length > 0;
  const { data: stats, isLoading, isError } = useVendorBookingDashboard({
    enabled: isVendorScoped,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Welcome back! Here&apos;s how your bookings are going.
        </p>
      </div>

      {isError && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          We couldn&apos;t load your booking stats right now. Please try again shortly.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isVendorScoped && isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Bookings today"
              value={stats?.bookings_today ?? "—"}
              icon={<CalendarCheck size={20} />}
            />
            <StatCard
              title="Upcoming (7 days)"
              value={stats?.upcoming_7d ?? "—"}
              icon={<ClockCountdown size={20} />}
            />
            <StatCard
              title="Completed (30 days)"
              value={stats?.completed_30d ?? "—"}
              icon={<CheckCircle size={20} />}
            />
            <StatCard
              title="Revenue (30 days)"
              value={formatAED(stats?.revenue_30d_fils)}
              icon={<Wallet size={20} />}
            />
            <StatCard
              title="Commission (30 days)"
              value={formatAED(stats?.commission_30d_fils)}
              icon={<Percent size={20} />}
            />
            <StatCard
              title="Published services"
              value={stats?.published_services ?? "—"}
              icon={<ListChecks size={20} />}
            />
            <StatCard
              title="Pending review"
              value={stats?.pending_review_services ?? "—"}
              icon={<ClockCountdown size={20} />}
            />
            <StatCard
              title="Rating"
              value={stats ? formatRating(stats.rating_avg, stats.rating_count) : "—"}
              icon={<Star size={20} />}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="block">
            <Card className="h-full transition-colors hover:border-primary">
              <CardContent className="flex items-start gap-3 p-5">
                <span className="text-primary mt-0.5">{link.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900">{link.label}</p>
                  <p className="text-sm text-gray-500">{link.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
