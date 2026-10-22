"use client";

import { cn } from "../../lib/utils";

const DEFAULT_COLOR_MAP: Record<string, string> = {
	// Generic content states
	draft: "bg-pearl/50 text-taupe border border-pearl",
	published: "bg-amber/10 text-amber border border-amber/20",
	archived: "bg-taupe/10 text-taupe border border-taupe/20",
	// Approval states
	pending: "bg-warning/10 text-warning border border-warning/20",
	pending_review: "bg-warning/10 text-warning border border-warning/20",
	approved: "bg-success/10 text-success border border-success/20",
	rejected: "bg-russet/10 text-russet border border-russet/20",
	suspended: "bg-russet/10 text-russet border border-russet/20",
	// Order / payment states
	open: "bg-taupe/10 text-taupe border border-taupe/20",
	processing: "bg-taupe/10 text-taupe border border-taupe/20",
	confirmed: "bg-amber/10 text-amber border border-amber/20",
	paid: "bg-success/10 text-success border border-success/20",
	shipped: "bg-amber/10 text-amber border border-amber/20",
	in_transit: "bg-amber/10 text-amber border border-amber/20",
	delivered: "bg-success/10 text-success border border-success/20",
	completed: "bg-success/10 text-success border border-success/20",
	cancelled: "bg-russet/10 text-russet border border-russet/20",
	refunded: "bg-warning/10 text-warning border border-warning/20",
	failed: "bg-russet/10 text-russet border border-russet/20",
	// Booking states (booking-service). `confirmed`, `completed` and `cancelled`
	// are shared with the order vocabulary above and already mapped.
	pending_payment: "bg-warning/10 text-warning border border-warning/20",
	rescheduled: "bg-warning/10 text-warning border border-warning/20",
	no_show: "bg-russet/10 text-russet border border-russet/20",
	expired: "bg-pearl/50 text-taupe border border-pearl",
	held: "bg-taupe/10 text-taupe border border-taupe/20",
	// Vendor / KYC
	active: "bg-success/10 text-success border border-success/20",
	inactive: "bg-pearl/50 text-taupe border border-pearl",
	under_review: "bg-warning/10 text-warning border border-warning/20",
	verified: "bg-success/10 text-success border border-success/20",
	// Support tickets
	open_ticket: "bg-taupe/10 text-taupe border border-taupe/20",
	in_progress: "bg-amber/10 text-amber border border-amber/20",
	resolved: "bg-success/10 text-success border border-success/20",
	closed: "bg-pearl/50 text-taupe border border-pearl",
	// Return / dispute
	requested: "bg-warning/10 text-warning border border-warning/20",
	accepted: "bg-success/10 text-success border border-success/20",
	disputed: "bg-russet/10 text-russet border border-russet/20",
	escalated: "bg-russet/10 text-russet border border-russet/20",
};

interface StatusBadgeProps {
	status: string;
	colorMap?: Record<string, string>;
}

export function StatusBadge({ status, colorMap }: StatusBadgeProps) {
	if (!status) return null;
	const map = colorMap ?? DEFAULT_COLOR_MAP;
	const colorClass = map[status] ?? "bg-pearl/50 text-taupe border border-pearl";
	const label = status
		.replace(/_/g, " ")
		.replace(/\b\w/g, (c) => c.toUpperCase());

	return (
		<span
			className={cn(
				"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
				colorClass,
			)}
		>
			{label}
		</span>
	);
}
