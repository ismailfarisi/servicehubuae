"use client";

import { CalendarClock, Gift, type LucideIcon, Megaphone } from "lucide-react";
import type { ReactNode } from "react";
import {
  MAISON_SANS,
  MAISON_SERIF,
} from "@/components/ui/maison-primitives";
import type { CollabOpportunity, CollabType } from "@/lib/api/collab";

const TYPE_ICON: Record<CollabType, LucideIcon> = {
  // Legacy rows only — product seeding can no longer be created.
  product_seeding: Gift,
  paid_campaign: Megaphone,
  event_appearance: CalendarClock,
};

interface CollabCardProps {
  opportunity: CollabOpportunity;
  /** Small meta line under the title/vendor — type, deadline, slots, status, whatever the caller needs. */
  metaLine: ReactNode;
  children?: ReactNode;
}

export function CollabCard({ opportunity, metaLine, children }: CollabCardProps) {
  const thumbnailUrl = opportunity.vendor_logo_url;
  const Icon = TYPE_ICON[opportunity.type];

  return (
    <li
      className="flex gap-4 rounded-2xl border border-nl-cacao/10 bg-nl-linen p-3 shadow-sm"
    >
      <div
        className="w-16 h-16 shrink-0 flex items-center justify-center overflow-hidden rounded-xl bg-nl-pearl"
      >
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Icon
            className="h-6 w-6"
            style={{ color: "hsl(var(--nl-russet))" }}
            strokeWidth={1.25}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="line-clamp-1"
          style={{
            fontFamily: MAISON_SERIF,
            fontSize: 16,
            fontWeight: 600,
            color: "hsl(var(--nl-cacao))",
          }}
        >
          {opportunity.title}
        </div>
        {opportunity.vendor_name && (
          <div
            className="mt-0.5"
            style={{ fontFamily: MAISON_SANS, fontSize: 12, color: "hsl(var(--nl-russet))" }}
          >
            {opportunity.vendor_name}
          </div>
        )}
        <div
          className="mt-1"
          style={{
            fontFamily: MAISON_SANS,
            fontSize: 12,
            fontWeight: 500,
            color: "hsl(var(--nl-russet))",
          }}
        >
          {metaLine}
        </div>
        {children && <div className="mt-2">{children}</div>}
      </div>
    </li>
  );
}
