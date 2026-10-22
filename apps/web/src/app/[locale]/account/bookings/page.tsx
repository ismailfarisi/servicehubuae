"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock } from "lucide-react";
import { useMyBookingsBucket } from "@/lib/queries/booking";
import { formatDateInZone, formatPrice, formatTimeInZone } from "@/lib/utils";
import type { Booking } from "@/lib/booking/types";
import { BOOKING_STATUS_BADGE_CLASS, bookingStatusTone } from "@/lib/booking/status";
import { resolveBookingTimeZone } from "./booking-display";
import { Eyebrow } from "@/components/ui/maison-primitives";


type Bucket = "upcoming" | "past";

export default function MyBookingsPage() {
  const t = useTranslations("booking.myBookings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [bucket, setBucket] = useState<Bucket>("upcoming");

  const query = useMyBookingsBucket(bucket);

  const bookings = useMemo(() => {
    const seen = new Set<string>();
    const merged: Booking[] = [];
    for (const page of query.data?.pages ?? []) {
      for (const b of page.bookings) {
        if (seen.has(b.id)) continue;
        seen.add(b.id);
        merged.push(b);
      }
    }
    merged.sort((a, b) => {
      const diff = new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
      return bucket === "upcoming" ? diff : -diff;
    });
    return merged;
  }, [query.data, bucket]);

  const total = query.data?.pages[0]?.total ?? 0;

  return (
    <div>
      <div className="mb-5">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
          {t("title")}
        </h1>
      </div>

      {/* Tabs */}
      <div
        className="inline-flex gap-1 mb-5 rounded-lg bg-nl-pearl p-1"
        role="tablist"
        aria-label={t("title")}
      >
        {(["upcoming", "past"] as const).map((b) => (
          <button
            key={b}
            type="button"
            role="tab"
            aria-selected={bucket === b}
            onClick={() => setBucket(b)}
            className={`rounded-md px-4 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-nl-amber ${
              bucket === b
                ? "bg-nl-linen font-semibold text-nl-amber-text shadow-sm"
                : "font-medium text-nl-russet hover:text-nl-cacao"
            }`}
          >
            {b === "upcoming" ? t("tabUpcoming") : t("tabPast")}
          </button>
        ))}
      </div>

      {query.isPending ? (
        <div className="text-sm text-nl-russet">{tCommon("loading")}</div>
      ) : query.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/60 py-8 text-center">
          <p className="text-sm text-nl-russet">{t("loadError")}</p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-2 text-sm font-semibold text-nl-amber-text hover:underline"
          >
            {tCommon("retry")}
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-nl-cacao/10 bg-nl-linen px-6 py-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-nl-pearl text-nl-amber">
            <CalendarClock className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <p className="text-sm text-nl-russet">{t("noBookings")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {bookings.map((booking) => {
              const tone = bookingStatusTone(booking.status);
              // Vendors can operate outside Asia/Dubai (LocationForm offers
              // Asia/Riyadh, Africa/Cairo, Asia/Kolkata, UTC and preserves
              // arbitrary zones), so never silently assert a zone: when the
              // booking doesn't carry one, say which zone we're showing.
              const zone = resolveBookingTimeZone(booking);
              return (
                <Link
                  key={booking.id}
                  href={`/${locale}/account/bookings/${booking.id}`}
                  className="block rounded-2xl border border-nl-cacao/10 bg-nl-linen p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-nl-amber"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-nl-cacao">
                      {booking.service_name}
                    </span>
                    <span
                      className={`inline-flex items-center whitespace-nowrap px-2.5 py-0.5 text-xs font-medium ${BOOKING_STATUS_BADGE_CLASS[tone]}`}
                    >
                      {t(`status.${booking.status}` as any)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <span className="truncate text-sm text-nl-russet">
                      {formatDateInZone(booking.starts_at, zone.timeZone, locale)} ·{" "}
                      {formatTimeInZone(booking.starts_at, zone.timeZone, locale)}
                      {!zone.confirmed && ` (${zone.timeZone})`}
                    </span>
                    <span className="whitespace-nowrap font-display text-base font-bold text-nl-cacao">
                      {formatPrice(booking.price_fils, "AED", locale)}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs text-nl-russet">
                    #{booking.booking_number}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 text-center text-xs text-nl-russet">
            {t("showingCount", { shown: bookings.length, total })}
          </div>

          {query.hasNextPage && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
                className="rounded-lg border border-nl-cacao/15 bg-nl-linen px-5 py-2.5 text-sm font-semibold text-nl-cacao hover:bg-nl-pearl transition-colors disabled:opacity-50"
              >
                {query.isFetchingNextPage ? tCommon("loading") : t("loadMore")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
