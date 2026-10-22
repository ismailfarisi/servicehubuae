"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSavedReels } from "@/lib/api/reels";
import { ReelThumbnail } from "@/components/reels/reel-thumbnail";
import { Bookmark } from "lucide-react";
import { Eyebrow } from "@/components/ui/maison-primitives";

export default function SavedReelsPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    getSavedReels()
      .then((d) => {
        if (!cancelled) setItems(d.items.map((i: any) => i.reel));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="mb-5">
        <Eyebrow>Reels</Eyebrow>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
          Saved reels
        </h1>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {items.map((r) => (
          <ReelThumbnail
            key={r.id}
            reelId={r.id}
            thumbnailUrl={r.thumbnail_url}
            viewCount={r.view_count}
            locale={locale}
          />
        ))}
        {items.length === 0 && (
          <div className="col-span-full rounded-2xl border border-nl-cacao/10 bg-nl-linen px-6 py-12 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-nl-pearl text-nl-amber">
              <Bookmark className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <p className="text-sm text-nl-russet">No saved reels yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
