"use client";

import { Clock, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AvailabilityPicker } from "@/components/booking/availability-picker";
import { TermsBlock } from "@/components/booking/terms-block";
import { Eyebrow, SerifTitle } from "@/components/ui/maison-primitives";
import type { ServiceOffering, VendorLocation } from "@/lib/booking/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  offering: ServiceOffering;
  locations: VendorLocation[];
}

export function ServiceDetailClient({ offering, locations }: Props) {
  const t = useTranslations("service");
  const locale = useLocale();
  const vatRate = Number.parseFloat(offering.vat_rate) || 0;
  const heroImage = offering.media_urls?.[0];

  return (
    <div className="bg-background min-h-screen">
      <div className="container py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Media */}
          <div className="space-y-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-nl-cacao/10 bg-nl-pearl shadow-sm">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={offering.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon
                    aria-hidden="true"
                    className="h-12 w-12 text-nl-russet/40"
                    strokeWidth={1.25}
                  />
                </div>
              )}
            </div>
            {offering.media_urls?.length > 1 && (
              <div className="flex gap-2">
                {offering.media_urls.slice(1, 5).map((url) => (
                  <div
                    key={url}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-nl-cacao/10 bg-nl-pearl"
                  >
                    <Image src={url} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details + booking */}
          <div>
            <Eyebrow className="text-sm">{t("bookThisService")}</Eyebrow>
            <SerifTitle size={30} className="mt-2">
              {offering.name}
            </SerifTitle>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold text-nl-cacao">
                {formatPrice(offering.price_fils, "AED", locale)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-nl-pearl px-3 py-1 text-xs font-medium text-nl-amber-text">
                <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                {t("duration", { minutes: offering.duration_minutes })}
              </span>
            </div>
            {vatRate > 0 && (
              <p className="mt-1 text-xs text-nl-russet">
                {t("vatIncluded", { rate: vatRate })}
              </p>
            )}

            {offering.description && (
              <p className="mt-4 text-[15px] leading-relaxed text-nl-cacao/90">
                {offering.description}
              </p>
            )}

            <div className="mt-6 rounded-2xl border border-nl-cacao/10 bg-nl-linen p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 font-display text-lg font-semibold text-nl-cacao">
                {t("bookThisService")}
              </h2>
              <AvailabilityPicker
                offeringId={offering.id}
                offeringSlug={offering.slug}
                locationMode={offering.location_mode}
                locations={locations}
                maxAdvanceDays={offering.max_advance_days}
              />
            </div>

            <TermsBlock offering={offering} />
          </div>
        </div>
      </div>
    </div>
  );
}
