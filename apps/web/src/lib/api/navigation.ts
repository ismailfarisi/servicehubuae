const API_URL =
	process.env.API_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	"http://localhost:3000";

export interface NavSubcategory {
	label: string;
	href: string;
	highlight?: boolean;
}

export interface NavBrand {
	id: string;
	name: string;
	href: string;
}

export interface NavPromoTile {
	image_url: string;
	title: string;
	cta_text: string;
	href: string;
}

export interface NavTab {
	id: string;
	kind: "category" | "custom";
	label: string;
	href: string;
	subcategories: NavSubcategory[];
	brand_list: { title: string; see_all_href: string; brands: NavBrand[] };
	promo_tiles: NavPromoTile[];
}

export interface NavData {
	tabs: NavTab[];
	version: number;
	generated_at: string;
}

/**
 * Rewrites product-era storefront links the navigation payload may still carry
 * onto the services marketplace: `/c/:slug` (category pages) becomes the
 * service listing filtered by that category; `/search?q=` becomes
 * `/services?q=`. Anything else is left alone. Paths may be locale-less or
 * locale-prefixed (`/en/c/foo`).
 */
export function normalizeNavHref(href: string): string {
	const match = /^(\/[a-z]{2})?\/c\/([^/?#]+)\/?$/.exec(href);
	if (match) {
		// The captured segment is already URL-encoded (it came from a path).
		return `${match[1] ?? ""}/services?category=${match[2]}`;
	}
	const search = /^(\/[a-z]{2})?\/search(\?.*)?$/.exec(href);
	if (search) return `${search[1] ?? ""}/services${search[2] ?? ""}`;
	return href;
}

const isBrandHref = (href: string) => /^(\/[a-z]{2})?\/brands?(\/|$)/.test(href);

/**
 * Brands no longer exist on the marketplace, so brand lists are dropped and
 * every link is passed through {@link normalizeNavHref}.
 */
export function normalizeNavData(data: NavData): NavData {
	return {
		...data,
		tabs: (data.tabs ?? []).map((tab) => ({
			...tab,
			href: normalizeNavHref(tab.href),
			subcategories: (tab.subcategories ?? []).map((sub) => ({
				...sub,
				href: normalizeNavHref(sub.href),
			})),
			brand_list: {
				title: tab.brand_list?.title ?? "",
				see_all_href: isBrandHref(tab.brand_list?.see_all_href ?? "")
					? "/services"
					: normalizeNavHref(tab.brand_list?.see_all_href ?? "/services"),
				brands: [],
			},
			promo_tiles: (tab.promo_tiles ?? [])
				.filter((tile) => !isBrandHref(tile.href))
				.map((tile) => ({ ...tile, href: normalizeNavHref(tile.href) })),
		})),
	};
}

// 60s SSR cache (down from 15 min) — short enough that CMS edits propagate in
// roughly a minute even without a webhook, while still off-loading 99% of
// requests to the cache. When the revalidate webhook is wired up we can raise
// this again.
export async function fetchHeaderNavigation(locale: string): Promise<NavData> {
	try {
		const res = await fetch(
			`${API_URL}/navigation/header?locale=${encodeURIComponent(locale)}`,
			{
				next: { revalidate: 60, tags: ["header-navigation"] },
			},
		);
		if (!res.ok)
			return { tabs: [], version: 0, generated_at: new Date().toISOString() };
		const json = (await res.json()) as { data: NavData };
		return json.data
			? normalizeNavData(json.data)
			: { tabs: [], version: 0, generated_at: new Date().toISOString() };
	} catch {
		return { tabs: [], version: 0, generated_at: new Date().toISOString() };
	}
}
