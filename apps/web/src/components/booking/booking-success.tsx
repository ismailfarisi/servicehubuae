"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eyebrow, MaisonMark, SerifTitle } from "@/components/ui/maison-primitives";
import type { Booking, OfferingStaffMember, VendorLocation } from "@/lib/booking/types";
import { formatDateInZone, formatPrice, formatTimeInZone } from "@/lib/utils";

export function BookingSuccess({
  locale,
  booking,
  staffMember,
  locationRecord,
  customerAreaName,
  tz,
}: {
  locale: string;
  booking: Booking;
  staffMember: OfferingStaffMember | null;
  locationRecord: VendorLocation | null;
  customerAreaName: string | null;
  tz: string;
}) {
  const t = useTranslations("booking.checkout");
  const tBooking = useTranslations("booking");

  const chargedCopy =
    booking.payment_mode === "pay_at_venue"
      ? t("successChargedPayAtVenue", { amount: formatPrice(booking.price_fils, "AED", locale) })
      : booking.payment_mode === "deposit"
        ? t("successChargedDeposit", {
            deposit: formatPrice(booking.deposit_fils, "AED", locale),
            balance: formatPrice(Math.max(booking.price_fils - booking.deposit_fils, 0), "AED", locale),
          })
        : t("successChargedPrepay", { amount: formatPrice(booking.price_fils, "AED", locale) });

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <MaisonMark size={18} />
        <Eyebrow amber className="text-sm">
          {t("successTitle")}
        </Eyebrow>
      </div>
      <SerifTitle size={24}>{booking.service_name}</SerifTitle>

      <div className="mt-5 divide-y divide-nl-cacao/10 rounded-2xl border border-nl-cacao/10 bg-nl-linen px-4 py-1 shadow-sm sm:px-5">
        <SummaryRow label={t("successBookingNumber")} value={booking.booking_number} />
        <SummaryRow
          label={t("successDateTime")}
          value={`${formatDateInZone(booking.starts_at, tz, locale)} · ${formatTimeInZone(
            booking.starts_at,
            tz,
            locale,
          )} – ${formatTimeInZone(booking.ends_at, tz, locale)}`}
        />
        <SummaryRow
          label={t("successProfessional")}
          value={staffMember ? staffMember.name : tBooking("stub.autoAssign")}
        />
        {locationRecord && <SummaryRow label={t("successLocation")} value={locationRecord.name} />}
        {!locationRecord && customerAreaName && (
          <SummaryRow label={t("successAddress")} value={customerAreaName} />
        )}
      </div>

      <p className="mt-4 text-sm text-nl-cacao">{chargedCopy}</p>

      <Link
        href={`/${locale}/account/bookings`}
        className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nl-amber/90"
      >
        {t("viewBookings")}
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
