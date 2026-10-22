import axios from "axios";
import { API_URL } from "./config";

export interface SitemapEntry {
	/**
	 * Locale-less path, e.g. "/service/foo" or "/services?category=cleaning".
	 * Locale is added by the XML layer.
	 */
	path: string;
	lastModified?: Date;
}

/** Backend hard maximum: t.Numeric({ minimum: 1, maximum: 50 }) on GET /services. */
const SERVICE_PAGE_SIZE = 50;
/** Safety stop for the services page loop: 100 * 50 = 5,000 services. */
const MAX_SERVICE_PAGES = 100;

/**
 * Fetch and fail loudly. A sitemap that silently swallows upstream failures
 * ends up advertising only the homepage; a visible error is strictly better.
 */
async function fetchJson(path: string): Promise<any> {
	const url = `${API_URL}${path}`;
	try {
		const { data } = await axios.get(url, { timeout: 20000 });
		return data;
	} catch (error) {
		const status = axios.isAxiosError(error)
			? error.response?.status
			: undefined;
		console.error(
			`[sitemap] upstream fetch failed: ${url} (status ${status ?? "none"})`,
		);
		throw new Error(
			`sitemap upstream failed: ${path} (status ${status ?? "unknown"})`,
		);
	}
}

interface ServiceRow {
	slug?: string | null;
	vendor_id?: string | null;
	vendor_slug?: string | null;
	created_at?: number | null;
}

/**
 * Every published service offering from catalog-service GET /services.
 * The endpoint returns only PUBLISHED offerings, so this is empty until the
 * first one is approved.
 *
 * Paginates via the 1-based `page` param. Fails loudly (throws) rather than
 * silently truncating if the page cap is hit while `total` says more remain.
 */
async function fetchServiceRows(): Promise<ServiceRow[]> {
	const rows: ServiceRow[] = [];
	let total: number | undefined;

	for (let page = 1; page <= MAX_SERVICE_PAGES; page++) {
		const body = await fetchJson(
			`/services?limit=${SERVICE_PAGE_SIZE}&page=${page}`,
		);
		const items: ServiceRow[] = Array.isArray(body?.data) ? body.data : [];
		if (typeof body?.total === "number") total = body.total;

		if (!items.length) break;
		rows.push(...items);

		// Stop once we've collected everything the API told us to expect. If
		// the API never reported a total (malformed response), don't loop
		// blindly — treat the page we have as the whole list.
		if (total === undefined || rows.length >= total) break;
	}

	if (total !== undefined && rows.length < total) {
		console.error(
			`[sitemap] service page loop hit page cap at ${MAX_SERVICE_PAGES} iterations with total=${total} fetchedCount=${rows.length}`,
		);
		throw new Error(
			`sitemap upstream failed: service catalog exceeded expected size (page cap: ${MAX_SERVICE_PAGES})`,
		);
	}

	return rows;
}

/** Service detail pages: /service/:slug. */
export async function getServices(): Promise<SitemapEntry[]> {
	const rows = await fetchServiceRows();
	return rows
		.filter((row) => row?.slug)
		.map((row) => ({
			path: `/service/${row.slug}`,
			// created_at on the search document is unix seconds.
			...(typeof row.created_at === "number" && row.created_at > 0
				? { lastModified: new Date(row.created_at * 1000) }
				: {}),
		}));
}

/**
 * Vendor storefronts, derived from published services so we never advertise
 * a vendor with nothing bookable (GET /vendors is not public anyway). The
 * vendor page resolves either a slug or a UUID, so the id is the fallback when
 * the search document carries no vendor_slug.
 */
export async function getVendors(): Promise<SitemapEntry[]> {
	const rows = await fetchServiceRows();
	const seen = new Set<string>();
	const entries: SitemapEntry[] = [];
	for (const row of rows) {
		const key = row?.vendor_slug || row?.vendor_id;
		if (!key || seen.has(key)) continue;
		seen.add(key);
		entries.push({ path: `/vendor/${key}` });
	}
	return entries;
}

/**
 * Category landings. Categories have no page of their own: each is the
 * service listing filtered by `category`, which the listing page treats as a
 * canonical (indexable) URL.
 */
export async function getCategories(): Promise<SitemapEntry[]> {
	const body = await fetchJson("/categories/tree");
	const entries: SitemapEntry[] = [];

	const walk = (nodes: any[]) => {
		for (const node of nodes ?? []) {
			if (node?.slug) {
				entries.push({
					path: `/services?category=${encodeURIComponent(node.slug)}`,
				});
			}
			if (node?.children?.length) walk(node.children);
		}
	};
	walk(Array.isArray(body?.data) ? body.data : []);

	return entries;
}
