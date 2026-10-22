"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyReels, type MyReelSummary } from "@/lib/api/reels";
import { Plus, Video } from "lucide-react";
import { Eyebrow } from "@/components/ui/maison-primitives";

const STATUS_BADGE: Record<
  MyReelSummary["status"],
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-600",
  },
  pending_review: {
    label: "In review",
    className: "bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Published",
    className: "bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700",
  },
  removed: {
    label: "Removed",
    className: "bg-red-50 text-red-700",
  },
};

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors";

export default function MyReelsPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [items, setItems] = useState<MyReelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyReels({ limit: 50 })
      .then((res) => {
        if (!cancelled) {
          setItems(res.items);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const err = e as {
            response?: { data?: { error?: string } };
            message?: string;
          };
          setError(
            err?.response?.data?.error ?? err?.message ?? "Failed to load reels",
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <Eyebrow>Reels</Eyebrow>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
            My Reels
          </h1>
        </div>
        <Link href={`/${locale}/reels/upload`} className={`${PRIMARY_BUTTON} shrink-0`}>
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          Post a reel
        </Link>
      </div>

      {loading && <div className="text-sm text-nl-russet">Loading…</div>}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-nl-cacao/10 bg-nl-linen px-6 py-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-nl-pearl text-nl-amber">
            <Video className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <p className="text-sm text-nl-russet">You haven&apos;t posted any reels yet.</p>
          <Link href={`/${locale}/reels/upload`} className={`${PRIMARY_BUTTON} mt-4`}>
            Post your first reel
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <ul className="space-y-3">
          {items.map((r) => {
            const badge = STATUS_BADGE[r.status];
            const canEdit = r.status === "draft";
            const href = canEdit
              ? `/${locale}/reels/edit/${r.id}`
              : `/${locale}/reels/${r.id}`;
            return (
              <li
                key={r.id}
                className="flex items-center gap-4 rounded-2xl border border-nl-cacao/10 bg-nl-linen p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <Link href={href} className="flex items-center gap-4 flex-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.thumbnail_url}
                    alt=""
                    className="w-20 h-32 object-cover shrink-0 rounded-xl bg-nl-pearl"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-nl-russet">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="line-clamp-2 text-sm font-medium text-nl-cacao">
                      {r.caption || (
                        <span className="font-normal text-nl-russet">No caption</span>
                      )}
                    </div>
                    {r.status === "rejected" && r.rejection_reason && (
                      <div className="mt-1 text-xs text-red-700">
                        Reason: {r.rejection_reason}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-nl-russet">
                      {r.video_duration_seconds}s
                    </div>
                  </div>
                </Link>
                {canEdit && (
                  <Link
                    href={`/${locale}/reels/edit/${r.id}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg border border-nl-cacao/15 bg-nl-linen px-4 py-2 text-sm font-semibold text-nl-cacao hover:bg-nl-pearl transition-colors"
                  >
                    Edit
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
