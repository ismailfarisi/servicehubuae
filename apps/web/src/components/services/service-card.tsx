"use client";

import { ImageIcon, MapPin, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePreferencesStore } from "@/stores/preferences";
import type { ServiceListItem } from "../../lib/booking/types";
import { areaNamesFor } from "./service-location-line";

function formatAmount(amountInFils: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : locale, {
    maximumFractionDigits: 0,
  }).format(amountInFils / 100);
}

export function ServiceCard({ service }: { service: ServiceListItem }) {
  const t = useTranslations("service.listing");
  const locale = useLocale();
  const { currency } = usePreferencesStore();

  const image = service.media_urls?.[0];
  const premises = areaNamesFor(service, "premises");
  const homeVisit = areaNamesFor(service, "home_visit");

  // Prefer the mode the offering leads with; "either" shows both lines'
  // worth of information in one string rather than guessing.
  //
  // Area names are interpolated through t()'s ICU params so the message
  // catalogue controls word order (required for en/ar phrasing parity).
  const locationParts: string[] = [];
  if (premises.length > 0) {
    locationParts.push(t("atPremisesIn", { areas: premises.join(", ") }));
  }
  if (homeVisit.length > 0) {
    locationParts.push(t("homeVisitIn", { areas: homeVisit.join(", ") }));
  }

  const hasRating = typeof service.rating_avg === "number" && (service.rating_count ?? 0) > 0;

  return (
    <Link
      href={`/${locale}/service/${service.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-nl-cacao/10 bg-nl-linen shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nl-amber"
      aria-label={service.name}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-nl-pearl">
        {image ? (
          <Image
            src={image}
            alt={service.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 360px"
            quality={92}
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-xs text-nl-russet">
            <ImageIcon aria-hidden="true" className="h-6 w-6 text-nl-russet/50" strokeWidth={1.5} />
            {t("noImage")}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-nl-russet">
            {service.vendor_name || service.category_name}
          </p>
          {hasRating && (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-nl-cacao">
              <Star aria-hidden="true" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {service.rating_avg?.toFixed(1)}
              <span className="font-normal text-nl-russet">({service.rating_count})</span>
            </span>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 min-h-[44px] font-display text-base font-semibold leading-snug text-nl-cacao">
          {service.name}
        </h3>

        {locationParts.length > 0 && (
          <p
            data-testid="service-location"
            className="mb-3 flex items-start gap-1 text-xs text-nl-russet"
          >
            <MapPin aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0 text-nl-russet/70" />
            <span className="line-clamp-2">{locationParts.join(" · ")}</span>
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-nl-cacao/10 pt-3">
          <div className="flex min-w-0 flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-medium text-nl-russet">{currency}</span>
              <span className="text-lg font-bold leading-none text-nl-cacao">
                {formatAmount(service.price_fils, locale)}
              </span>
            </div>
            <span className="mt-1 text-xs text-nl-russet">
              {t("duration", { minutes: service.duration_minutes })}
            </span>
          </div>
          <span className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-nl-amber px-4 text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-nl-amber/90">
            {t("book")}
          </span>
        </div>
      </div>
    </Link>
  );
}
