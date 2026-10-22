"use client";

import { useMemo, useState } from "react";
import { BidModal } from "./bid-modal";

export interface PublicBrief {
  id: string;
  vendor_slug: string | null;
  vendor_name: string | null;
  title: string;
  rights_scope: string;
  budget_guide_fils: string | null;
  target_category: string | null;
  bids_close_at: string;
  created_at: string;
}

const RIGHTS_LABEL: Record<string, string> = {
  in_platform: "In-platform",
  off_platform: "Off-platform",
  both: "In + off-platform",
};

function aed(fils: string | null): string {
  if (!fils) return "—";
  return `AED ${(Number(fils) / 100).toFixed(2)}`;
}

function closesIn(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "Closed";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `Closes in ${days}d`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `Closes in ${hours}h`;
  const mins = Math.floor(ms / 60_000);
  return mins > 0 ? `Closes in ${mins}m` : "Closing soon";
}

function isClosed(iso: string): boolean {
  return new Date(iso).getTime() - Date.now() <= 0;
}

export function BriefBoard({ briefs }: { briefs: PublicBrief[] }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<PublicBrief | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return briefs;
    return briefs.filter(
      (b) =>
        b.title.toLowerCase().includes(needle) ||
        (b.vendor_name ?? "").toLowerCase().includes(needle) ||
        (b.target_category ?? "").toLowerCase().includes(needle),
    );
  }, [briefs, q]);

  if (briefs.length === 0) {
    return (
      <div className="rounded-2xl border border-nl-cacao/10 bg-nl-linen p-8 text-center text-sm text-nl-russet shadow-sm">
        No open briefs right now. Check back soon.
      </div>
    );
  }

  return (
    <>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by title, brand, or category…"
        className="mb-5 w-full rounded-lg border border-nl-cacao/15 bg-nl-linen px-4 py-2.5 text-sm text-nl-cacao outline-none transition-colors placeholder:text-nl-russet/60 focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((b) => {
          const closed = isClosed(b.bids_close_at);
          return (
          <div key={b.id} className="flex flex-col rounded-2xl border border-nl-cacao/10 bg-nl-linen p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-medium text-nl-russet">{b.vendor_name ?? "Brand"}</div>
                <div className="mt-0.5 truncate font-display font-semibold text-nl-cacao">{b.title}</div>
              </div>
              <span className="whitespace-nowrap rounded-full bg-nl-pearl px-2.5 py-0.5 text-xs font-medium text-nl-amber-text">
                {closesIn(b.bids_close_at)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-nl-russet">
              <div>
                <span className="font-medium text-foreground">Budget: </span>
                {aed(b.budget_guide_fils)}
              </div>
              <div>
                <span className="font-medium text-foreground">Rights: </span>
                {RIGHTS_LABEL[b.rights_scope] ?? b.rights_scope}
              </div>
              {b.target_category && (
                <div>
                  <span className="font-medium text-foreground">Category: </span>
                  {b.target_category}
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={closed}
              onClick={() => setActive(b)}
              className="mt-4 self-start inline-flex items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {closed ? "Closed" : "Place a bid"}
            </button>
          </div>
          );
        })}
      </div>
      {active && <BidModal brief={active} onClose={() => setActive(null)} />}
    </>
  );
}
