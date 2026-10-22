/* Services-marketplace sections for CMS layouts (cms-service section types
 * `service_search_hero`, `feature_grid`, `area_links`). Same modern blue &
 * white system as the adapters in layout-renderer.tsx: display-sans heads,
 * nl-* tokens, rounded cards and pills, soft shadows, blue primary actions.
 * Copy comes from section settings/blocks as { en, ar } objects; UI chrome
 * strings come from the `home` namespace.
 */
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CircleCheck,
  Clock,
  MapPin,
  MessageCircle,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { UAE_EMIRATES } from "@/lib/emirates";
import { routing } from "../../../i18n/routing";

export interface SectionProps {
  settings: Record<string, unknown>;
  data: { blocks?: unknown[]; items?: unknown[] };
}

interface FeatureBlock {
  id?: string;
  data?: { icon?: string; title?: unknown; text?: unknown };
}

interface AreaItem {
  id?: string;
  slug: string;
  name: string;
  emirate?: string | null;
  sort_order?: number | null;
}

/** Localized CMS string: `{ en, ar }` → current locale, falling back to English. */
export function pick(value: unknown, locale: string): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    const s = v[locale] ?? v.en;
    return typeof s === "string" ? s : "";
  }
  return "";
}

/** Prefix internal CMS links with the locale (`/services` → `/ar/services`). */
export function localizeHref(href: string, locale: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const first = href.split(/[/?#]/)[1] ?? "";
  if ((routing.locales as readonly string[]).includes(first)) return href;
  return `/${locale}${href}`;
}

/** Areas grouped by emirate, emirates in canonical order, areas in seed order. */
function groupByEmirate(areas: AreaItem[]): Array<{ emirate: string; areas: AreaItem[] }> {
  const groups = new Map<string, AreaItem[]>();
  for (const a of areas) {
    if (!a?.slug || !a?.name) continue;
    const key = a.emirate || "Other";
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }
  const order: string[] = UAE_EMIRATES.map((e) => e.value);
  return [...groups.entries()]
    .sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia < 0 ? order.length : ia) - (ib < 0 ? order.length : ib);
    })
    .map(([emirate, list]) => ({
      emirate,
      areas: [...list].sort((x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0)),
    }));
}

async function emirateLabel(emirate: string): Promise<string> {
  const t = await getTranslations("emirates");
  const key = UAE_EMIRATES.find((e) => e.value === emirate)?.labelKey;
  return key ? t(key) : emirate;
}

/* ─── Service Search Hero ────────────────────────────────────────────────── */

