import { routing } from "../../../i18n/routing";

export const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL || "https://www.servicehubuae.com";

export const API_URL =
	process.env.API_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	"http://localhost:3000";

// Sourced from the routing config on purpose. A hardcoded list here previously
// drifted to ["en","ar","hi","ur","ml"] and published 404 URLs to Google.
export const LOCALES = routing.locales;
export const DEFAULT_LOCALE = routing.defaultLocale;

/**
 * Child sitemaps. Shared by sitemap.xml/route.ts (the index) and
 * sitemaps/[file]/route.ts (the files themselves) so the two cannot drift.
 */
export const SITEMAP_FILES = [
	"static.xml",
	"categories.xml",
	"services.xml",
	"vendors.xml",
] as const;
export type SitemapFile = (typeof SITEMAP_FILES)[number];

// Indexable, crawlable marketing/informational pages. Deliberately excludes
// account, booking checkout, auth and reels/upload.
export const STATIC_PATHS = [
	"/",
	"/about",
	"/contact",
	"/careers",
	"/faq",
	"/press",
	"/privacy",
	"/reels",
	"/services",
	"/terms",
];
