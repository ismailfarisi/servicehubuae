/**
 * Canonical storefront URLs for the services marketplace. Dependency-free so
 * both server and client components can import it.
 */

/**
 * Results page for a free-text query: the service listing filtered by `q`,
 * and by `area` (an area slug) when one is picked. Either may be empty.
 */
export function searchResultsHref(locale: string, q: string, area = ""): string {
	const params = [
		q && `q=${encodeURIComponent(q)}`,
		area && `area=${encodeURIComponent(area)}`,
	].filter(Boolean);
	return `/${locale}/services${params.length ? `?${params.join("&")}` : ""}`;
}

/** Service listing filtered to one category (replaces the old /c/:slug pages). */
export function categoryHref(locale: string, slug: string): string {
	return `/${locale}/services?category=${encodeURIComponent(slug)}`;
}

/** Service detail page. */
export function serviceHref(locale: string, slug: string): string {
	return `/${locale}/service/${slug}`;
}