export async function ServiceSearchHeroAdapter({ settings, data }: SectionProps) {
  const locale = await getLocale();
  const t = await getTranslations("home");
  const areas = (data.items || []) as AreaItem[];
  const groups = groupByEmirate(areas);
  const popular = (Array.isArray(settings.popular_searches) ? settings.popular_searches : [])
    .map((p: { label?: unknown; query?: unknown } | null) => ({
      label: pick(p?.label, locale),
      query: String(p?.query ?? ""),
    }))
    .filter((p) => p.label && p.query);

  const eyebrow = pick(settings.eyebrow, locale) || t("heroEyebrow");
  const title = pick(settings.title, locale) || t("heroTitle");
  const subtitle = pick(settings.subtitle, locale) || t("heroSubtitle");
  const placeholder = pick(settings.search_placeholder, locale) || t("searchPlaceholder");

  return (
    <section className="bg-gradient-to-b from-nl-pearl to-nl-linen px-5 py-12 md:px-14 md:py-20" data-section="service-search-hero">
      <p className="inline-flex items-center rounded-full bg-nl-linen border border-nl-amber/20 px-3 py-1 text-sm font-semibold text-nl-amber-text shadow-sm">{eyebrow}</p>
      <h1 className="font-display font-bold text-4xl md:text-6xl leading-tight tracking-tight text-nl-cacao mt-5 max-w-[18ch]">
        {title}
      </h1>
      <p className="text-base md:text-lg leading-relaxed text-nl-russet max-w-[56ch] mt-4">
        {subtitle}
      </p>

      <form
        action={`/${locale}/services`}
        method="get"
        className="mt-8 flex flex-col md:flex-row md:items-center gap-2 md:gap-0 max-w-[880px] rounded-2xl bg-nl-linen border border-nl-cacao/10 p-2 shadow-[0_20px_50px_-24px_hsl(var(--nl-cacao)/0.35)] focus-within:border-nl-amber/40 transition-colors"
      >
        <label className="flex flex-1 items-center gap-3 px-3 min-h-[52px]">
          <Search className="h-5 w-5 shrink-0 text-nl-russet" strokeWidth={1.75} aria-hidden="true" />
          <span className="sr-only">{t("searchLabel")}</span>
          <input
            type="search"
            name="q"
            placeholder={placeholder}
            className="w-full bg-transparent text-[15px] text-nl-cacao placeholder:text-nl-russet/70 outline-none"
          />
        </label>
        {groups.length > 0 && (
          <label className="flex items-center gap-2 px-3 min-h-[52px] rounded-xl bg-nl-pearl md:bg-transparent md:rounded-none md:border-s border-nl-cacao/10">
            <MapPin className="h-5 w-5 shrink-0 text-nl-russet" strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">{t("areaLabel")}</span>
            <select
              name="area"
              defaultValue=""
              className="w-full md:w-[200px] bg-transparent text-sm text-nl-cacao outline-none cursor-pointer"
            >
              <option value="">{t("allAreas")}</option>
              {await Promise.all(
                groups.map(async (g) => (
                  <optgroup key={g.emirate} label={await emirateLabel(g.emirate)}>
                    {g.areas.map((a) => (
                      <option key={a.slug} value={a.slug}>
                        {a.name}
                      </option>
                    ))}
                  </optgroup>
                )),
              )}
            </select>
          </label>
        )}
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-xl bg-nl-amber text-white text-sm font-semibold shadow-sm hover:bg-nl-amber/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nl-amber"
        >
          {t("searchButton")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2} aria-hidden="true" />
        </button>
      </form>

      {popular.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-nl-russet me-1">
            {t("popularSearches")}
          </span>
          {popular.map((p) => (
            <Link
              key={p.query}
              href={`/${locale}/services?q=${encodeURIComponent(p.query)}`}
              className="rounded-full px-3.5 py-1.5 border border-nl-cacao/10 bg-nl-linen text-sm font-medium text-nl-cacao shadow-sm hover:border-nl-amber/40 hover:bg-nl-pearl hover:text-nl-amber-text transition-colors"
            >
              {p.label}
            </Link>
          ))}
        </div>
      )}

      {areas.length > 0 && (
        <p className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-nl-russet">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-nl-amber" strokeWidth={1.75} aria-hidden="true" />
            {t("areasCovered", { areas: areas.length, emirates: groups.length })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-nl-amber" strokeWidth={1.75} aria-hidden="true" />
            {t("verifiedVendors")}
          </span>
        </p>
      )}
    </section>
  );
}

/* ─── Feature Grid ───────────────────────────────────────────────────────── */

/** Icon names the admin editor offers (packages/ui SectionConfigEditor FEATURE_ICONS). */
export const FEATURE_ICONS: Record<string, LucideIcon> = {
  search: Search,
  compare: Scale,
  calendar: CalendarCheck,
  check: CircleCheck,
  shield: ShieldCheck,
  star: Star,
  tag: Tag,
  map: MapPin,
  clock: Clock,
  chat: MessageCircle,
  wallet: Wallet,
  sparkles: Sparkles,
};

