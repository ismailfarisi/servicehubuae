"use client";

import { AvailabilityPicker } from "@/components/booking/availability-picker";
import { TermsBlock } from "@/components/booking/terms-block";
import { ServiceGallery } from "@/components/service-detail/gallery";
import { MobileBookBar } from "@/components/service-detail/mobile-book-bar";
import { QuickFacts } from "@/components/service-detail/quick-facts";
import { ReviewsSection } from "@/components/service-detail/reviews-section";
import { SimilarServices } from "@/components/service-detail/similar-services";
import { VendorCard } from "@/components/service-detail/vendor-card";
import { Eyebrow, SerifTitle } from "@/components/ui/maison-primitives";
import type {
	ServiceListItem,
	ServiceOffering,
	ServiceReviewPage,
	VendorLocation,
	VendorPublicProfile,
} from "@/lib/booking/types";
import { categoryHref } from "@/lib/links";
import { formatPrice } from "@/lib/utils";
import { ChevronRight, Clock, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

interface Props {
	offering: ServiceOffering;
	locations: VendorLocation[];
	vendor: VendorPublicProfile | null;
	category: { name: string; slug: string } | null;
	reviews: ServiceReviewPage | null;
	indexed: ServiceListItem | null;
	similar: ServiceListItem[];
}

export function ServiceDetailClient({
	offering,
	locations,
	vendor,
	category,
	reviews,
	indexed,
	similar,
}: Props) {
	const t = useTranslations("service");
	const td = useTranslations("service.detail");
	const locale = useLocale();
	const vatRate = Number.parseFloat(offering.vat_rate) || 0;
	const price = formatPrice(offering.price_fils, "AED", locale);
	const duration = t("duration", { minutes: offering.duration_minutes });
	const ratingCount = reviews?.rating_count ?? indexed?.rating_count ?? 0;
	const ratingAvg = reviews?.rating_avg ?? indexed?.rating_avg ?? 0;

	return (
		<div className="bg-background min-h-screen pb-24 lg:pb-0">
			<div className="container py-6 md:py-10">
				<nav
					aria-label={td("breadcrumbLabel")}
					className="mb-5 text-sm text-nl-russet"
				>
					<ol className="flex flex-wrap items-center gap-1.5">
						<li>
							<Link
								href={`/${locale}`}
								className="hover:text-nl-cacao hover:underline"
							>
								{td("breadcrumbHome")}
							</Link>
						</li>
						{category && (
							<>
								<ChevronRight
									aria-hidden="true"
									className="h-3.5 w-3.5 rtl:rotate-180"
								/>
								<li>
									<Link
										href={categoryHref(locale, category.slug)}
										className="hover:text-nl-cacao hover:underline"
									>
										{category.name}
									</Link>
								</li>
							</>
						)}
						<ChevronRight
							aria-hidden="true"
							className="h-3.5 w-3.5 rtl:rotate-180"
						/>
						<li
							aria-current="page"
							className="truncate font-medium text-nl-cacao"
						>
							{offering.name}
						</li>
					</ol>
				</nav>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
					<div className="min-w-0 space-y-8">
						<ServiceGallery
							images={offering.media_urls ?? []}
							alt={offering.name}
							thumbLabel={(n) => td("photoN", { n })}
						/>

						<div>
							{category && (
								<Eyebrow className="text-sm">{category.name}</Eyebrow>
							)}
							<SerifTitle size={32} className="mt-2">
								{offering.name}
							</SerifTitle>
							<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
								{ratingCount > 0 && (
									<a
										href="#reviews"
										className="inline-flex items-center gap-1.5 text-nl-cacao hover:underline"
									>
										<Star
											aria-hidden="true"
											className="h-4 w-4 fill-amber-400 text-amber-400"
										/>
										<span className="font-semibold tabular-nums">
											{ratingAvg.toFixed(1)}
										</span>
										<span className="text-nl-russet">
											{td("reviewCount", { count: ratingCount })}
										</span>
									</a>
								)}
								{vendor && (
									<span className="text-nl-russet">
										{td("byVendor", { vendor: vendor.name })}
									</span>
								)}
								<span className="inline-flex items-center gap-1 rounded-full bg-nl-pearl px-3 py-1 text-xs font-medium text-nl-amber-text">
									<Clock aria-hidden="true" className="h-3.5 w-3.5" />
									{duration}
								</span>
							</div>
						</div>

						<QuickFacts offering={offering} indexed={indexed} />

						{offering.description && (
							<section>
								<h2 className="font-display text-xl font-semibold text-nl-cacao">
									{td("aboutService")}
								</h2>
								<p className="mt-2 text-[15px] leading-relaxed text-nl-cacao/90">
									{offering.description}
								</p>
							</section>
						)}

						{vendor && <VendorCard vendor={vendor} locations={locations} />}

						<TermsBlock offering={offering} />
					</div>

					<aside
						id="book"
						className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start"
					>
						<div className="rounded-2xl border border-nl-cacao/10 bg-nl-linen p-4 shadow-md sm:p-5">
							<div className="flex items-baseline justify-between gap-3">
								<span className="text-2xl font-bold text-nl-cacao">
									{price}
								</span>
								<span className="text-sm text-nl-russet">{duration}</span>
							</div>
							{vatRate > 0 && (
								<p className="mt-1 text-xs text-nl-russet">
									{t("vatIncluded", { rate: vatRate })}
								</p>
							)}
							<h2 className="mb-4 mt-5 font-display text-lg font-semibold text-nl-cacao">
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
					</aside>
				</div>

				<div className="mt-14 space-y-14 md:mt-20 md:space-y-20">
					<ReviewsSection reviews={reviews} />
					<SimilarServices
						services={similar}
						categorySlug={category?.slug ?? null}
					/>
				</div>
			</div>

			<MobileBookBar price={price} duration={duration} />
		</div>
	);
}
