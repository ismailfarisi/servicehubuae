/* CMS section adapters for the storefront homepage and landing layouts.
 * Visual system: modern blue & white product UI shared with home-sections.tsx —
 * Plus Jakarta Sans display headings (`font-display`, normal case), Inter body,
 * nl-* tokens (navy text, brand-blue `nl-amber` actions, light-blue `nl-pearl`
 * bands), rounded-2xl cards with soft shadows, rounded-full chips, lucide icons
 * at 1.75 stroke. Never dark text on a blue fill.
 * The root overflow-x clip and the reduced-motion tiers live in app/globals.css;
 * the hero carousel pause control lives in components/home/hero-banner.tsx.
 */
import type { ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ArrowRight,
  ArrowUpRight,
  Bug,
  HardHat,
  LayoutGrid,
  Laptop,
  Scissors,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { HeroBanner } from "@/components/home/hero-banner";
import { TrendingReelsSection } from "@/components/reels/trending-reels-section";
import { ScrollRail } from "@/components/layout/scroll-rail";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { ServiceCard } from "@/components/services/service-card";
import type { ServiceListItem } from "@/lib/booking/types";
import { categoryHref } from "@/lib/links";
import { BackgroundVideo } from "./background-video";
import {
  AreaLinksAdapter,
  FeatureGridAdapter,
  ServiceSearchHeroAdapter,
  localizeHref,
  pick,
} from "./home-sections";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface SectionData {
  id: string;
  type: string;
  position: number;
  settings: Record<string, unknown>;
  source_mode: string;
  data: { blocks?: unknown[]; items?: unknown[] };
}

interface SectionProps {
  settings: Record<string, unknown>;
  data: { blocks?: unknown[]; items?: unknown[] };
}

/* ─── Section Header Component ───────────────────────────────────────────── */

/**
 * Shared section head for the adapters that don't hand-roll their own.
 * Matches the head used by VendorShowcase / CategoryGrid: display-sans title
 * left, blue text link right, single column on mobile.
 */
function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View all",
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6 mb-6 md:mb-8 px-2 md:px-0">
      <div className="min-w-0">
        <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight tracking-tight text-nl-cacao [overflow-wrap:anywhere]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base leading-relaxed text-nl-russet max-w-[52ch] mt-2">
            {subtitle}
          </p>
        )}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="hidden md:inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-nl-amber-text hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nl-amber"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      )}
    </div>
  );
}

/* ─── Registry ───────────────────────────────────────────────────────────── */

// Section types the storefront renders. Product-era types (brand_spotlight,
// brands, flash deals, collections, beauty_tips, trending_looks) are gone;
// a layout still carrying them simply skips those sections.
// `product_carousel` is a pre-fork alias: cms-service now resolves it to
// service offerings, exactly like `service_carousel`.
const SECTION_REGISTRY: Record<string, ComponentType<SectionProps>> = {
  service_search_hero: ServiceSearchHeroAdapter,
  feature_grid: FeatureGridAdapter,
  area_links: AreaLinksAdapter,
  hero_carousel: HeroBannerAdapter,
  service_carousel: ServiceCarouselAdapter,
  product_carousel: ServiceCarouselAdapter,
  vendor_showcase: VendorShowcaseAdapter,
  category_grid: CategoryGridAdapter,
  promotional_banner: PromotionalBannerAdapter,
  newsletter_signup: NewsletterSignupAdapter,
  testimonials: TestimonialsAdapter,
  trending_reels: TrendingReelsAdapter,
};

/* ─── Layout Renderer ────────────────────────────────────────────────────── */

export function LayoutRenderer({ sections }: { sections: SectionData[] }) {
  return (
    <div className="space-y-10 md:space-y-20">
      {sections.map((section, index) => {
        const Component = SECTION_REGISTRY[section.type];
        if (!Component) return null;
        return (
          <div
            key={section.id}
            className="animate-fade-in-up md:max-w-[1400px] md:mx-auto md:px-8"
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
          >
            <Component settings={section.settings} data={section.data} />
          </div>
        );
      })}
    </div>
  );
}

/* ─── Hero Carousel Adapter ──────────────────────────────────────────────── */

