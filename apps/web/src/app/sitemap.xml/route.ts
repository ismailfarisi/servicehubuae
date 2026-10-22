import { SITEMAP_FILES } from "@/lib/seo/config";
import { buildSitemapIndex } from "@/lib/seo/xml";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

/**
 * Sitemap index. Every file listed here is served by
 * app/sitemaps/[file]/route.ts — both read SITEMAP_FILES, so the index can
 * never advertise a child sitemap that 404s.
 */
export async function GET() {
	return new Response(buildSitemapIndex([...SITEMAP_FILES]), {
		headers: {
			"Content-Type": "application/xml",
			"Cache-Control": "public, max-age=0, s-maxage=3600",
		},
	});
}
