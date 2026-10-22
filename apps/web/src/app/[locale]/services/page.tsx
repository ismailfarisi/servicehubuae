import { apiServer } from "@/lib/api-server";
import type { ServiceSearchResponse } from "@/lib/booking/types";
import { buildServiceListingParams } from "@/components/services/service-listing-params";
import { computeActiveServiceFilters } from "@/components/services/service-filter-state";
import { ServiceFilterSidebar } from "@/components/services/service-filter-sidebar";
import { ServiceGrid } from "@/components/services/service-grid";
import { buildAlternates } from "@/lib/seo/alternates";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface CategoryNode {
  slug: string;
  name: string;
  children?: CategoryNode[];
}

// Matches the category listing's posture. Availability is not rendered here,
// but facet counts move whenever a vendor edits coverage, so a cached shell
// would go stale in a way that is confusing rather than merely old.
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { category } = await searchParams;
  const t = await getTranslations({ locale, namespace: "service.listing" });
  // Canonical is the clean path so filter permutations aren't indexed as
  // duplicates — except the category filter, which is the category landing
  // page (categories have no route of their own; sitemaps/categories.xml
  // advertises these URLs).
  const canonicalPath =
    typeof category === "string" && category
      ? `/services?category=${encodeURIComponent(category)}`
      : "/services";
  return {
    title: t("title"),
    description: t("intro"),
    alternates: buildAlternates(locale, canonicalPath),
  };
}

export default async function ServicesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const filters = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "service.listing" });
  const server = await apiServer(locale);

  // Facets come back keyed by SLUG. Areas and the category tree supply the
  // display names, so the area filter reads "Dubai Marina" rather than
  // "dubai-marina". Both endpoints are public and unauthenticated; the
  // booking checkout uses /areas for exactly this slug -> name job.
  // Each degrades to an empty list (facets fall back to raw slugs) rather
  // than 500ing the whole page, but logs so a real backend outage is
  // distinguishable from "nothing configured".
  const [areas, categoryTree] = await Promise.all([
    server
      .get("/areas")
      .then((r) => (r.data.data ?? []) as Array<{ slug: string; name: string }>)
      .catch((err) => {
        console.error("[services page] GET /areas failed:", err);
        return [] as Array<{ slug: string; name: string }>;
      }),
    server
      .get("/categories/tree")
      .then((r) => (r.data.data ?? []) as CategoryNode[])
      .catch((err) => {
        console.error("[services page] GET /categories/tree failed:", err);
        return [] as CategoryNode[];
      }),
  ]);
  const areaNameBySlug = new Map(areas.map((a) => [a.slug, a.name]));
  const categoryNameBySlug = new Map<string, string>();
  const walk = (nodes: CategoryNode[]) => {
    for (const n of nodes) {
      categoryNameBySlug.set(n.slug, n.name);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(categoryTree);

  const res: ServiceSearchResponse = await server
    .get("/services", { params: buildServiceListingParams(filters, 24, locale) })
    .then((r) => ({
      data: r.data.data ?? [],
      total: r.data.total ?? 0,
      page: r.data.page ?? 1,
      limit: r.data.limit ?? 24,
      facets: r.data.facets ?? {
        areas: [],
        categories: [],
        visitTypes: [],
        paymentModes: [],
        vendors: [],
      },
    }))
    // An empty listing is a legitimate state (there are no published services
    // yet), so a failure degrades to the empty view rather than a 500 — but
    // log it, so a real GET /services outage (or a validation 422 from an
    // out-of-range filter) is distinguishable from a genuinely empty catalog
    // instead of silently rendering "No services yet".
    .catch((err) => {
      console.error("[services page] GET /services failed:", err);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 24,
        facets: {
          areas: [],
          categories: [],
          visitTypes: [],
          paymentModes: [],
          vendors: [],
        },
      };
    });

  const facetConfig = {
    // Fall back to the slug if an area was deleted after indexing — a readable
    // slug beats an empty label.
    areas: res.facets.areas.map((f) => ({
      value: f.value,
      label: areaNameBySlug.get(f.value) ?? f.value,
      count: f.count,
    })),
    categories: res.facets.categories.map((f) => ({
      value: f.value,
      label: categoryNameBySlug.get(f.value) ?? f.value,
      count: f.count,
    })),
    priceRange: { min: 0, max: 100000 },
  };

  const { count: activeCount } = computeActiveServiceFilters(
    facetConfig,
    new URLSearchParams(filters as Record<string, string>),
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 md:py-10">
      <h1 className="mb-1 font-display text-3xl font-bold leading-tight tracking-tight text-nl-cacao md:text-4xl">{t("title")}</h1>
      <p className="mb-6 text-base text-nl-russet md:mb-8">{t("intro")}</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr] md:items-start lg:gap-8">
        <ServiceFilterSidebar config={facetConfig} />

        <div>
          <p className="mb-4 text-sm font-medium text-nl-russet">
            {t("results", { count: res.total })}
            {activeCount > 0 ? ` · ${activeCount}` : ""}
          </p>

          {res.data.length === 0 ? (
            <div className="rounded-2xl border border-nl-cacao/10 bg-nl-pearl px-6 py-16 text-center">
              <p className="mb-2 font-display text-xl font-semibold text-nl-cacao">{t("emptyTitle")}</p>
              <p className="text-sm text-nl-russet">{t("emptyHint")}</p>
            </div>
          ) : (
            <ServiceGrid services={res.data} />
          )}
        </div>
      </div>
    </div>
  );
}
