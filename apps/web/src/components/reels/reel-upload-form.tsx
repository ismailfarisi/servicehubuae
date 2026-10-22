"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { requestReelUpload } from "@/lib/api/reels";
import { uploadToCloudflareStream } from "@/lib/cloudflare-tus-upload";

const MAX_SIZE_MB = 200;
const ALLOWED_TYPES = ["video/mp4", "video/quicktime"];

export function ReelUploadForm() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<"idle" | "uploading" | "complete">("idle");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum is ${MAX_SIZE_MB} MB.`);
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setError("Only MP4 or MOV files are allowed.");
      setFile(null);
      return;
    }
    setError(null);
    setProgress(0);
    setFile(f);
  }

  async function startUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setProgress(0);
    setStage("uploading");
    try {
      const { uploadUrl, reelId } = await requestReelUpload();
      uploadToCloudflareStream({
        file,
        uploadUrl,
        onProgress: (p) => setProgress(p.percent),
        onSuccess: () => {
          setProgress(100);
          setStage("complete");
          router.push(`/${locale}/reels/edit/${reelId}`);
        },
        onError: (e) => {
          setError(e.message || "Upload failed");
          setBusy(false);
          setStage("idle");
        },
      });
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setError(
        err?.response?.data?.error ?? err?.message ?? "Upload failed",
      );
      setBusy(false);
      setStage("idle");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-nl-cacao">Post a Reel</h1>
      <p className="text-sm text-nl-russet">
        Vertical video (9:16), 3–90 seconds, up to {MAX_SIZE_MB} MB. MP4 or MOV.
      </p>
      <input
        type="file"
        accept="video/mp4,video/quicktime"
        onChange={handleFileChange}
        disabled={busy}
        className="block w-full rounded-xl border border-dashed border-nl-cacao/20 bg-nl-pearl p-3 text-sm text-nl-russet file:me-4 file:rounded-lg file:border-0 file:bg-nl-amber file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:cursor-pointer hover:file:bg-nl-amber/90"
      />
      {error && (
        <div className="text-destructive text-sm" role="alert">
          {error}
        </div>
      )}
      {file && !busy && (
        <button
          type="button"
          onClick={startUpload}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          Upload
        </button>
      )}
      {busy && (
        <div className="space-y-2">
          {stage === "uploading" && (
            <>
              <div className="w-full bg-nl-pearl rounded-full h-2 overflow-hidden">
                <div
                  className="bg-nl-amber h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm text-nl-russet">Uploading… {progress}%</div>
            </>
          )}
          {stage === "complete" && (
            <div className="text-sm text-nl-russet">
              Upload complete. Opening editor…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
