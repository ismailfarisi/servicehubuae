"use client";

import type { VendorLocation, VendorPublicProfile } from "@/lib/booking/types";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

function branchLine(location: VendorLocation): string {
	const a = (location.address ?? {}) as Record<string, unknown>;
	return [a.line1, a.area, a.city]
		.filter(
			(part): part is string =>
				typeof part === "string" && part.trim().length > 0,
		)
		.join(", ");
}

/** Who you're booking with: name, verification, rating, and the branch address. */
export function VendorCard({
	vendor,
	locations,
}: {
	vendor: VendorPublicProfile;
	locations: VendorLocation[];
}) {
	const t = useTranslations("service.detail.vendor");
	const locale = useLocale();
	const rating = Number(vendor.rating_avg) || 0;
	const branch = locations[0];
	const monogram = vendor.name
		.split(/\s+/)
		.filter((w) => /^[A-Za-z]/.test(w))
		.slice(-2)
		.map((w) => w[0])
		.join("")
		.toUpperCase();

	return (
		<section className="rounded-2xl border border-nl-cacao/10 bg-nl-linen p-5 shadow-sm">
			<h2 className="text-xs font-semibold uppercase tracking-wide text-nl-amber-text">
				{t("title")}
			</h2>
			<div className="mt-3 flex items-start gap-4">
				<div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-nl-pearl font-display text-lg font-bold text-nl-cacao">
					{vendor.logo_url ? (
						<Image
							src={vendor.logo_url}
							alt=""
							fill
							sizes="56px"
							className="object-cover"
						/>
					) : (
						monogram || vendor.name[0]
					)}
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-display text-lg font-semibold leading-snug text-nl-cacao">
						{vendor.name}
					</p>
					<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
						<span className="inline-flex items-center gap-1 font-medium text-emerald-700">
							<BadgeCheck aria-hidden="true" className="h-4 w-4" />
							{t("verified")}
						</span>
						{vendor.rating_count > 0 && (
							<span className="inline-flex items-center gap-1 text-nl-cacao">
								<Star
									aria-hidden="true"
									className="h-4 w-4 fill-amber-400 text-amber-400"
								/>
								<span className="font-semibold tabular-nums">
									{rating.toFixed(1)}
								</span>
								<span className="text-nl-russet">
									{t("ratings", { count: vendor.rating_count })}
								</span>
							</span>
						)}
					</div>
				</div>
			</div>
			{vendor.description && (
				<p className="mt-4 text-sm leading-relaxed text-nl-cacao/90">
					{vendor.description}
				</p>
			)}
			{branch && branchLine(branch) && (
				<p className="mt-3 flex items-start gap-2 text-sm text-nl-russet">
					<MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
					<span>{branchLine(branch)}</span>
				</p>
			)}
			{vendor.slug && (
				<Link
					href={`/${locale}/vendor/${vendor.slug}`}
					className="mt-4 inline-flex min-h-[40px] items-center rounded-lg border border-nl-cacao/15 px-4 text-sm font-semibold text-nl-cacao hover:bg-nl-pearl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nl-amber"
				>
					{t("viewVendor")}
				</Link>
			)}
		</section>
	);
}
