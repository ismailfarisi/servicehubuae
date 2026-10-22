"use client";

import { useState } from "react";

interface Props {
  candidates: string[];
  initialUrl: string;
  onChange: (url: string) => void;
}

export function ThumbnailPicker({ candidates, initialUrl, onChange }: Props) {
  const [selected, setSelected] = useState(initialUrl);
  const uniqueCandidates = Array.from(new Set([initialUrl, ...candidates]));

  return (
    <div>
      <p className="block text-sm font-medium text-nl-cacao mb-2">Thumbnail</p>
      <div className="flex gap-2">
        {uniqueCandidates.map((url) => (
          <button
            key={url}
            type="button"
            onClick={() => {
              setSelected(url);
              onChange(url);
            }}
            className={`overflow-hidden rounded-xl border-2 transition-colors ${
              selected === url ? "border-nl-amber ring-2 ring-nl-amber/20" : "border-transparent hover:border-nl-cacao/15"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="thumbnail option" className="w-20 h-32 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
