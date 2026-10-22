"use client";

import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface VendorContext {
	id: string;
	slug: string;
	name: string;
	logo_url?: string | null;
	banner_url?: string | null;
	verification_type?:
		| "authorized_retailer"
		| "official_brand"
		| "verified_vendor";
}

export function VendorStorefrontHero({ vendor }: { vendor: VendorContext }) {
	const tVendor = useTranslations("vendor");

	return (
		<section className="relative">
			<div
				className="relative w-full h-48 md:h-64 overflow-hidden"
				style={{
					background:
						"linear-gradient(135deg, hsl(var(--nl-amber)), hsl(var(--nl-espresso)))",
				}}
			>
				{vendor.banner_url && (
					<Image
						src={vendor.banner_url}
						alt={vendor.name}
						fill
						priority
						className="object-cover"
						sizes="100vw"
					/>
				)}
			</div>

			<div className="mx-auto max-w-[1400px] px-2 md:px-8 relative -mt-12 md:-mt-16 pb-6">
				<div className="flex items-end gap-4 md:gap-6">
					<div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-nl-linen shadow-md shrink-0 bg-nl-linen">
						{vendor.logo_url ? (
							<Image
								src={vendor.logo_url}
								alt={vendor.name}
								fill
								className="object-cover"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center text-3xl font-display font-bold text-nl-amber-text bg-nl-pearl">
								{vendor.name[0]}
							</div>
						)}
					</div>
					<div className="pb-1 md:pb-2">
						<h1 className="font-display font-bold text-3xl md:text-5xl leading-tight tracking-tight text-nl-cacao">
							{vendor.name}
						</h1>
						{vendor.verification_type && (
							<span className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-nl-pearl text-nl-amber-text">
								<BadgeCheck className="h-3.5 w-3.5" />
								{tVendor(vendor.verification_type)}
							</span>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
