"use client";

import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { Eyebrow } from "@/components/ui/maison-primitives";
import type { CreateBookingResponse, PaymentMode } from "@/lib/booking/types";
import { formatPrice } from "@/lib/utils";

// Interim Stripe card flow (loadStripe/CardElement/confirmCardPayment) for
// deposit/prepay offerings; online payments stay disabled until M2.
//
// Created lazily on first render rather than at import time, so merely
// importing this module never injects Stripe.js. Only deposit/prepay
// bookings mount it (booking-checkout.tsx loads it via next/dynamic), and M2
// replaces it with the MyFatoorah hosted checkout.
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(): Promise<Stripe | null> {
  stripePromise ??= loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
  return stripePromise;
}
const STRIPE_DEFAULT_POSTAL_CODE = "00000";

export interface BookingPaymentProps {
  /** Only "deposit" or "prepay" ever mount this component — pay_at_venue never touches Stripe. */
  paymentMode: Extract<PaymentMode, "deposit" | "prepay">;
  /** Pre-create client estimate (computeDepositFils). Drives the Stripe
   * Elements `amount`/key and must stay stable across the create call —
   * see the comment at the booking-checkout.tsx call site. */
  depositFils: number;
  /** Backend-confirmed deposit_fils from the POST /bookings response, once
   * it exists. When set, all displayed copy (title/note/button label)
   * reads this instead of `depositFils` so there's one source of truth for
   * the charged figure post-create (Finding m-3). */
  confirmedDepositFils?: number;
  locale: string;
  billingName: string;
  billingPhone: string;
  disabled: boolean;
  /**
   * Calls POST /bookings (owned by the parent, which holds hold_token/
   * address/notes state). Returns null if the parent already routed to an
   * error/conflict/blocked phase — in that case this component does nothing
   * further (no Stripe call).
   */
  onCreate: () => Promise<CreateBookingResponse | null>;
  onConfirmed: (bookingId: string) => void;
  onFailed: (message: string) => void;
}

export function BookingPayment(props: BookingPaymentProps) {
  const elementsOptions = useMemo<StripeElementsOptions>(
    () =>
      props.paymentMode === "deposit"
        ? { mode: "payment", currency: "aed", amount: Math.max(props.depositFils, 1) }
        : { mode: "setup", currency: "aed" },
    [props.paymentMode, props.depositFils],
  );

  return (
    <Elements
      key={`booking-stripe-${props.paymentMode}-${props.depositFils}`}
      stripe={getStripe()}
      options={elementsOptions}
    >
      <BookingPaymentInner {...props} />
    </Elements>
  );
}

function BookingPaymentInner({
  paymentMode,
  depositFils,
  confirmedDepositFils,
  locale,
  billingName,
  billingPhone,
  disabled,
  onCreate,
  onConfirmed,
  onFailed,
}: BookingPaymentProps) {
  const t = useTranslations("booking.checkout");
  const stripe = useStripe();
  const elements = useElements();
  // Single source for displayed copy: the backend-confirmed figure once
  // POST /bookings has returned, else the pre-create estimate.
  const displayDepositFils = confirmedDepositFils ?? depositFils;
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  /** Synchronous re-entrancy guard (ref, not state) so a same-frame
   * double-tap on "Pay deposit"/"Save card" can't fire a second
   * POST /bookings before the `submitting` state re-render lands. Locked
   * for the whole create→Stripe-confirm pipeline, unlocked in `finally`. */
  const submitLockRef = useRef(false);

  async function handleSubmit() {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setCardError(null);

    if (!stripe || !elements) {
      setCardError(t("stripeNotLoaded"));
      submitLockRef.current = false;
      return;
    }
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError(t("cardNotEntered"));
      submitLockRef.current = false;
      return;
    }

    setSubmitting(true);
    try {
      const result = await onCreate();
      if (!result) return; // parent already transitioned to an error/conflict/blocked phase

      if (!result.client_secret) {
        onFailed(t("paymentFailed"));
        return;
      }

      const billing_details = {
        name: billingName || undefined,
        phone: billingPhone || undefined,
        address: { postal_code: STRIPE_DEFAULT_POSTAL_CODE },
      };

      if (paymentMode === "deposit") {
        // Deposit: client_secret is a capture-now PaymentIntent for
        // deposit_fils only (never the full price) — see phase7-recon-api.md §2.
        const { error, paymentIntent } = await stripe.confirmCardPayment(result.client_secret, {
          payment_method: { card: cardElement, billing_details },
        });
        if (error) {
          onFailed(error.message || t("paymentFailed"));
          return;
        }
        if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
          onConfirmed(result.booking.id);
        } else {
          onFailed(t("paymentFailed"));
        }
      } else {
        // Prepay: client_secret is a SetupIntent — this only SAVES a card
        // off-session, nothing is charged now. The off-session authorization
        // charge happens later via a background job, not synchronously here.
        const { error, setupIntent } = await stripe.confirmCardSetup(result.client_secret, {
          payment_method: { card: cardElement, billing_details },
        });
        if (error) {
          onFailed(error.message || t("paymentFailed"));
          return;
        }
        if (setupIntent?.status === "succeeded") {
          onConfirmed(result.booking.id);
        } else {
          onFailed(t("paymentFailed"));
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      onFailed(error.response?.data?.message || error.message || t("paymentFailed"));
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  }

  return (
    <div className="mt-6">
      <Eyebrow className="mb-2 text-sm">
        {paymentMode === "deposit"
          ? t("depositCardTitle", { amount: formatPrice(displayDepositFils, "AED", locale) })
          : t("prepayCardTitle")}
      </Eyebrow>
      <p className="mb-3 text-sm text-nl-russet">
        {paymentMode === "deposit"
          ? t("depositConfirmNote", { amount: formatPrice(displayDepositFils, "AED", locale) })
          : t("prepayConfirmNote")}
      </p>

      <div className="rounded-lg border border-nl-cacao/15 bg-nl-linen px-4 py-3.5 shadow-sm transition focus-within:border-nl-amber focus-within:ring-2 focus-within:ring-nl-amber/20">
        <CardElement options={{ style: { base: { fontSize: "15px" } } }} />
      </div>

      {cardError && <p className="mt-2 text-xs text-destructive">{cardError}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || submitting || !stripe}
        className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nl-amber/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting
          ? t("processing")
          : paymentMode === "deposit"
            ? t("payDeposit", { amount: formatPrice(displayDepositFils, "AED", locale) })
            : t("saveCardConfirm")}
      </button>
    </div>
  );
}
