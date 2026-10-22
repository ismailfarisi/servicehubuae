"use client";

import { useEffect, useState } from "react";
import { Eyebrow } from "@/components/ui/maison-primitives";
import {
  BOX,
  BUTTON_CLASS,
  ErrorNote,
  Pill,
  Quiet,
  SECONDARY_BUTTON_CLASS,
  SMALL_PRIMARY,
  SMALL_SECONDARY,
  type Tone,
} from "@/components/creator/maison-ui";
import {
  type CreatorBid,
  type CreatorBidStatus,
  getCreatorBids,
  withdrawBid,
} from "@/lib/api/creator";
import { DeliverDialog } from "./_components/deliver-dialog";

/** Amber = still live, green = done, red = turned down, grey = closed by the creator. */
const STATUS_TONE: Record<CreatorBidStatus, Tone> = {
  pending: "amber",
  accepted: "amber",
  delivered: "amber",
  revision_requested: "amber",
  completed: "success",
  rejected: "danger",
  withdrawn: "muted",
  declined: "muted",
};

function aed(fils: string): string {
  return `AED ${(Number(fils) / 100).toFixed(2)}`;
}

export default function MyBidsPage() {
  const [bids, setBids] = useState<CreatorBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deliver, setDeliver] = useState<CreatorBid | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setBids(await getCreatorBids());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bids");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onWithdraw(bid: CreatorBid) {
    setBusyId(bid.bid_id);
    try {
      await withdrawBid(bid.brief_id, bid.bid_id);
      await load();
    } catch {
      setError("Could not withdraw bid.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <Eyebrow>Licensing</Eyebrow>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
          My bids
        </h1>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      {!error && loading && bids.length === 0 && (
        <div className="py-6">
          <Quiet>Loading…</Quiet>
        </div>
      )}
      {!error && !loading && bids.length === 0 && (
        <div className="py-12 text-center" style={BOX}>
          <Quiet>No bids yet. Browse open briefs to pitch.</Quiet>
        </div>
      )}

      <div className="space-y-2.5">
        {bids.map((b) => {
          const canDeliver = b.status === "accepted" || b.status === "revision_requested";
          return (
            <div key={b.bid_id} className="p-4" style={BOX}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold text-nl-cacao">
                    {b.brief_title}
                  </div>
                  <div className="mt-1 font-display text-base font-bold text-nl-cacao">
                    {aed(b.amount_fils)}
                  </div>
                  {b.delivery_deadline_at && canDeliver && (
                    <div className="mt-0.5 text-xs text-nl-russet">
                      Deliver by {new Date(b.delivery_deadline_at).toLocaleString()}
                    </div>
                  )}
                </div>
                <Pill tone={STATUS_TONE[b.status]}>{b.status.replace(/_/g, " ")}</Pill>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {b.status === "pending" && (
                  <button
                    type="button"
                    disabled={busyId === b.bid_id}
                    onClick={() => onWithdraw(b)}
                    className={SECONDARY_BUTTON_CLASS}
                    style={SMALL_SECONDARY}
                  >
                    Withdraw
                  </button>
                )}
                {canDeliver && (
                  <button
                    type="button"
                    onClick={() => setDeliver(b)}
                    className={BUTTON_CLASS}
                    style={SMALL_PRIMARY}
                  >
                    {b.status === "revision_requested" ? "Re-deliver" : "Deliver"}
                  </button>
                )}
                {b.status === "delivered" && (
                  <span className="text-xs text-nl-russet">
                    Awaiting brand review
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {deliver && (
        <DeliverDialog
          briefId={deliver.brief_id}
          bidId={deliver.bid_id}
          onClose={() => setDeliver(null)}
          onDelivered={() => {
            setDeliver(null);
            load();
          }}
        />
      )}
    </div>
  );
}
