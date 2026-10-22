"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { useReviewBooking } from "@/lib/queries/booking";
import { Eyebrow } from "@/components/ui/maison-primitives";

/**
 * Review form — completed bookings only (task-3-brief.md's review
 * addendum). Star rating (required) + optional title/body, mirrors
 * `components/account/review-form.tsx`'s (order-item review) shape and
 * inline-panel pattern for visual consistency. No media upload: apps/web has
 * no reusable upload component (S3ImageUploadField/ImageUploader live in
 * @mypickuae/ui but are consumed by vendor-dashboard/admin-panel product
 * forms, not the storefront) — adding one is out of scope for this task, so
 * `media_urls` is simply never sent.
 *
 * One review per booking: a 409 from the mutation means someone already
 * reviewed it (there is no GET to detect this ahead of time) — the parent
 * (detail page) is told via `onAlreadyReviewed` and flips to the
 * "already reviewed" state; every other outcome is handled locally.
 */
export function BookingReviewForm({
  bookingId,
  onSubmitted,
  onAlreadyReviewed,
}: {
  bookingId: string;
  onSubmitted: () => void;
  onAlreadyReviewed: () => void;
}) {
  const t = useTranslations("booking.myBookings.review");
  const tCommon = useTranslations("common");
  const reviewMutation = useReviewBooking();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-nl-cacao/15 bg-nl-linen px-3 py-2 text-sm text-nl-cacao outline-none transition placeholder:text-nl-russet/70 focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setErrorMessage(null);
    try {
      await reviewMutation.mutateAsync({
        bookingId,
        body: { rating, title: title.trim() || undefined, body: body.trim() || undefined },
      });
      onSubmitted();
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      if (error.response?.status === 409) {
        onAlreadyReviewed();
        return;
      }
      setErrorMessage(error.response?.data?.message || error.message || t("genericError"));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-nl-cacao/10 bg-nl-linen p-4 shadow-sm sm:p-5"
    >
      <Eyebrow className="text-sm">{t("title")}</Eyebrow>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={t("ratingLabel", { star })}
            className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-nl-amber"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoverRating || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-nl-cacao/25"
              }`}
            />
          </button>
        ))}
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("titlePlaceholder")}
        className={inputClass}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("bodyPlaceholder")}
        rows={3}
        className={inputClass}
      />

      {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}

      <button
        type="submit"
        disabled={rating === 0 || reviewMutation.isPending}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nl-amber/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {reviewMutation.isPending ? tCommon("loading") : t("submit")}
      </button>
    </form>
  );
}
