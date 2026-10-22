"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishReel, updateReelMetadata } from "@/lib/api/reels";
import { ThumbnailPicker } from "./thumbnail-picker";

interface ReelProp {
  id: string;
  video_playback_url: string;
  thumbnail_url: string;
  video_duration_seconds: number;
  caption?: string | null;
  language_code: string;
  is_sponsored_disclosed: boolean;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "ur", label: "اردو" },
  { code: "ml", label: "മലയാളം" },
];

export function ReelMetadataForm({ reel }: { reel: ReelProp }) {
  const router = useRouter();
  const [caption, setCaption] = useState(reel.caption ?? "");
  const [language, setLanguage] = useState(reel.language_code);
  const [thumbnail, setThumbnail] = useState(reel.thumbnail_url);
  const [sponsored, setSponsored] = useState(reel.is_sponsored_disclosed);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveMetadata() {
    await updateReelMetadata(reel.id, {
      caption,
      language_code: language,
      thumbnail_url: thumbnail,
      is_sponsored_disclosed: sponsored,
    });
  }

  async function handleSaveDraft() {
    setBusy(true);
    setError(null);
    try {
      await saveMetadata();
      router.push("/me/reels");
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function handlePublish() {
    setBusy(true);
    setError(null);
    try {
      await saveMetadata();
      const result = await publishReel(reel.id);
      router.push(`/reels/${result.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? "Failed to publish");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <video
        src={reel.video_playback_url}
        poster={reel.thumbnail_url}
        controls
        playsInline
        className="w-full aspect-[9/16] rounded-2xl bg-black object-contain"
      />

      <div>
        <label htmlFor="reel-caption" className="block text-sm font-medium text-nl-cacao mb-1.5">Caption</label>
        <textarea
          id="reel-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={500}
          placeholder="Share your thoughts (optional, 500 chars max)"
          className="rounded-lg border border-nl-cacao/15 bg-nl-linen px-3.5 py-2.5 text-sm text-nl-cacao outline-none transition-colors placeholder:text-nl-russet/60 focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20 w-full h-24"
        />
        <div className="mt-1 text-xs text-nl-russet">{caption.length}/500</div>
      </div>

      <div>
        <label htmlFor="reel-language" className="block text-sm font-medium text-nl-cacao mb-1.5">Language</label>
        <select
          id="reel-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-lg border border-nl-cacao/15 bg-nl-linen px-3.5 py-2.5 text-sm text-nl-cacao outline-none transition-colors placeholder:text-nl-russet/60 focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <ThumbnailPicker
        candidates={[reel.thumbnail_url]}
        initialUrl={reel.thumbnail_url}
        onChange={setThumbnail}
      />

      <label className="flex items-center gap-2 text-sm text-nl-cacao">
        <input
          type="checkbox"
          checked={sponsored}
          onChange={(e) => setSponsored(e.target.checked)}
          className="h-4 w-4 rounded accent-nl-amber"
        />
        This reel is sponsored or features a paid partnership
      </label>

      {error && <div className="text-destructive text-sm">{error}</div>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-nl-cacao/15 bg-nl-linen px-5 py-2.5 text-sm font-semibold text-nl-cacao hover:bg-nl-pearl transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save as draft"}
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  );
}
