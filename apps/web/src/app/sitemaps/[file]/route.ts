import {
	type SitemapEntry,
	getCategories,
	getServices,
	getVendors,
} from "@/lib/seo/catalog-source";
import {
	SITEMAP_FILES,
	STATIC_PATHS,
	type SitemapFile,
} from "@/lib/seo/config";
import { buildUrlset } from "@/lib/seo/xml";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

const SOURCES: Record<
	SitemapFile,
	{ load: () => Promise<SitemapEntry[]>; priority: number; changefreq: string }
> = {
	"static.xml": {
		load: async () => STATIC_PATHS.map((path) => ({ path })),
		priority: 0.8,
		changefreq: "weekly",
	},
	"categories.xml": { load: getCategories, priority: 0.8, changefreq: "daily" },
	"services.xml": { load: getServices, priority: 0.7, changefreq: "daily" },
	"vendors.xml": { load: getVendors, priority: 0.6, changefreq: "weekly" },
};

function isSitemapFile(file: string): file is SitemapFile {
	return (SITEMAP_FILES as readonly string[]).includes(file);
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ file: string }> },
) {
	const { file } = await params;
	if (!isSitemapFile(file)) {
		return new Response("Not found", { status: 404 });
	}

	const source = SOURCES[file];
	let entries: SitemapEntry[];
	try {
		entries = await source.load();
	} catch {
		// catalog-source already logged the upstream failure. A 503 tells
		// crawlers to retry later instead of caching an empty sitemap.
		return new Response("Sitemap temporarily unavailable", {
			status: 503,
			headers: { "Retry-After": "600" },
		});
	}

	return new Response(buildUrlset(entries, source.priority, source.changefreq), {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=0, s-maxage=3600",
		},
	});
}