/**
 * Exported for the block-JSONB wiring test: `data.video.url` reaching a real
 * rendered <video> is otherwise unverified at every level.
 */
export async function HeroBannerAdapter({ settings, data }: SectionProps) {
  const locale = await getLocale();
  const banners = (data.blocks || []).map((b: any, i: number) => ({
    id: b.id || `slide-${i}`,
    title: b.data?.title?.[locale] || b.data?.title?.en || "",
    subtitle: b.data?.cta_text?.[locale] || b.data?.cta_text?.en || undefined,
    image_url: b.data?.image?.desktop?.url || "",
    mobile_image_url: b.data?.image?.mobile?.url,
    cta_url: b.data?.cta_link,
    focal_point: b.data?.image?.focal_point,
    video_url: b.data?.video?.url,
  }));
  return (
    <HeroBanner
      banners={banners}
      autoplay={(settings.autoplay as boolean) ?? true}
      interval={(settings.interval_ms as number) ?? 6000}
    />
  );
}

/* ─── Service Carousel Adapter ───────────────────────────────────────────── */

/**
 * Items are either catalog `GET /services` rows (query mode) or raw
 * ServiceOffering entities from `GET /services/by-id/:id` (sponsored bid
 * slots). Normalise both to the listing shape ServiceCard renders; the entity
 * lacks the denormalised vendor/category/area fields, which default to empty.
 */
function toServiceListItem(raw: any): ServiceListItem | null {
  if (!raw?.id || !raw?.slug || !raw?.name) return null;
  const hasAreas = Array.isArray(raw.area_ids);
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? undefined,
    slug: raw.slug,
    vendor_id: raw.vendor_id ?? "",
    vendor_name: raw.vendor_name ?? "",
    vendor_slug: raw.vendor_slug,
    category_id: raw.category_id ?? undefined,
    category_name: raw.category_name ?? "",
    category_slug: raw.category_slug,
    price_fils: Number(raw.price_fils) || 0,
    duration_minutes: Number(raw.duration_minutes) || 0,
    location_mode: raw.location_mode ?? "at_premises",
    payment_mode: raw.payment_mode ?? "pay_at_venue",
    area_ids: hasAreas ? raw.area_ids : [],
    area_slugs: Array.isArray(raw.area_slugs) ? raw.area_slugs : [],
    area_names: Array.isArray(raw.area_names) ? raw.area_names : [],
    // Only meaningful alongside area_ids/area_names (index-aligned lookup).
    premises_area_ids: hasAreas ? raw.premises_area_ids : undefined,
    home_visit_area_ids: hasAreas ? raw.home_visit_area_ids : undefined,
    rating_avg: raw.rating_avg ?? undefined,
    rating_count: raw.rating_count ?? undefined,
    media_urls: Array.isArray(raw.media_urls) ? raw.media_urls : [],
    status: raw.status ?? "published",
    created_at: typeof raw.created_at === "number" ? raw.created_at : 0,
  };
}

async function ServiceCarouselAdapter({ settings, data }: SectionProps) {
  const services = (data.items || [])
    .map(toServiceListItem)
    .filter((s): s is ServiceListItem => s !== null);
  if (!services.length) return null;
  const locale = await getLocale();
  const title =
    (settings.title as any)?.[locale] || (settings.title as any)?.en || "Popular services";
  const subtitle =
    (settings.subtitle as any)?.[locale] || (settings.subtitle as any)?.en || undefined;
  const explicitHref = settings.view_all_href;
  const viewAllHref =
    typeof explicitHref === "string" && explicitHref.trim()
      ? explicitHref
      : `/${locale}/services`;

  return (
    <section className="px-2 md:px-0" data-section="service-carousel">
      <SectionHeader title={title} subtitle={subtitle} viewAllHref={viewAllHref} />
      <ScrollRail className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-2 md:px-0 scroll-ps-2 md:scroll-ps-0">
        {services.map((service) => (
          <div key={service.id} className="flex-none snap-start w-[220px] md:w-[280px]">
            <ServiceCard service={service} />
          </div>
        ))}
      </ScrollRail>
    </section>
  );
}

/* ─── Vendor Showcase Adapter ────────────────────────────────────────────── */

