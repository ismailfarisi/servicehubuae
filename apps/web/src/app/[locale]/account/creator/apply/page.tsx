"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth";
import {
  useApplyForCreator,
  useMyCreatorApplication,
} from "@/lib/queries/account";
import { finalizeAvatarUpload, presignAvatarUpload } from "@/lib/api/creator-profile";
import { Eyebrow, MaisonCheck } from "@/components/ui/maison-primitives";

// Same caps as the post-approval media kit's photo upload
// (account/creator/_sections/media-kit.tsx) — one avatar-processing pipeline,
// two entry points.
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

// Creator niches, aligned with the top-level service categories seeded in
// backend/libs/database/src/seeds/index.ts plus a few lifestyle niches.
// Duplicated verbatim in apps/vendor-dashboard/src/app/(dashboard)/creators/
// page.tsx (the creator directory filter) — change both together.
const CATEGORIES = [
  "AC & Home Maintenance",
  "Home Cleaning",
  "Beauty & Wellness",
  "Fitness",
  "Pest Control & Pets",
  "Moving",
  "Car Care",
  "Events",
  "Fit-out & Construction",
  "Lifestyle",
];

interface FormState {
  display_name: string;
  bio: string;
  primary_category: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  follower_estimate: string;
  sample_urls: string;
  motivation: string;
  agreed_to_terms: boolean;
}

const INITIAL_FORM: FormState = {
  display_name: "",
  bio: "",
  primary_category: CATEGORIES[0],
  instagram: "",
  tiktok: "",
  youtube: "",
  follower_estimate: "",
  sample_urls: "",
  motivation: "",
  agreed_to_terms: false,
};

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-nl-cacao/15 bg-nl-linen px-3.5 py-2.5 text-sm text-nl-cacao outline-none transition-colors focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20";

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors disabled:opacity-50";

const FIELD_LABEL = "text-sm font-medium text-nl-cacao";

