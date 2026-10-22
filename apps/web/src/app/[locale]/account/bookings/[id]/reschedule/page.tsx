"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useBooking, useServiceOfferingById, useVendorLocations } from "@/lib/queries/booking";
import { isValidTimeZone } from "@/lib/utils";
import { rescheduleWindowOpen } from "../../booking-display";
import { AvailabilityPicker } from "@/components/booking/availability-picker";
import { BookingRescheduleConfirm } from "@/components/booking/booking-reschedule-confirm";
import { Eyebrow } from "@/components/ui/maison-primitives";

/**
 * Reschedule flow (task-3-brief.md's reschedule addendum): resolves the
 * booking's service_offering_id -> a full ServiceOffering via the Task 3
 * backend enabler (GET /services/by-id/:id — bookings only carry an id, not
 * a slug), then drives the SAME AvailabilityPicker the PDP uses, handed a
 * `buildContinueHref` that sends the slot selection back to THIS route
 * (query params) instead of /book/[slug] — mirroring the PDP -> /book/[slug]
 * contract exactly, just re-targeted. Once start/end land in the URL, the
 * picker gives way to BookingRescheduleConfirm (fresh hold + POST
 * /bookings/:id/reschedule).
 */

/**
 * `customer_address` is opaque JSON on the wire — the checkout flow that
 * builds it today never sets an `area_id` field (see task-3-report.md), but
 * per the brief this is checked defensively so a future write path that DOES
 * stamp one is honored instead of always re-asking.
 */
function extractAreaId(customerAddress: Record<string, unknown> | null): string | undefined {
  const value = customerAddress?.area_id;
  return typeof value === "string" ? value : undefined;
}

export default function BookingReschedulePage() {
  const t = useTranslations("booking.myBookings.reschedule");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: booking, isLoading: bookingLoading, isError: bookingError } = useBooking(id);
  const { data: offering, isLoading: offeringLoading, isError: offeringError } = useServiceOfferingById(
    booking?.service_offering_id ?? undefined,
  );
  const { data: locations } = useVendorLocations(offering?.vendor_id);

  const start = searchParams.get("start") ?? undefined;
  const end = searchParams.get("end") ?? undefined;
  const tz = searchParams.get("tz") ?? undefined;
  const staff = searchParams.get("staff") ?? undefined;
  const location = searchParams.get("location") ?? undefined;
  const customerAreaId = searchParams.get("customer_area_id") ?? undefined;
  const mode = searchParams.get("mode") ?? undefined;

  if (bookingLoading) {
    return (
      <p className="text-sm text-nl-russet">
        {tCommon("loading")}
      </p>
    );
  }

  if (bookingError || !booking) {
    return <Blocked title={t("genericErrorTitle")} body={t("genericError")} bookingId={id} />;
  }

  if (booking.status !== "confirmed") {
    return <Blocked title={t("notConfirmedTitle")} body={t("notConfirmedBody")} bookingId={id} />;
  }

  if (!booking.service_offering_id) {
    return <Blocked title={t("noOfferingTitle")} body={t("noOfferingBody")} bookingId={id} />;
  }

  if (offeringLoading) {
    return (
      <p className="text-sm text-nl-russet">
        {tCommon("loading")}
      </p>
    );
  }

  if (offeringError || !offering) {
    return <Blocked title={t("genericErrorTitle")} body={t("genericError")} bookingId={id} />;
  }

  // ADVISORY, not a gate (see rescheduleWindowOpen): this reads the BROWSER's
  // clock, and a skewed device would dead-end a customer the server would
  // accept. The server is the authority — it answers 422
  // reschedule_window_expired, which BookingRescheduleConfirm already handles
  // with its own terminal screen. So warn and let them through.
  const windowLikelyClosed = !rescheduleWindowOpen(booking);

  // `tz` is an untrusted query param that flows into Intl via
  // formatDateInZone/formatTimeInZone; an invalid IANA name throws a
  // RangeError mid-render. Treat a bad zone as no selection so the picker
  // re-runs and re-stamps the offering's REAL zone, rather than guessing.
  const hasSelection = !!start && !!end && isValidTimeZone(tz);

  return (
    <div>
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h1 className="mt-1 font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
        {t("title")}
      </h1>

      {windowLikelyClosed && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {t("windowClosedBody", { hours: booking.reschedule_window_hours })}
        </p>
      )}

      <div className="mt-5">
        {hasSelection ? (
          <BookingRescheduleConfirm
            booking={booking}
            offering={offering}
            locations={locations ?? []}
            selection={{ start: start!, end: end!, tz: tz!, staff, location, customerAreaId, mode }}
            onRescheduled={(updated) => {
              queryClient.setQueryData(["booking", "detail", id], updated);
              router.push(`/${locale}/account/bookings/${id}`);
            }}
          />
        ) : (
          <AvailabilityPicker
            offeringId={offering.id}
            offeringSlug={offering.slug}
            locationMode={offering.location_mode}
            locations={locations ?? []}
            maxAdvanceDays={offering.max_advance_days}
            initialAreaId={extractAreaId(booking.customer_address)}
            buildContinueHref={(params) =>
              `/${locale}/account/bookings/${id}/reschedule?${params.toString()}`
            }
          />
        )}
      </div>
    </div>
  );
}

function Blocked({ title, body, bookingId }: { title: string; body: string; bookingId: string }) {
  const t = useTranslations("booking.myBookings.reschedule");
  const locale = useLocale();
  return (
    <div className="rounded-2xl border border-nl-cacao/10 bg-nl-linen p-6 shadow-sm">
      <h1 className="font-display text-xl font-semibold leading-tight text-nl-cacao">{title}</h1>
      <p className="mt-2 mb-4 text-sm text-nl-russet">{body}</p>
      <Link
        href={`/${locale}/account/bookings/${bookingId}`}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-nl-cacao/15 bg-nl-linen px-5 py-2.5 text-sm font-semibold text-nl-cacao hover:bg-nl-pearl transition-colors"
      >
        {t("backToDetail")}
      </Link>
    </div>
  );
}
