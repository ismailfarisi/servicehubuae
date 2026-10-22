/**
 * Canonical storefront URLs for the services marketplace. Dependency-free so
 * both server and client components can import it.
 */

/** Results page for a free-text query: the service listing filtered by `q`. */
export function searchResultsHref(locale: string, q: string): string {
	return `/${locale}/services?q=${encodeURIComponent(q)}`;
}

/** Service listing filtered to one category (replaces the old /c/:slug pages). */
export function categoryHref(locale: string, slug: string): string {
	return `/${locale}/services?category=${encodeURIComponent(slug)}`;
}

/** Service detail page. */
export function serviceHref(locale: string, slug: string): string {
	return `/${locale}/service/${slug}`;
}
