"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";
import { computeDepositFils } from "@/lib/booking/money";
import type { ServiceOffering } from "@/lib/booking/types";
import { Eyebrow } from "@/components/ui/maison-primitives";

/**
 * Renders the offering's booking terms (cancellation/reschedule/deposit/
 * payment-mode copy) directly from GET /services/:slug fields — Task 2
 * re-renders the same fields at checkout, so keep this presentation-only
 * and driven entirely by props (no local business logic beyond formatting).
 */
export function TermsBlock({ offering }: { offering: ServiceOffering }) {
  const t = useTranslations("service.terms");
  const locale = useLocale();

  const paymentCopy =
    offering.payment_mode === "prepay"
      ? t("paymentModePrepay")
      : offering.payment_mode === "deposit"
        ? t("paymentModeDeposit", {
            amount: formatDepositAmount(offering, locale),
          })
        : t("paymentModePayAtVenue");

  const depositCopy =
    offering.payment_mode === "deposit" && offering.deposit_type !== "none"
      ? offering.deposit_type === "percent"
        ? t("depositPercent", { percent: offering.deposit_value })
        : t("depositFixed", { amount: formatPrice(offering.deposit_value, "AED", locale) })
      : null;

  const cancellationCopy =
    offering.cancellation_refund_policy === "full"
      ? t("cancellationFull", { hours: offering.cancellation_window_hours })
      : offering.cancellation_refund_policy === "deposit_forfeit"
        ? t("cancellationDepositForfeit", {
            hours: offering.cancellation_window_hours,
          })
        : t("cancellationPercent", {
            hours: offering.cancellation_window_hours,
            percent: offering.cancellation_penalty_percent ?? 0,
          });

  return (
    <div className="mt-6 rounded-2xl border border-nl-cacao/10 bg-nl-pearl/60 p-4 sm:p-5">
      <Eyebrow className="mb-3 text-sm">{t("title")}</Eyebrow>
      <ul
        className="list-disc space-y-2 ps-5 text-sm leading-relaxed text-nl-cacao marker:text-nl-amber"
        style={{ fontFamily: "var(--font-inter), var(--font-arabic), sans-serif" }}
      >
        <li>{paymentCopy}</li>
        {depositCopy && <li>{depositCopy}</li>}
        <li>{cancellationCopy}</li>
        {offering.reschedule_window_hours > 0 && (
          <li>{t("reschedule", { hours: offering.reschedule_window_hours })}</li>
        )}
      </ul>
    </div>
  );
}

function formatDepositAmount(offering: ServiceOffering, locale: string): string {
  return formatPrice(computeDepositFils(offering), "AED", locale);
}
