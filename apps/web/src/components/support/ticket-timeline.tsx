"use client";

import { useTranslations } from "next-intl";
import type { TicketStatus } from "@/lib/queries/support";
import { MAISON_SANS } from "@/components/ui/maison-primitives";

const STATUSES: TicketStatus[] = ["open", "in_progress", "waiting_customer", "resolved", "closed"];

export function TicketTimeline({ currentStatus }: { currentStatus: TicketStatus }) {
  const t = useTranslations("support.statuses");
  const activeIdx = STATUSES.indexOf(currentStatus);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontFamily: MAISON_SANS, fontSize: 12 }}>
      {STATUSES.map((s, i) => (
        <span
          key={s}
          style={{
            padding: "2px 10px",
            fontWeight: 500,
            borderRadius: 999,
            background: i <= activeIdx ? "hsl(var(--nl-amber))" : "hsl(var(--nl-pearl))",
            color: i <= activeIdx ? "white" : "hsl(var(--nl-russet))",
          }}
        >
          {t(s)}
        </span>
      ))}
    </div>
  );
}
