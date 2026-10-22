"use client";

import { ScrollRail } from "@/components/layout/scroll-rail";
import { ServiceCard } from "@/components/services/service-card";
import type { ServiceListItem } from "@/lib/booking/types";
import { categoryHref } from "@/lib/links";
import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

/** Other vendors' services in the same category, so the customer can compare before booking. */
export function SimilarServices({
	services,
	categorySlug,
}: {
	services: ServiceListItem[];
	categorySlug: string | null;
}) {
	const t = useTranslations("service.detail.similar");
	const locale = useLocale();
	if (!services.length) return null;

	return (
		<section>
			<div className="mb-6 flex items-end justify-between gap-6">
				<div className="min-w-0">
					<h2 className="font-display text-2xl font-bold tracking-tight text-nl-cacao md:text-3xl">
						{t("title")}
					</h2>
					<p className="mt-2 text-base text-nl-russet">{t("subtitle")}</p>
				</div>
				{categorySlug && (
					<Link
						href={categoryHref(locale, categorySlug)}
						className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-nl-amber-text hover:underline md:inline-flex"
					>
						{t("viewAll")}
						<ArrowRight aria-hidden="true" className="h-4 w-4 rtl:rotate-180" />
					</Link>
				)}
			</div>
			<ScrollRail className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 md:gap-4">
				{services.map((service) => (
					<div
						key={service.id}
						className="w-[220px] flex-none snap-start md:w-[280px]"
					>
						<ServiceCard service={service} />
					</div>
				))}
			</ScrollRail>
		</section>
	);
}