export async function FeatureGridAdapter({ settings, data }: SectionProps) {
  const locale = await getLocale();
  const items = ((data.blocks || []) as FeatureBlock[])
    .map((b) => ({
      id: String(b?.id ?? ""),
      Icon: FEATURE_ICONS[b?.data?.icon ?? ""] ?? Sparkles,
      title: pick(b?.data?.title, locale),
      text: pick(b?.data?.text, locale),
    }))
    .filter((b) => b.title);
  if (!items.length) return null;

  const steps = settings.variant === "steps";
  const eyebrow = pick(settings.eyebrow, locale);
  const title = pick(settings.title, locale);
  const subtitle = pick(settings.subtitle, locale);

  return (
    <section className="px-4 md:px-0" data-section="feature-grid">
      {(eyebrow || title) && (
        <div className="mb-8 md:mb-12 max-w-[640px]">
          {eyebrow && (
            <p className="text-sm font-semibold text-nl-amber-text">{eyebrow}</p>
          )}
          {title && (
            <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight tracking-tight mt-2 text-nl-cacao">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-base leading-relaxed text-nl-russet max-w-[52ch] mt-3">{subtitle}</p>
          )}
        </div>
      )}

      {steps ? (
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {items.map(({ id, Icon, title, text }, i) => (
            <li key={id || i} className="relative rounded-2xl border border-nl-cacao/10 bg-nl-linen p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-nl-amber font-display text-base font-bold text-white">
                  {i + 1}
                </span>
                <Icon className="h-6 w-6 text-nl-amber" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3 className="font-display font-semibold text-xl leading-tight text-nl-cacao mt-5">{title}</h3>
              {text && <p className="text-sm leading-relaxed text-nl-russet mt-2">{text}</p>}
            </li>
          ))}
        </ol>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {items.map(({ id, Icon, title, text }, i) => (
            <div key={id || i} className="rounded-2xl bg-nl-linen border border-nl-cacao/10 p-6 shadow-sm hover:shadow-md transition-shadow">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-nl-pearl text-nl-amber">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h3 className="font-display font-semibold text-lg leading-snug text-nl-cacao mt-5">{title}</h3>
              {text && <p className="text-sm leading-relaxed text-nl-russet mt-2">{text}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Area Links ─────────────────────────────────────────────────────────── */

export async function AreaLinksAdapter({ settings, data }: SectionProps) {
  const groups = groupByEmirate((data.items || []) as AreaItem[]);
  if (!groups.length) return null;
  const locale = await getLocale();
  const t = await getTranslations("home");
  const eyebrow = pick(settings.eyebrow, locale);
  const title = pick(settings.title, locale) || t("areasTitle");
  const subtitle = pick(settings.subtitle, locale);

  return (
    <section className="px-4 md:px-0" data-section="area-links">
      <div className="mb-8 md:mb-10 max-w-[640px]">
        {eyebrow && (
          <p className="text-sm font-semibold text-nl-amber-text">{eyebrow}</p>
        )}
        <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight tracking-tight mt-2 text-nl-cacao">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base leading-relaxed text-nl-russet max-w-[52ch] mt-3">{subtitle}</p>
        )}
      </div>

      <div className="divide-y divide-nl-cacao/10 rounded-2xl border border-nl-cacao/10 bg-nl-linen px-5 md:px-8 shadow-sm">
        {await Promise.all(
          groups.map(async (g) => (
            <div
              key={g.emirate}
              className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 md:gap-8 py-5 md:py-6"
            >
              <h3 className="font-display font-semibold text-lg text-nl-cacao">
                {await emirateLabel(g.emirate)}
                <span className="block text-xs font-sans font-medium text-nl-russet mt-1">
                  {t("areaCount", { count: g.areas.length })}
                </span>
              </h3>
              <ul className="flex flex-wrap gap-2">
                {g.areas.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/${locale}/services?area=${encodeURIComponent(a.slug)}`}
                      className="inline-block rounded-full px-3.5 py-1.5 bg-nl-pearl text-sm font-medium text-nl-cacao hover:bg-nl-amber hover:text-white transition-colors"
                    >
                      {a.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )),
        )}
      </div>
    </section>
  );
}
