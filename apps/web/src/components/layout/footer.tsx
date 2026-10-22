import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import type { SVGProps } from "react";
import { ONLINE_PAYMENTS_ENABLED } from "@/lib/booking/online-payments";
import { VENDOR_REGISTER_URL } from "@/lib/vendor-dashboard";

// Inline brand glyphs for marks lucide-react doesn't ship: the post-rebrand
// X mark and the TikTok musical-note. Stroke-based; rendered with currentColor
// so they inherit the footer hover/focus colors like the lucide icons do.
function XIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
		</svg>
	);
}
function TikTokIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
			<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.95A8.16 8.16 0 0 0 21.58 11V7.6a4.83 4.83 0 0 1-1.99-.91z" />
		</svg>
	);
}

// `href` is locale-relative ("/faq" -> "/en/faq") unless `external` is set
// (the vendor dashboard is a separate app).
const COLUMNS: Array<{
	headingKey: "about" | "help" | "sell" | "categories";
	items: Array<{ label: string; href: string; external?: boolean }>;
}> = [
	{
		headingKey: "about",
		items: [
			{ label: "About Us", href: "/about" },
			{ label: "Careers", href: "/careers" },
			{ label: "Contact", href: "/contact" },
			{ label: "Press", href: "/press" },
		],
	},
	{
		headingKey: "help",
		items: [
			{ label: "FAQ", href: "/faq" },
			{ label: "My bookings", href: "/account/bookings" },
			{ label: "Support", href: "/account/support" },
		],
	},
	{
		headingKey: "sell",
		items: [
			{ label: "Become a Vendor", href: VENDOR_REGISTER_URL, external: true },
			{ label: "Privacy Policy", href: "/privacy" },
			{ label: "Terms of Service", href: "/terms" },
		],
	},
	{
		headingKey: "categories",
		items: [
			{ label: "All services", href: "/services" },
			{ label: "Home Maintenance", href: "/services?category=home-maintenance" },
			{ label: "Cleaning", href: "/services?category=cleaning" },
			{ label: "Beauty & Wellness", href: "/services?category=beauty-wellness" },
		],
	},
];

const SOCIALS = [
	{
		Icon: Instagram,
		href: "https://www.instagram.com/mypickuae.uaeofficial",
		label: "Instagram",
	},
	{
		Icon: TikTokIcon,
		href: "https://www.tiktok.com/@mypickuae_uae_official",
		label: "TikTok",
	},
	{
		Icon: Youtube,
		// @MyPickUAEuae is NOT ours — it resolves to an unrelated personal
		// channel. The official MyPickUAE channel is @MYPICKUAE-UAE.
		href: "https://www.youtube.com/@MYPICKUAE-UAE",
		label: "YouTube",
	},
	{
		Icon: XIcon,
		href: "https://x.com/MyPickUAEUae",
		label: "X (formerly Twitter)",
	},
	{
		Icon: Linkedin,
		href: "https://www.linkedin.com/company/mypickuae-uae/",
		label: "LinkedIn",
	},
];

// Online card payments arrive with MyFatoorah (M2) behind
// ONLINE_PAYMENTS_ENABLED; until then bookings are paid at the venue only.
const PAYMENT_METHODS = ONLINE_PAYMENTS_ENABLED
	? ["Visa", "Mastercard", "Apple Pay", "Pay at venue"]
	: ["Pay at venue"];

export async function Footer() {
	const t = await getTranslations("footer");
	const locale = await getLocale();
	const year = new Date().getFullYear();

	return (
		<footer className="bg-nl-espresso text-white/80 mt-auto">
			<div className="max-w-[1400px] mx-auto px-4 md:px-12 pt-12 md:pt-16 pb-6 md:pb-8">
				<div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-10 md:gap-12 mb-10 md:mb-12">
					<div className="col-span-2 md:col-span-1">
						<Link
							href={`/${locale}`}
							// The logo artwork has dark lettering, so it sits on a white chip
							// against the navy footer.
							className="inline-flex items-center mb-5 rounded-xl bg-white px-3 py-1.5"
							aria-label="MyPickUAE"
						>
							<Image
								src="/mypickuae-logo.png"
								alt="MyPickUAE"
								width={216}
								height={120}
								className="h-12 w-auto"
							/>
						</Link>
						<p className="text-sm md:text-base leading-relaxed text-white/70 max-w-[320px] mb-6">
							The UAE&rsquo;s services marketplace. Compare trusted
							vendors, then book or request a quote.
						</p>
						<div className="flex gap-2.5">
							{SOCIALS.map(({ Icon, href, label }) => (
								<a
									key={label}
									href={href}
									target="_blank"
									rel="noreferrer noopener"
									aria-label={label}
									className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-nl-amber hover:text-white transition-colors"
								>
									<Icon className="h-4 w-4" strokeWidth={1.75} />
								</a>
							))}
						</div>
					</div>

					{COLUMNS.map((col) => (
						<div key={col.headingKey}>
							<h3 className="text-sm font-semibold text-white mb-4">
								{t(col.headingKey)}
							</h3>
							<ul className="flex flex-col gap-2.5 text-sm leading-[1.5]">
								{col.items.map((item) => (
									<li key={item.label}>
										{item.external ? (
											<a
												href={item.href}
												className="text-sm text-white/70 hover:text-white transition-colors"
											>
												{item.label}
											</a>
										) : (
											<Link
												href={`/${locale}${item.href}`}
												className="text-sm text-white/70 hover:text-white transition-colors"
											>
												{item.label}
											</Link>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-white/60">
					<span>{t("copyright", { year })}</span>
					<div className="flex flex-wrap items-center gap-2">
						<span className="me-1">We accept</span>
						{PAYMENT_METHODS.map((p) => (
							<span
								key={p}
								className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90"
							>
								{p}
							</span>
						))}
					</div>
					<span>Serving all seven emirates</span>
				</div>
			</div>
		</footer>
	);
}
