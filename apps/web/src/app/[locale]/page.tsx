import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { apiServer } from "@/lib/api-server";
import { LayoutRenderer } from "@/components/layout/layout-renderer";
import { PreviewBanner } from "@/components/layout/preview-banner";

/** CMS page-layout slug the storefront home page resolves (cms-service `/layouts/:slug/resolve`). */
const HOME_LAYOUT_SLUG = "home";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
  };
}

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
}

async function getHomePageLayout(locale: string, previewToken?: string, previewLayoutSlug?: string) {
  if (previewToken) {
    noStore();
  }
  const server = await apiServer();
  const headersList = await headers();
  const ua = headersList.get("user-agent") || "";
  const device = /mobile|android|iphone/i.test(ua) ? "mobile" : "web";

  const params = new URLSearchParams({ locale, device });
  if (previewToken) params.set("preview_token", previewToken);

  const slug = previewToken && previewLayoutSlug ? previewLayoutSlug : HOME_LAYOUT_SLUG;

  try {
    const res = await server.get(`/layouts/${encodeURIComponent(slug)}/resolve?${params.toString()}`);
    return { layout: res.data.data, previewStatus: previewToken ? "active" : null };
  } catch (err: any) {
    if (previewToken && err?.response?.status === 401) {
      try {
        const fallback = await server.get(
          `/layouts/${encodeURIComponent(previewLayoutSlug ?? HOME_LAYOUT_SLUG)}/resolve?locale=${locale}&device=${device}`,
        );
        return { layout: fallback.data.data, previewStatus: "expired" as const };
      } catch {
        return { layout: { sections: [] }, previewStatus: "expired" as const };
      }
    }
    return { layout: { sections: [] }, previewStatus: null };
  }
}

/** Top-level categories for the default home (no CMS layout published yet). */
async function getTopCategories(locale: string): Promise<CategoryNode[]> {
  try {
    const server = await apiServer(locale);
    const res = await server.get("/categories/tree", { params: { depth: 1 } });
    const nodes = (res.data?.data ?? []) as CategoryNode[];
    return Array.isArray(nodes) ? nodes : [];
  } catch (err) {
    console.error("[home] GET /categories/tree failed:", err);
    return [];
  }
}

/**
 * Rendered when cms-service has no published home layout (or is unreachable):
 * a plain hero pointing at the service catalogue, plus the category grid.
 */
async function DefaultHome({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "home" });
  const categories = await getTopCategories(locale);

  return (
    <>
      <section className="bg-gradient-to-b from-nl-pearl to-nl-linen">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-16 md:py-24">
          <p className="inline-flex items-center rounded-full bg-nl-linen border border-nl-amber/20 px-3 py-1 text-sm font-semibold text-nl-amber-text shadow-sm">
            {t("heroEyebrow")}
          </p>
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-tight tracking-tight text-nl-cacao mt-5 max-w-[16ch]">
            {t("heroTitle")}
          </h1>
          <p className="text-base md:text-lg leading-relaxed text-nl-russet max-w-[52ch] mt-4">
            {t("heroSubtitle")}
          </p>
          <Link
            href={`/${locale}/services`}
            className="mt-8 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-nl-amber px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors"
          >
            {t("browseServices")}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
      {categories.length > 0 && (
        <LayoutRenderer
          sections={[
            {
              id: "default-category-grid",
              type: "category_grid",
              position: 0,
              settings: { title: { [locale]: t("browseCategories"), en: t("browseCategories") } },
              source_mode: "query",
              data: { items: categories },
            },
          ]}
        />
      )}
    </>
  );
}

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ preview_token?: string; preview_layout_slug?: string }>;
}) {
  const { locale } = await params;
  const { preview_token, preview_layout_slug } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  const { layout, previewStatus } = await getHomePageLayout(
    locale,
    preview_token,
    preview_layout_slug,
  );
  const sections = (layout?.sections ?? []) as any[];

  const previewInjected = sections.some((s: any) =>
    (s.data?.items ?? []).some((it: any) => it?.preview === true),
  );

  const bannerStatus =
    previewStatus === "expired"
      ? "expired"
      : preview_token && !previewInjected && previewStatus === "active"
        ? "wrong_page"
        : preview_token && previewInjected
          ? "active"
          : null;

  return (
    <>
      {bannerStatus && (
        <PreviewBanner
          status={bannerStatus}
          bidIdShort={preview_token ? preview_token.slice(0, 8) : undefined}
        />
      )}
      <main className="pb-8 md:pb-12 space-y-10 md:space-y-20">
        {sections.length > 0 ? (
          <LayoutRenderer sections={sections} />
        ) : (
          <DefaultHome locale={locale} />
        )}
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ServiceHubUAE",
            url: "https://www.servicehubuae.com",
            description: t("description"),
          }),
        }}
      />
    </>
  );
}
