"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCancelBooking } from "@/lib/queries/booking";
import { computeCancelEstimate } from "@/lib/booking/cancel-estimate";
import type { Booking, CancelBookingResponse } from "@/lib/booking/types";
import { formatPrice } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/maison-primitives";

/**
 * Cancel flow (confirmed bookings only) — task-3-brief.md's cancel addendum:
 * shows a CLIENT-SIDE estimate of the outcome before the customer confirms
 * (computeCancelEstimate, mirrors the booking-service's own math but is
 * explicitly labelled an estimate), then a reason (optional) + confirm
 * button that fires POST /bookings/:id/cancel. The response's actual
 * `within_window`/`refund_fils`/`forfeit_fils`/`action` is handed back to
 * the parent (detail page) via `onCancelled` to render as the result of
 * record — this component never re-displays its own estimate as if it were
 * final.
 */
export function BookingCancelPanel({
  booking,
  onCancelled,
}: {
  booking: Booking;
  onCancelled: (result: CancelBookingResponse) => void;
}) {
  const t = useTranslations("booking.myBookings.cancel");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const cancelMutation = useCancelBooking();

  const [expanded, setExpanded] = useState(false);
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /** Synchronous re-entrancy lock — same pattern as booking-checkout.tsx and
   * booking-payment.tsx. `disabled={cancelMutation.isPending}` is state-based
   * and only takes effect after a re-render, so a same-frame double-tap could
   * fire two POST /bookings/:id/cancel — and cancel triggers a REFUND. Locked
   * for the whole cancel round-trip, released in `finally`. */
  const submitLockRef = useRef(false);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="text-sm font-semibold text-red-700 hover:underline"
      >
        {t("trigger")}
      </button>
    );
  }

  const estimate = computeCancelEstimate(booking);

  const estimateCopy =
    estimate.kind === "no_charge"
      ? t("estimateNoCharge")
      : estimate.kind === "full_refund_deposit"
        ? t("estimateFullRefund", { amount: formatPrice(estimate.amountFils, "AED", locale) })
        : estimate.kind === "forfeit_deposit"
          ? t("estimateForfeitDeposit", { amount: formatPrice(estimate.amountFils, "AED", locale) })
          : estimate.kind === "penalty_percent_prepay_conditional"
            ? t("estimatePenaltyPercentPrepayConditional", {
                percent: estimate.penaltyPercent ?? 0,
                amount: formatPrice(estimate.amountFils, "AED", locale),
              })
            : t("estimatePenaltyPercent", {
                percent: estimate.penaltyPercent ?? 0,
                amount: formatPrice(estimate.amountFils, "AED", locale),
              });

  async function handleConfirm() {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setErrorMessage(null);
    try {
      const result = await cancelMutation.mutateAsync({
        bookingId: booking.id,
        body: { reason: reason.trim() || undefined },
      });
      onCancelled(result);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(error.response?.data?.message || error.message || t("genericError"));
    } finally {
      submitLockRef.current = false;
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/60 p-4 sm:p-5">
      <Eyebrow amber={false} className="text-sm">
        {t("confirmTitle")}
      </Eyebrow>

      <p className="mt-2 text-sm text-nl-cacao">{estimateCopy}</p>
      <p className="mt-1 text-xs text-nl-russet">{t("estimateNote")}</p>

      <label htmlFor="cancel-reason" className="mb-1.5 mt-4 block text-xs font-medium text-nl-russet">
        {t("reasonLabel")}
      </label>
      <textarea
        id="cancel-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder={t("reasonPlaceholder")}
        rows={2}
        className="w-full rounded-lg border border-nl-cacao/15 bg-nl-linen px-3.5 py-2.5 text-sm text-nl-cacao outline-none transition placeholder:text-nl-russet/70 focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
      />

      {errorMessage && <p className="mt-2 text-xs text-destructive">{errorMessage}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={cancelMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelMutation.isPending ? tCommon("loading") : t("confirmButton")}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          disabled={cancelMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-nl-cacao/15 bg-nl-linen px-5 py-2.5 text-sm font-semibold text-nl-cacao transition-colors hover:bg-nl-pearl disabled:opacity-50"
        >
          {t("dismissButton")}
        </button>
      </div>
    </div>
  );
}