export default function CreatorApplyPage() {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const isCreator =
    user?.creator_tier === "creator" || user?.creator_tier === "influencer";

  const { data: existing, isLoading: loading } = useMyCreatorApplication();
  const applyMutation = useApplyForCreator();

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Writes straight to users.avatar_url via the same presign/finalize pair the
  // post-approval media kit uses — an applicant isn't a creator yet, so this
  // can't wait for the creator_applications row the apply mutation creates.
  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_AVATAR_TYPES.includes(file.type) || file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t("creatorProfilePhotoFailed"));
      return;
    }
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      const { uploadUrl, key } = await presignAvatarUpload(file.name, file.type);
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error(t("creatorProfilePhotoFailed"));
      const { avatar_url } = await finalizeAvatarUpload(key);
      if (user) setUser({ ...user, avatar_url });
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : t("creatorProfilePhotoFailed"));
    } finally {
      setAvatarBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, boolean> = {};
    // DTO requires display_name minLength 2 — block a 1-char name client-side.
    if (form.display_name.trim().length < 2) errors.display_name = true;
    if (!form.bio.trim()) errors.bio = true;
    if (!form.agreed_to_terms) errors.agreed_to_terms = true;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const social_links: Record<string, string> = {};
    if (form.instagram) social_links.instagram = form.instagram;
    if (form.tiktok) social_links.tiktok = form.tiktok;
    if (form.youtube) social_links.youtube = form.youtube;
    const sample_urls = form.sample_urls
      ? form.sample_urls
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 10)
      : undefined;

    try {
      await applyMutation.mutateAsync({
        display_name: form.display_name,
        bio: form.bio,
        primary_category: form.primary_category,
        social_links,
        // Omit (undefined) rather than send null — t.Optional rejects null.
        follower_estimate: form.follower_estimate
          ? Number(form.follower_estimate)
          : undefined,
        sample_urls,
        motivation: form.motivation || undefined,
        agreed_to_terms: form.agreed_to_terms,
      });
    } catch {
      // surfaced below via applyMutation.isError
    }
  }

  if (isCreator) {
    return (
      <div className="space-y-4">
        <Eyebrow>Creator</Eyebrow>
        <h1 className="font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">{t("creatorApplyAlreadyTitle")}</h1>
        <button
          type="button"
          onClick={() => router.replace(`/${locale}/account/creator`)}
          className="text-sm font-semibold text-nl-amber-text hover:underline"
        >
          {t("creatorApplyGoDashboard")} →
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-nl-russet">
        {tCommon("loading")}
      </div>
    );
  }

  const showStatus =
    applyMutation.isSuccess ||
    (existing &&
      (existing.status === "pending" ||
        existing.status === "approved" ||
        existing.status === "needs_info"));

  if (showStatus) {
    // needs_info is an OPEN status backend-side (creator-application.service.ts
    // OPEN_STATUSES) — resubmitting 409s, so show a status view (with the
    // reviewer's notes) instead of the submittable form.
    const isNeedsInfo = !applyMutation.isSuccess && existing?.status === "needs_info";
    return (
      <div className="space-y-3 rounded-2xl border border-nl-cacao/10 bg-nl-linen p-6 shadow-sm">
        <Eyebrow>Creator</Eyebrow>
        <h1 className="font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
          {isNeedsInfo ? t("creatorApplyNeedsInfo") : t("creatorApplyPendingTitle")}
        </h1>
        {isNeedsInfo ? (
          existing?.review_notes && (
            <p className="text-sm text-nl-russet">
              {existing.review_notes}
            </p>
          )
        ) : (
          <p className="text-sm text-nl-russet">
            {t("creatorApplyPendingBody")}
          </p>
        )}
      </div>
    );
  }

  // rejected / no application → show the form (prefilled note if any)
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Creator</Eyebrow>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
          {t("creatorApplyTitle")}
        </h1>
        <p className="mt-2 text-sm text-nl-russet">
          {t("creatorApplyIntro")}
        </p>
      </div>

      {existing?.status === "rejected" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {t("creatorApplyRejected")}
          {existing.review_notes ? `: ${existing.review_notes}` : ""}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-nl-cacao/10 bg-nl-linen p-5 md:p-6 shadow-sm"
      >
        <label className="block text-sm space-y-1">
          <span className={FIELD_LABEL}>{t("creatorApplyDisplayName")}</span>
          <input
            className={FIELD_CLASS}
            value={form.display_name}
            maxLength={120}
            onChange={(e) => update("display_name", e.target.value)}
          />
          {fieldErrors.display_name && (
            <span className="text-xs text-red-600">{t("required")}</span>
          )}
        </label>

        <label className="block text-sm space-y-1">
          <span className={FIELD_LABEL}>{t("creatorApplyBio")}</span>
          <textarea
            className={FIELD_CLASS}
            rows={4}
            maxLength={2000}
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
          />
          {fieldErrors.bio && <span className="text-xs text-red-600">{t("required")}</span>}
        </label>

        <label className="block text-sm space-y-1">
          <span className={FIELD_LABEL}>{t("creatorApplyCategory")}</span>
          <select
            className={FIELD_CLASS}
            value={form.primary_category}
            onChange={(e) => update("primary_category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <div className="block text-sm space-y-1.5">
          <span className={FIELD_LABEL}>{t("creatorApplyPhoto")}</span>
          <div className="flex items-center gap-3">
            <div
              className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-nl-pearl"
            >
              {user?.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <button
              type="button"
              disabled={avatarBusy}
              onClick={() => avatarInputRef.current?.click()}
              className="rounded-lg border border-nl-cacao/15 bg-nl-linen px-4 py-2 text-sm font-semibold text-nl-cacao hover:bg-nl-pearl transition-colors disabled:opacity-50"
            >
              {avatarBusy ? tCommon("loading") : t("creatorApplyAddPhoto")}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          {avatarError && (
            <span className="text-xs text-red-600">
              {avatarError}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block text-sm space-y-1">
            <span className={FIELD_LABEL}>Instagram</span>
            <input
              className={FIELD_CLASS}
              value={form.instagram}
              onChange={(e) => update("instagram", e.target.value)}
            />
          </label>
          <label className="block text-sm space-y-1">
            <span className={FIELD_LABEL}>TikTok</span>
            <input
              className={FIELD_CLASS}
              value={form.tiktok}
              onChange={(e) => update("tiktok", e.target.value)}
            />
          </label>
          <label className="block text-sm space-y-1">
            <span className={FIELD_LABEL}>YouTube</span>
            <input
              className={FIELD_CLASS}
              value={form.youtube}
              onChange={(e) => update("youtube", e.target.value)}
            />
          </label>
        </div>

        <label className="block text-sm space-y-1">
          <span className={FIELD_LABEL}>{t("creatorApplyFollowers")}</span>
          <input
            type="number"
            min={0}
            className={FIELD_CLASS}
            value={form.follower_estimate}
            onChange={(e) => update("follower_estimate", e.target.value)}
          />
        </label>

        <label className="block text-sm space-y-1">
          <span className={FIELD_LABEL}>{t("creatorApplySamples")}</span>
          <textarea
            className={FIELD_CLASS}
            rows={3}
            placeholder="https://..."
            value={form.sample_urls}
            onChange={(e) => update("sample_urls", e.target.value)}
          />
        </label>

        <label className="block text-sm space-y-1">
          <span className={FIELD_LABEL}>{t("creatorApplyMotivation")}</span>
          <textarea
            className={FIELD_CLASS}
            rows={3}
            value={form.motivation}
            onChange={(e) => update("motivation", e.target.value)}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-nl-cacao">
          <input
            type="checkbox"
            className="sr-only"
            checked={form.agreed_to_terms}
            onChange={(e) => update("agreed_to_terms", e.target.checked)}
          />
          <MaisonCheck checked={form.agreed_to_terms} />
          {t("creatorApplyTerms")}
        </label>
        {fieldErrors.agreed_to_terms && (
          <span className="text-xs text-red-600">{t("creatorApplyTermsRequired")}</span>
        )}

        {applyMutation.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {t("creatorApplyError")}
          </div>
        )}

        <button
          type="submit"
          disabled={applyMutation.isPending}
          className={`${PRIMARY_BUTTON} w-full sm:w-auto`}
        >
          {applyMutation.isPending ? t("creatorApplySubmitting") : t("creatorApplySubmit")}
        </button>
      </form>
    </div>
  );
}
