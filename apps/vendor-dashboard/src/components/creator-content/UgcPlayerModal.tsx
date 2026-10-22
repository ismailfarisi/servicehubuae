"use client";

import type { DiscoveryCard } from "@/lib/queries/creator-content";

export function UgcPlayerModal({
  card,
  onClose,
}: {
  card: DiscoveryCard | null;
  onClose: () => void;
}) {
  if (!card) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col gap-3 overflow-auto rounded-lg bg-white p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          src={card.video_playback_url}
          poster={card.thumbnail_url}
          controls
          className="aspect-[9/16] w-full rounded bg-black"
        />
        <div>
          <p className="font-medium">{card.creator.name}</p>
          {card.caption && <p className="text-sm text-neutral-600">{card.caption}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span>{card.engagement.views} views</span>
          <span>{card.engagement.likes} likes</span>
          <span>{card.engagement.saves} saves</span>
          <span>{card.engagement.shares} shares</span>
        </div>
        <button type="button" onClick={onClose} className="self-end rounded bg-neutral-900 px-3 py-1 text-sm text-white">
          Close
        </button>
      </div>
    </div>
  );
}
