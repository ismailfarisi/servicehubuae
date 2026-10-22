"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/stores/auth";
import { useAddresses } from "@/lib/queries/account";
import { useCreateBooking, useHoldBooking, useBookingPoll } from "@/lib/queries/booking";
import { computeDepositFils } from "@/lib/booking/money";
import type {
  Booking,
  BookingHoldResponse,
  CreateBookingBody,
  CreateBookingResponse,
  OfferingStaffMember,
  PaymentMode,
  ServiceOffering,
  VendorLocation,
} from "@/lib/booking/types";
import { formatDateInZone, formatPrice, formatTimeInZone } from "@/lib/utils";
import {
  Eyebrow,
  SerifTitle,
} from "@/components/ui/maison-primitives";
import { TermsBlock } from "@/components/booking/terms-block";
import {
  BookingAddressForm,
  EMPTY_HOME_VISIT_ADDRESS,
  type HomeVisitAddressState,
} from "@/components/booking/booking-address-form";
import { isOnlinePaymentUnavailableError, ONLINE_PAYMENTS_ENABLED } from "@/lib/booking/online-payments";
import { BookingSuccess } from "@/components/booking/booking-success";

/** Poll GET /bookings/:id every 2s (see useBookingPoll); give up after 45s
 * of no status flip and show a "still confirming" state — Stripe webhooks
 * normally land within a few seconds, so 45s is a generous margin before
 * asking the customer to wait/retry rather than staring at a spinner. */
const POLL_TIMEOUT_MS = 45_000;

/**
 * The card form (Stripe Elements) is loaded only when a deposit/prepay
 * offering actually renders it, so a pay_at_venue booking never downloads or
 * initialises Stripe. Online payments are off until MyFatoorah lands (M2),
 * which replaces this component.
 */
const BookingPayment = dynamic(
  () => import("@/components/booking/booking-payment").then((m) => m.BookingPayment),
  { ssr: false },
);

type Phase =
  | "holding"
  | "hold-conflict"
  | "hold-error"
  | "blocked"
  | "online-unavailable"
  | "form"
  | "hold-expired"
  | "creating"
  | "create-conflict"
  | "create-error"
  | "payment-failed"
  | "polling"
  | "poll-timeout"
  | "success";

interface Selection {
  start: string;
  end: string;
  tz: string;
  staff?: string;
  location?: string;
  customerAreaId?: string;
  mode?: string;
}

