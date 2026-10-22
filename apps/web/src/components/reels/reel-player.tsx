"use client";

import { useRef } from "react";

// Tap anywhere on the video toggles play/pause.

interface Props {
  reelId: string;
  playbackUrl: string;
  thumbnailUrl: string;
  /** Default "cover" — fills the slot and crops. Use "contain" to letterbox and show the full 9:16 frame inside a wider/taller slot. */
  fit?: "cover" | "contain";
}

export function ReelPlayer({ reelId, playbackUrl, thumbnailUrl, fit = "cover" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }

  return (
    // Fill the parent slot (typically a snap section sized to the viewport);
    // the inner box stays 9:16 and centers.
    <div
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
      data-reel-id={reelId}
    >
      <div className="relative h-full aspect-[9/16] max-w-full">
        <video
          ref={videoRef}
          src={playbackUrl}
          poster={thumbnailUrl}
          playsInline
          autoPlay
          muted
          loop
          onClick={togglePlay}
          className={`absolute inset-0 w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        />
      </div>
    </div>
  );
}
