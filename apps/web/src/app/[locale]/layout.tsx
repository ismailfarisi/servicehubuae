import { ConsentBanner } from "@/components/consent/consent-banner";
import { Footer } from "@/components/layout/footer";
import { HeaderServer } from "@/components/layout/header-server";
import { HideOnReels } from "@/components/layout/hide-on-reels";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { Providers } from "@/components/providers";
import { ChatWidget } from "@/components/support/chat-widget";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { IBM_Plex_Sans_Arabic, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing } from "../../../i18n/routing";
import { SITE_URL } from "@/lib/seo/config";
import "../globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
	subsets: ["latin"],
	variable: "--font-jakarta",
	display: "swap",
});

// Inter and Jakarta have no Arabic glyphs; this covers the ar locale.
const plexArabic = IBM_Plex_Sans_Arabic({
	subsets: ["arabic"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-arabic",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: "ServiceHubUAE — Book Trusted Services in the UAE",
		template: "%s | ServiceHubUAE",
	},
	description:
		"Compare and book cleaning, AC maintenance, beauty, pest control and more from trusted vendors across the UAE.",
	manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	// Shrink the layout viewport when the on-screen keyboard opens, so `dvh`
	// units and vertically centred fixed elements (dialogs, the mobile tab bar)
	// stay inside the strip the keyboard leaves visible instead of sitting
	// behind it. iOS ignores this and is handled by `useKeyboardViewport`.
	interactiveWidget: "resizes-content",
};

const rtlLocales = ["ar"];

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
		notFound();
	}

	setRequestLocale(locale);
	const messages = await getMessages();
	const dir = rtlLocales.includes(locale) ? "rtl" : "ltr";

	return (
		<html
			lang={locale}
			dir={dir}
			className={`${inter.variable} ${jakarta.variable} ${plexArabic.variable}`}
		>
			<body className="min-h-screen flex flex-col font-sans antialiased">
				<NextIntlClientProvider messages={messages} locale={locale}>
					<Providers>
						<HideOnReels>
							<HeaderServer />
						</HideOnReels>
						<main className="flex-1">{children}</main>
						<HideOnReels>
							<Footer />
						</HideOnReels>
						<MobileTabBar />
						<HideOnReels>
							<ChatWidget />
						</HideOnReels>
						<ConsentBanner />
					</Providers>
				</NextIntlClientProvider>
				<Script
					src="https://analytics.ahrefs.com/analytics.js"
					data-key="XS2C/iwzXeOEEWFk8Wws0w"
					strategy="afterInteractive"
				/>
			</body>
		</html>
	);
}