interface Props {
  locale: string;
  slug: string;
  offering: ServiceOffering;
  staffList: OfferingStaffMember[];
  locations: VendorLocation[];
  customerAreaName: string | null;
  selection: Selection;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function BookingCheckout(props: Props) {
  const { isReady } = useRequireAuth();
  if (!isReady) return <LoadingShell />;
  return <BookingCheckoutReady {...props} />;
}

function BookingCheckoutReady({
  locale: _locale,
  slug,
  offering,
  staffList,
  locations,
  customerAreaName,
  selection,
}: Props) {
  const t = useTranslations("booking.checkout");
  const tBooking = useTranslations("booking");
  const tService = useTranslations("service");
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const { data: addresses } = useAddresses();

  const holdMutation = useHoldBooking();
  const createMutation = useCreateBooking();

  const [phase, setPhase] = useState<Phase>("holding");
  const [holdData, setHoldData] = useState<BookingHoldResponse | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<CreateBookingResponse | null>(null);
  const [finalBooking, setFinalBooking] = useState<Booking | null>(null);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<HomeVisitAddressState>(EMPTY_HOME_VISIT_ADDRESS);
  const [notes, setNotes] = useState("");

  const holdRequested = useRef(false);
  const holdExpiresAtRef = useRef<number | null>(null);
  /** Synchronous re-entrancy guard for the pay_at_venue confirm path — a
   * ref (not state) so a same-frame double-tap is blocked before the
   * `phase==="creating"` disabled-state re-render has a chance to land.
   * Covers the whole create pipeline for this booking; a second tap while
   * locked is a no-op, never a second POST /bookings. */
  const submitLockRef = useRef(false);

  const isHomeVisit = !!selection.customerAreaId;

  // --- Hold on mount (guarded against React strict-mode double-invoke). ---
  useEffect(() => {
    if (holdRequested.current) return;
    holdRequested.current = true;
    holdMutation
      .mutateAsync({
        offering_id: offering.id,
        starts_at: selection.start,
        ends_at: selection.end,
        staff_member_id: selection.staff ?? null,
        location_id: selection.location ?? null,
        customer_area_id: selection.customerAreaId ?? null,
      })
      .then((data) => {
        setHoldData(data);
        holdExpiresAtRef.current = Date.now() + data.expires_in_seconds * 1000;
        setSecondsLeft(data.expires_in_seconds);
        const modes = data.allowed_payment_modes;
        if (modes.length === 0) {
          setPhase("blocked");
        } else if (!ONLINE_PAYMENTS_ENABLED && !modes.includes("pay_at_venue")) {
          // Deposit/prepay only, and card payments are switched off.
          setPhase("online-unavailable");
        } else {
          setPhase("form");
        }
      })
      .catch((err: unknown) => {
        const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
        if (error.response?.status === 409) {
          setPhase("hold-conflict");
        } else if (isOnlinePaymentUnavailableError(err)) {
          setPhase("online-unavailable");
        } else {
          setErrorMessage(error.response?.data?.message || error.message || t("genericError"));
          setPhase("hold-error");
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Live countdown while the customer is still on the form. ---
  useEffect(() => {
    if (phase !== "form") return;
    const interval = setInterval(() => {
      if (!holdExpiresAtRef.current) return;
      const remaining = Math.max(0, Math.round((holdExpiresAtRef.current - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setPhase("hold-expired");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // --- Post-confirm polling + its own timeout guard. ---
  const pollQuery = useBookingPoll(bookingResult?.booking.id, phase === "polling");

  useEffect(() => {
    if (phase !== "polling") return;
    const timeout = setTimeout(() => {
      setPhase((p) => (p === "polling" ? "poll-timeout" : p));
    }, POLL_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "polling" || !pollQuery.data) return;
    const status = pollQuery.data.status;
    if (status === "confirmed") {
      setFinalBooking(pollQuery.data);
      setPhase("success");
    } else if (status === "cancelled" || status === "expired") {
      setFinalBooking(pollQuery.data);
      setPhase("payment-failed");
    }
  }, [phase, pollQuery.data]);

  const staffMember = useMemo(
    () => staffList.find((s) => s.id === holdData?.staff_member_id) ?? null,
    [staffList, holdData],
  );
  const locationRecord = useMemo(
    () => locations.find((l) => l.id === selection.location) ?? null,
    [locations, selection.location],
  );

  // Show only what the offering allows. While online payments are off, a
  // pay_at_venue option wins over any card mode the hold also returned.
  const allowedModes = holdData?.allowed_payment_modes ?? [];
  const paymentMode: PaymentMode | null =
    !ONLINE_PAYMENTS_ENABLED && allowedModes.includes("pay_at_venue")
      ? "pay_at_venue"
      : (allowedModes[0] ?? null);
  // Pre-create estimate — also feeds the Stripe Elements `amount`/key in
  // BookingPayment, which must stay stable across the create call (changing
  // it would remount <Elements> and drop the card the customer just typed).
  const depositFils = useMemo(() => computeDepositFils(offering), [offering]);
  // Once POST /bookings has returned, the backend snapshot is the single
  // source of truth for the charged figure — everything displayed from
  // this point on (pay button copy if still visible during "creating",
  // success screen) reads it instead of the client estimate, closing the
  // divergence window from Finding m-3. BookingSuccess already reads
  // booking.deposit_fils directly; this only affects BookingPayment's copy.
  const confirmedDepositFils = bookingResult?.booking.deposit_fils;

  const billingName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const billingPhone = user?.phone || "";

  function resolveCustomerAddress(): Record<string, unknown> | null {
    if (!isHomeVisit) return null;
    if (!useNewAddress && selectedAddressId) {
      const addr = addresses?.find((a: any) => a.id === selectedAddressId);
      if (addr) {
        return {
          full_name: addr.full_name,
          phone: addr.phone,
          street: addr.street,
          area: addr.area,
          city: addr.city,
          emirate: addr.emirate,
        };
      }
    }
    if (!newAddress.full_name || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.emirate) {
      return null;
    }
    return { ...newAddress };
  }

  const addressReady =
    !isHomeVisit ||
    (!useNewAddress && !!selectedAddressId) ||
    (useNewAddress && !!resolveCustomerAddress());

  function buildCreateBody(): CreateBookingBody | null {
    if (!holdData) return null;
    const customer_address = resolveCustomerAddress();
    if (isHomeVisit && !customer_address) return null;
    return {
      offering_id: offering.id,
      // starts_at/ends_at must be byte-identical to the hold body (both read
      // straight from `selection`, never re-derived) and staff_member_id must
      // reuse the HOLD RESPONSE's resolved staff (not the query-param
      // selection) — the hold is server-bound to `hold:{staff}:{range}`, so
      // echoing anything else 409s on assertHeldFor even for a still-valid
      // hold. See task-2-review.md Finding C-1.
      starts_at: selection.start,
      ends_at: selection.end,
      staff_member_id: holdData.staff_member_id,
      location_id: selection.location ?? null,
      customer_area_id: selection.customerAreaId ?? null,
      customer_address,
      hold_token: holdData.hold_token,
      notes: notes.trim() || undefined,
    };
  }

  async function submitCreate(): Promise<CreateBookingResponse | null> {
    const body = buildCreateBody();
    if (!body) {
      setErrorMessage(t("addressRequired"));
      return null;
    }
    setPhase("creating");
    setErrorMessage(null);
    try {
      const result = await createMutation.mutateAsync(body);
      setBookingResult(result);
      return result;
    } catch (err: unknown) {
      const error = err as {
        response?: { status?: number; data?: { message?: string; error?: string } };
        message?: string;
      };
      if (error.response?.status === 409) {
        setPhase("create-conflict");
      } else if (error.response?.status === 422 && error.response.data?.error === "pay_at_venue_unavailable") {
        setPhase("blocked");
      } else if (isOnlinePaymentUnavailableError(err)) {
        setPhase("online-unavailable");
      } else {
        setErrorMessage(error.response?.data?.message || error.message || t("genericError"));
        setPhase("create-error");
      }
      return null;
    }
  }

  async function handleConfirmPayAtVenue() {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    try {
      const result = await submitCreate();
      if (result) {
        setFinalBooking(result.booking);
        setPhase("success");
      }
    } finally {
      submitLockRef.current = false;
    }
  }

  const dateTimeLabel = `${formatDateInZone(selection.start, selection.tz, locale)} · ${formatTimeInZone(
    selection.start,
    selection.tz,
    locale,
  )} – ${formatTimeInZone(selection.end, selection.tz, locale)}`;

  // ---- Terminal / interrupt screens ----
  if (phase === "holding") {
    return (
      <Shell>
        <p className="text-sm text-nl-russet">{t("holdingSlot")}</p>
      </Shell>
    );
  }

  if (phase === "hold-conflict" || phase === "create-conflict" || phase === "hold-expired") {
    const title = phase === "hold-expired" ? t("holdExpiredTitle") : t("slotGoneTitle");
    const body = phase === "hold-expired" ? t("holdExpiredBody") : t("slotGoneBody");
    return (
      <Shell>
        <RePickPanel title={title} body={body} slug={slug} pickAgainLabel={t("pickAgain")} />
      </Shell>
    );
  }

  if (phase === "hold-error" || phase === "create-error") {
    return (
      <Shell>
        <RePickPanel
          title={t("genericErrorTitle")}
          body={errorMessage || t("genericError")}
          slug={slug}
          pickAgainLabel={t("tryAgain")}
        />
      </Shell>
    );
  }

  if (phase === "blocked") {
    return (
      <Shell>
        <RePickPanel title={t("blockedTitle")} body={t("blockedBody")} slug={slug} pickAgainLabel={t("backToService")} />
      </Shell>
    );
  }

  if (phase === "online-unavailable") {
    return (
      <Shell>
        <RePickPanel
          title={t("onlineUnavailableTitle")}
          body={t("onlineUnavailableBody")}
          slug={slug}
          pickAgainLabel={t("backToService")}
        />
      </Shell>
    );
  }

  if (phase === "payment-failed") {
    return (
      <Shell>
        <RePickPanel
          title={t("paymentFailedTitle")}
          body={errorMessage || t("paymentFailedBody")}
          slug={slug}
          pickAgainLabel={t("backToService")}
        />
      </Shell>
    );
  }

  if (phase === "polling") {
    return (
      <Shell>
        <div className="mt-6 rounded-2xl border border-nl-cacao/10 bg-nl-linen p-5 shadow-sm sm:p-6">
          <SerifTitle size={22}>{t("pollingTitle")}</SerifTitle>
          <p className="mt-2 text-sm text-nl-russet">{t("pollingBody")}</p>
        </div>
      </Shell>
    );
  }

  if (phase === "poll-timeout") {
    return (
      <Shell>
        <RePickPanel
          title={t("pollTimeoutTitle")}
          body={t("pollTimeoutBody")}
          slug={slug}
          pickAgainLabel={t("backToService")}
        />
      </Shell>
    );
  }

  if (phase === "success" && finalBooking) {
    return (
      <Shell>
        <BookingSuccess
          locale={locale}
          booking={finalBooking}
          staffMember={staffMember}
          locationRecord={locationRecord}
          customerAreaName={customerAreaName}
          tz={selection.tz}
        />
      </Shell>
    );
  }

  // ---- Main form (phase === "form" | "creating") ----
  const submitting = phase === "creating";

  return (
    <Shell>
      <Eyebrow className="text-sm">{tService("bookThisService")}</Eyebrow>
      <SerifTitle size={28} className="mt-2">
        {t("title")}
      </SerifTitle>

      {secondsLeft !== null && (
        <p className="mt-3 inline-flex items-center rounded-full bg-nl-pearl px-3 py-1 text-xs font-semibold text-nl-amber-text">
          {t("holdCountdown", { time: formatCountdown(secondsLeft) })}
        </p>
      )}

      <div className="mt-5 divide-y divide-nl-cacao/10 rounded-2xl border border-nl-cacao/10 bg-nl-linen px-4 py-1 shadow-sm sm:px-5">
        <SummaryRow label={tBooking("stub.service")} value={offering.name} />
        <SummaryRow label={tBooking("stub.dateTime")} value={dateTimeLabel} />
        <SummaryRow label={tBooking("stub.price")} value={formatPrice(offering.price_fils, "AED", locale)} />
        {offering.location_mode === "either" && selection.mode && (
          <SummaryRow
            label={tBooking("stub.visitMode")}
            value={
              selection.mode === "home_visit"
                ? tBooking("visitModeHomeVisit")
                : tBooking("visitModeAtPremises")
            }
          />
        )}
        {locationRecord && <SummaryRow label={tBooking("stub.location")} value={locationRecord.name} />}
        {customerAreaName && <SummaryRow label={tBooking("stub.area")} value={customerAreaName} />}
        <SummaryRow
          label={tBooking("stub.professional")}
          value={staffMember ? staffMember.name : tBooking("stub.autoAssign")}
        />
      </div>

      <TermsBlock offering={offering} />

      {isHomeVisit && (
        <BookingAddressForm
          areaName={customerAreaName}
          savedAddresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddress={setSelectedAddressId}
          useNewAddress={useNewAddress}
          onToggleNewAddress={() => {
            setUseNewAddress((v) => !v);
            setSelectedAddressId(null);
          }}
          newAddress={newAddress}
          onChangeNewAddress={(field, value) => setNewAddress((prev) => ({ ...prev, [field]: value }))}
        />
      )}

      <div className="mt-6">
        <label htmlFor="booking-notes" className="mb-1.5 block text-sm font-semibold text-nl-cacao">
          {t("notesLabel")}
        </label>
        <textarea
          id="booking-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notesPlaceholder")}
          rows={3}
          className="w-full rounded-lg border border-nl-cacao/15 bg-nl-linen px-3.5 py-2.5 text-sm text-nl-cacao outline-none transition placeholder:text-nl-russet/70 focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
        />
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {paymentMode === "pay_at_venue" && (
        <button
          type="button"
          onClick={handleConfirmPayAtVenue}
          disabled={submitting || !addressReady}
          className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nl-amber/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? t("processing") : t("confirmPayAtVenue")}
        </button>
      )}

      {(paymentMode === "deposit" || paymentMode === "prepay") && (
        <BookingPayment
          paymentMode={paymentMode}
          depositFils={depositFils}
          confirmedDepositFils={confirmedDepositFils}
          locale={locale}
          billingName={billingName}
          billingPhone={billingPhone}
          disabled={submitting || !addressReady}
          onCreate={submitCreate}
          onConfirmed={() => setPhase("polling")}
          onFailed={(message) => {
            setErrorMessage(message);
            setPhase("payment-failed");
          }}
        />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      <div className="container max-w-xl py-10 md:py-16">{children}</div>
    </div>
  );
}

function LoadingShell() {
  const tCommon = useTranslations("common");
  return (
    <Shell>
      <p className="text-sm text-nl-russet">{tCommon("loading")}</p>
    </Shell>
  );
}

function RePickPanel({
  title,
  body,
  slug,
  pickAgainLabel,
}: {
  title: string;
  body: string;
  slug: string;
  pickAgainLabel: string;
}) {
  const locale = useLocale();
  return (
    <div className="mt-6 rounded-2xl border border-nl-cacao/10 bg-nl-linen p-5 shadow-sm sm:p-6">
      <SerifTitle size={22}>{title}</SerifTitle>
      <p className="mb-5 mt-2 text-sm text-nl-russet">{body}</p>
      <Link
        href={`/${locale}/service/${slug}`}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nl-amber/90"
      >
        {pickAgainLabel}
      </Link>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <span className="shrink-0 text-xs font-medium text-nl-russet">{label}</span>
      <span className="text-end text-sm font-medium text-nl-cacao">{value}</span>
    </div>
  );
}