interface VendorShowcaseItem {
  id: string;
  slug?: string;
  name: string;
  logo_url?: string | null;
  city?: string | null;
  tagline?: string | null;
  monogram?: string | null;
  rating_avg?: number | null;
  follower_count?: number | null;
  sponsored?: boolean;
}

const VENDOR_CREST_GRADIENTS = [
  "linear-gradient(135deg, hsl(var(--nl-amber)), hsl(var(--nl-espresso)))",
  "linear-gradient(135deg, hsl(var(--nl-amber)), hsl(var(--nl-amber-text)))",
  "linear-gradient(135deg, hsl(var(--nl-amber-text)), hsl(var(--nl-cacao)))",
  "linear-gradient(135deg, hsl(var(--nl-cacao)), hsl(var(--nl-espresso)))",
];

function vendorMonogram(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

function vendorCrestGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return VENDOR_CREST_GRADIENTS[Math.abs(hash) % VENDOR_CREST_GRADIENTS.length];
}

function formatCompact(n: number | null | undefined): string | null {
  if (n == null) return null;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

async function VendorShowcaseAdapter({ settings, data }: SectionProps) {
  const vendors = (data.items || []) as VendorShowcaseItem[];
  if (!vendors.length) return null;
  const locale = await getLocale();
  const title =
    (settings.title as any)?.[locale] ||
    (settings.title as any)?.en ||
    "Featured vendors";
  const eyebrow =
    (settings.eyebrow as any)?.[locale] ||
    (settings.eyebrow as any)?.en ||
    "Verified service providers";

  return (
    <section className="px-2 md:px-0" data-section="vendor-showcase">
      <div className="flex items-end justify-between mb-6 md:mb-8 px-2 md:px-0">
        <div>
          <p className="text-sm font-semibold text-nl-amber-text">
            {eyebrow}
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight tracking-tight mt-2 text-nl-cacao">
            {title}
          </h2>
        </div>
        <Link
          href={`/${locale}/services`}
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-nl-amber-text hover:underline"
        >
          All services
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {vendors.map((vendor) => {
          const name = vendor.name || "Vendor";
          const monogram = vendor.monogram || vendorMonogram(name);
          const accent = vendorCrestGradient(name);
          const ratingText =
            vendor.rating_avg != null ? Number(vendor.rating_avg).toFixed(1) : null;
          const followersText = formatCompact(vendor.follower_count);

          return (
            <Link
              key={vendor.id}
              href={`/${locale}/vendor/${vendor.slug || vendor.id}`}
              className="group relative block rounded-2xl bg-nl-linen border border-nl-cacao/10 p-6 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-nl-amber/30"
            >
              {vendor.sponsored && (
                <span
                  aria-hidden="true"
                  className="absolute top-4 end-4 rounded-full bg-nl-pearl px-2.5 py-0.5 text-xs font-medium text-nl-amber-text"
                >
                  Sponsored
                </span>
              )}

              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden text-white font-display font-bold text-xl mb-4"
                style={{ background: accent }}
                aria-hidden="true"
              >
                {vendor.logo_url ? (
                  <Image
                    src={vendor.logo_url}
                    alt=""
                    width={64}
                    height={64}
                    sizes="64px"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  monogram
                )}
              </div>

              <h3 className="font-display font-semibold text-lg leading-snug text-nl-cacao truncate group-hover:text-nl-amber-text transition-colors">
                {name}
              </h3>
              {vendor.city && (
                <p className="text-xs font-medium text-nl-russet mt-1">
                  {vendor.city}
                </p>
              )}
              {vendor.tagline && (
                <p className="text-sm leading-relaxed text-nl-russet mt-3 min-h-[44px] line-clamp-2">
                  {vendor.tagline}
                </p>
              )}

              <div className="h-px bg-nl-cacao/10 mt-4 mb-3" />

              <div className="flex items-center justify-between text-sm text-nl-russet">
                {ratingText ? (
                  <span className="flex items-center gap-1 font-medium text-nl-cacao">
                    <Star className="h-3.5 w-3.5 fill-nl-amber text-nl-amber" />
                    {ratingText}
                  </span>
                ) : (
                  <span />
                )}
                {followersText ? (
                  <span>{followersText} followers</span>
                ) : (
                  <span />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href={`/${locale}/services`}
        className="md:hidden mt-4 flex min-h-[44px] items-center justify-center gap-1.5 text-sm font-semibold text-nl-amber-text hover:underline"
      >
        All services
        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </Link>
    </section>
  );
}

/* ─── Category Grid Adapter ──────────────────────────────────────────────── */

/** Tile icon for categories without an image, matched on slug keywords. */
const CATEGORY_ICONS: Array<[RegExp, LucideIcon]> = [
  [/maint|repair|ac-|plumb|electric|handyman/, Wrench],
  [/clean/, Sparkles],
  [/beauty|salon|spa|wellness|hair/, Scissors],
  [/pest|pet/, Bug],
  [/fit-out|construct|renovat|interior/, HardHat],
  [/it-|tech|business|computer/, Laptop],
];

function categoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS.find(([re]) => re.test(slug))?.[1] ?? LayoutGrid;
}

async function CategoryGridAdapter({ settings, data }: SectionProps) {
  const items = (data.blocks || data.items || []) as any[];
  if (!items.length) return null;
  const locale = await getLocale();
  const t = await getTranslations("common");
  const title =
    (settings.title as any)?.[locale] ||
    (settings.title as any)?.en ||
    "Browse by category";
  const eyebrow =
    (settings.eyebrow as any)?.[locale] ||
    t("categoriesCount", { count: items.length });

  return (
    <section className="px-2 md:px-0" data-section="category-grid">
      <div className="flex items-end justify-between mb-6 md:mb-8 px-2 md:px-0">
        <div>
          <p className="text-sm font-semibold text-nl-amber-text">
            {eyebrow}
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight tracking-tight mt-2 text-nl-cacao">
            {title}
          </h2>
        </div>
        <Link
          href={`/${locale}/services`}
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-nl-amber-text hover:underline"
        >
          {t("allCategories")}
          <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" strokeWidth={1.75} />
        </Link>
      </div>

      <ScrollRail className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-3 -mx-2 md:mx-0 px-2 md:px-0 scroll-ps-2 md:scroll-ps-0">
        {items.map((cat: any, i: number) => {
          const imgUrl = cat.data?.image_url || cat.image_url;
          const name = cat.data?.name?.[locale] || cat.data?.name?.en || cat.data?.name || cat.name;
          const link =
            cat.data?.link || cat.link || categoryHref(locale, cat.data?.slug || cat.slug || cat.id);
          const count =
            cat.data?.service_count ?? cat.service_count ?? cat.data?.count ?? cat.count ?? null;
          const Icon = categoryIcon(String(cat.data?.slug || cat.slug || ""));
          return (
            <Link
              key={cat.id}
              href={link}
              className="group relative block flex-none snap-start w-[200px] md:w-[260px] aspect-[3/4] overflow-hidden rounded-2xl bg-nl-pearl shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-md"
              style={
                imgUrl
                  ? undefined
                  : {
                      background:
                        i % 2
                          ? "linear-gradient(160deg, hsl(var(--nl-cacao)), hsl(var(--nl-espresso)))"
                          : "linear-gradient(160deg, hsl(var(--nl-amber)), hsl(var(--nl-amber-text)))",
                    }
              }
            >
              {imgUrl ? (
                <>
                  <Image
                    src={imgUrl}
                    alt={name || ""}
                    fill
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nl-espresso/10 to-nl-espresso/75" />
                </>
              ) : (
                <span
                  aria-hidden="true"
                  className="absolute start-5 top-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105"
                >
                  <Icon strokeWidth={1.75} className="h-6 w-6" />
                </span>
              )}

              <div className="absolute start-5 end-5 bottom-5 text-white">
                <p className="font-display font-bold text-xl md:text-2xl leading-tight tracking-tight">
                  {name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  {count != null && (
                    <span className="text-xs font-medium text-white/80">
                      {typeof count === "number"
                        ? `${count.toLocaleString()} services`
                        : `${count} services`}
                    </span>
                  )}
                  <span className="ms-auto flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-colors group-hover:bg-white group-hover:text-nl-cacao">
                    Explore
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </ScrollRail>

      <Link
        href={`/${locale}/services`}
        className="md:hidden mt-4 flex min-h-[44px] items-center justify-center gap-1.5 text-sm font-semibold text-nl-amber-text hover:underline"
      >
        {t("allCategories")}
        <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" strokeWidth={1.75} />
      </Link>
    </section>
  );
}

/* ─── Promotional Banner Adapter ─────────────────────────────────────────── */

/** Exported for the block-JSONB wiring test — see HeroBannerAdapter. */
export async function PromotionalBannerAdapter({ data }: SectionProps) {
  const block = (data.blocks || [])[0] as any;
  if (!block) return null;
  const imgUrl = block.data?.image?.desktop?.url;
  const mobileImgUrl = block.data?.image?.mobile?.url;
  const videoUrl = block.data?.video?.url as string | undefined;

  const locale = await getLocale();
  const title = block.data?.title?.[locale] || block.data?.title?.en || "";
  const ctaLink = localizeHref(block.data?.cta_link || "#", locale);
  const ctaText = block.data?.cta_text?.[locale] || block.data?.cta_text?.en || "Explore";
  const subtitle = pick(block.data?.subtitle, locale);

  // No image: a solid brand panel, so a text-only call to action still works.
  if (!imgUrl) {
    return (
      <section className="px-2 md:px-0" data-section="promotional-banner">
        <div className="relative overflow-hidden rounded-2xl bg-nl-cacao px-6 py-10 md:px-14 md:py-14 flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-12 shadow-sm">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--nl-amber)/0.55),transparent_60%)]"
          />
          <div className="relative max-w-[640px]">
            <h3 className="font-display font-bold text-2xl md:text-4xl leading-tight tracking-tight text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm md:text-base leading-relaxed text-white/75 mt-3">
                {subtitle}
              </p>
            )}
          </div>
          <Link
            href={ctaLink}
            className="relative inline-flex w-fit shrink-0 min-h-[44px] items-center gap-2 whitespace-nowrap rounded-lg bg-white text-nl-cacao px-6 py-3 text-sm font-semibold shadow-sm hover:bg-nl-pearl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {ctaText}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  const focalPoint = block.data?.image?.focal_point;
  const objectPosition =
    focalPoint && typeof focalPoint.x === "number" && typeof focalPoint.y === "number"
      ? `${focalPoint.x * 100}% ${focalPoint.y * 100}%`
      : "center";

  return (
    <section>
      <Link
        href={ctaLink}
        className="group block relative w-full aspect-[16/10] sm:aspect-[2.4/1] md:aspect-[4/1] overflow-hidden rounded-none md:rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nl-amber"
      >
        {imgUrl && (
          <>
            <Image
              src={imgUrl}
              alt={title}
              fill
              className="object-cover hidden md:block"
              style={{ objectPosition }}
              sizes="100vw"
            />
            <Image
              src={mobileImgUrl || imgUrl}
              alt={title}
              fill
              className="object-cover md:hidden"
              style={{ objectPosition }}
              sizes="100vw"
            />
            {videoUrl && (
              <BackgroundVideo src={videoUrl} poster={imgUrl} objectPosition={objectPosition} />
            )}
          </>
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-nl-espresso/80 via-nl-espresso/35 to-transparent"
        />
        <div className="absolute inset-0 flex flex-col justify-end md:justify-center p-5 sm:p-7 md:p-12">
          <h3 className="font-display font-bold text-xl sm:text-2xl md:text-4xl leading-tight tracking-tight text-white mb-3 md:mb-5 max-w-[560px] line-clamp-2">
            {title}
          </h3>
          <span className="inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-lg bg-nl-amber text-white px-4 py-2.5 text-sm font-semibold shadow-sm group-hover:bg-nl-amber/90 transition-colors">
            {ctaText}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </span>
        </div>
      </Link>
    </section>
  );
}

/* ─── Newsletter Signup Adapter ──────────────────────────────────────────── */

async function NewsletterSignupAdapter({ settings }: SectionProps) {
  const locale = await getLocale();
  const title =
    (settings.title as any)?.[locale] ||
    (settings.title as any)?.en ||
    "Stay in the loop";
  const eyebrow =
    (settings.eyebrow as any)?.[locale] ||
    (settings.eyebrow as any)?.en ||
    "ServiceHubUAE updates";
  const subtitle =
    (settings.subtitle as any)?.[locale] ||
    (settings.subtitle as any)?.en ||
    "New services, trusted vendors and seasonal offers across the UAE, delivered to your inbox once a month.";

  return (
    <section className="px-2 md:px-0" data-section="newsletter-signup">
      <div className="relative overflow-hidden rounded-2xl border border-nl-cacao/5 bg-nl-pearl px-6 py-10 md:px-12 md:py-14 grid grid-cols-1 md:grid-cols-[1fr_1.2fr] items-center gap-8 md:gap-12">
        <div>
          <p className="text-sm font-semibold text-nl-amber-text">
            {eyebrow}
          </p>
          <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight tracking-tight mt-2 text-nl-cacao">
            {title}
          </h2>
          <p className="text-base leading-relaxed text-nl-russet max-w-[420px] mt-3">
            {subtitle}
          </p>
        </div>

        <NewsletterForm />
      </div>
    </section>
  );
}

/* ─── Testimonials Adapter (NEW) ─────────────────────────────────────────── */

async function TestimonialsAdapter({ settings, data }: SectionProps) {
  const reviews = (data.blocks || data.items || []) as any[];
  if (!reviews.length) return null;
  const locale = await getLocale();
  const title =
    (settings.title as any)?.[locale] || (settings.title as any)?.en || "In their words";

  return (
    <section className="px-2 md:px-0" data-section="testimonials">
      <SectionHeader title={title} />
      <ScrollRail className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-2 md:px-0 scroll-ps-2 md:scroll-ps-0">
        {reviews.map((review: any) => {
          const name = review.data?.customer_name || review.customer_name || "";
          const text = review.data?.text?.[locale] || review.data?.text?.en || review.data?.text || review.text || "";
          // No default rating — a fabricated five stars is worse than no stars.
          const rating = Number(review.data?.rating ?? review.rating ?? 0);
          const avatar = review.data?.avatar_url || review.avatar_url;
          const product =
            review.data?.service_name ||
            review.service_name ||
            review.data?.product_name ||
            review.product_name ||
            "";

          return (
            <figure
              key={review.id}
              className="flex-none snap-start w-[280px] md:w-[360px] flex flex-col rounded-2xl bg-nl-linen border border-nl-cacao/10 p-6 shadow-sm"
            >
              {rating > 0 && (
                <div
                  className="flex items-center gap-1 mb-4"
                  role="img"
                  aria-label={`${rating} out of 5`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className={
                        i < rating
                          ? "h-4 w-4 fill-nl-amber text-nl-amber"
                          : "h-4 w-4 text-nl-cacao/20"
                      }
                    />
                  ))}
                </div>
              )}

              <blockquote className="flex-1 text-base leading-relaxed text-nl-cacao line-clamp-5">
                &ldquo;{text}&rdquo;
              </blockquote>

              {(name || product) && (
                <figcaption className="mt-5 pt-4 border-t border-nl-cacao/10 flex items-center gap-3">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt=""
                      width={36}
                      height={36}
                      className="w-9 h-9 shrink-0 rounded-full object-cover"
                    />
                  ) : name ? (
                    <span
                      aria-hidden="true"
                      className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-nl-pearl font-display font-semibold text-sm text-nl-amber-text"
                    >
                      {name[0]}
                    </span>
                  ) : null}
                  <span className="min-w-0">
                    {name && (
                      <span className="block text-sm font-semibold text-nl-cacao truncate">
                        {name}
                      </span>
                    )}
                    {product && (
                      <span className="block text-xs text-nl-russet truncate mt-0.5">
                        {product}
                      </span>
                    )}
                  </span>
                </figcaption>
              )}
            </figure>
          );
        })}
      </ScrollRail>
    </section>
  );
}

/* ─── Trending Reels Adapter ────────────────────────────────────────────── */

async function TrendingReelsAdapter({ settings, data }: SectionProps) {
  const locale = await getLocale();
  const title = (settings.title as any)?.[locale] || (settings.title as any)?.en || "Trending Reels";
  const subtitle = (settings.subtitle as any)?.[locale] || (settings.subtitle as any)?.en || "See what's inspiring the community";
  const reels = (data.items || []) as any[];

  return (
    <TrendingReelsSection
      title={title}
      subtitle={subtitle}
      serverReels={reels}
    />
  );
}
