import { DEFAULT_LOCALE, LOCALES, SITE_URL } from "./config";

/**
 * Absolute, locale-prefixed URL for a locale-less path such as "/service/foo".
 *
 * Each path segment is percent-encoded individually (the "/" separators are
 * preserved) so slugs containing spaces or non-ASCII characters still produce
 * a valid <loc> per sitemaps.org — plain ASCII segments round-trip unchanged.
 * A query string (e.g. "/services?category=cleaning") is passed through as-is;
 * callers encode its values.
 */
export function absoluteUrl(locale: string, path: string): string {
	const queryIndex = path.indexOf("?");
	const pathname = queryIndex === -1 ? path : path.slice(0, queryIndex);
	const query = queryIndex === -1 ? "" : path.slice(queryIndex);
	const encodedPath = pathname
		.split("/")
		.map((segment) => (segment === "" ? segment : encodeURIComponent(segment)))
		.join("/");
	const suffix = encodedPath === "/" ? "" : encodedPath;
	return `${SITE_URL}/${locale}${suffix}${query}`;
}

/**
 * Reciprocal hreflang alternates for a locale-less path. Used by both the
 * sitemap and page-level generateMetadata so the two can never disagree.
 */
export function buildAlternates(
	locale: string,
	path: string,
): {
	canonical: string;
	languages: Record<string, string>;
} {
	const languages: Record<string, string> = {};
	for (const l of LOCALES) {
		languages[l] = absoluteUrl(l, path);
	}
	languages["x-default"] = absoluteUrl(DEFAULT_LOCALE, path);

	return { canonical: absoluteUrl(locale, path), languages };
}
