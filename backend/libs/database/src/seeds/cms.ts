import type { DataSource } from "typeorm";
import { IsNull } from "typeorm";
import { LayoutSection } from "../entities/layout-section.entity.ts";
import { LayoutVersion } from "../entities/layout-version.entity.ts";
import { PageLayout } from "../entities/page-layout.entity.ts";
import { SectionType } from "../entities/section-type.entity.ts";
import { LayoutStatus, SourceMode } from "../enums/layout.enums.ts";

type Localized = { en: string; ar: string };

interface SectionTypeSeed {
  name: string;
  label: Localized;
  description: string;
  icon: string;
  scope: "platform" | "vendor" | "both";
  max_per_layout: number | null;
  supports_bidding: boolean;
}

/**
 * Every section type the web storefront renders (apps/web
 * components/layout/layout-renderer.tsx SECTION_REGISTRY). The admin layout
 * editor offers exactly these when adding a section.
 */
export const SECTION_TYPES: SectionTypeSeed[] = [
  {
    name: "service_search_hero",
    label: { en: "Service search hero", ar: "واجهة البحث عن الخدمات" },
    description: "Headline with a service search box, area picker and popular searches.",
    icon: "search",
    scope: "platform",
    max_per_layout: 1,
    supports_bidding: false,
  },
  {
    name: "hero_carousel",
    label: { en: "Hero carousel", ar: "شريط العرض الرئيسي" },
    description: "Full-width image or video slides with a call to action.",
    icon: "image",
    scope: "both",
    max_per_layout: 1,
    supports_bidding: false,
  },
  {
    name: "category_grid",
    label: { en: "Category grid", ar: "شبكة الفئات" },
    description: "Service categories, from the catalogue or picked by hand.",
    icon: "layout-grid",
    scope: "both",
    max_per_layout: null,
    supports_bidding: false,
  },
  {
    name: "service_carousel",
    label: { en: "Service carousel", ar: "شريط الخدمات" },
    description: "A row of bookable services from a catalogue query or sponsored slots.",
    icon: "list-checks",
    scope: "platform",
    max_per_layout: null,
    supports_bidding: true,
  },
  {
    name: "vendor_showcase",
    label: { en: "Vendor showcase", ar: "عرض المزوّدين" },
    description: "Featured service providers.",
    icon: "store",
    scope: "platform",
    max_per_layout: null,
    supports_bidding: true,
  },
  {
    name: "feature_grid",
    label: { en: "Feature grid", ar: "شبكة المزايا" },
    description: "Icon cards or numbered steps, e.g. How it works or Why choose us.",
    icon: "sparkles",
    scope: "both",
    max_per_layout: null,
    supports_bidding: false,
  },
  {
    name: "area_links",
    label: { en: "Areas we serve", ar: "المناطق التي نخدمها" },
    description: "Links to services in each UAE area, grouped by emirate.",
    icon: "map-pin",
    scope: "platform",
    max_per_layout: 1,
    supports_bidding: false,
  },
  {
    name: "promotional_banner",
    label: { en: "Promotional banner", ar: "لافتة ترويجية" },
    description: "A single banner with a call to action; the image is optional.",
    icon: "megaphone",
    scope: "both",
    max_per_layout: null,
    supports_bidding: true,
  },
  {
    name: "testimonials",
    label: { en: "Testimonials", ar: "آراء العملاء" },
    description: "Customer quotes. Use real reviews only.",
    icon: "quote",
    scope: "both",
    max_per_layout: null,
    supports_bidding: false,
  },
  {
    name: "trending_reels",
    label: { en: "Trending reels", ar: "المقاطع الرائجة" },
    description: "Short videos from vendors and creators.",
    icon: "film",
    scope: "both",
    max_per_layout: 1,
    supports_bidding: false,
  },
  {
    name: "newsletter_signup",
    label: { en: "Newsletter signup", ar: "الاشتراك في النشرة" },
    description: "Email signup panel.",
    icon: "mail",
    scope: "platform",
    max_per_layout: 1,
    supports_bidding: false,
  },
];

interface HomeSectionSeed {
  type: string;
  source_mode: SourceMode;
  settings: Record<string, unknown>;
  data_source?: Record<string, unknown>;
  blocks?: Record<string, unknown>[];
}

const feature = (id: string, icon: string, title: Localized, text: Localized) => ({
  id,
  type: "feature",
  data: { icon, title, text },
});

/** The storefront home page (`/layouts/home/resolve`), in display order. */
export const HOME_SECTIONS: HomeSectionSeed[] = [
  {
    type: "service_search_hero",
    source_mode: SourceMode.query,
    data_source: { type: "areas", query: {} },
    settings: {
      eyebrow: { en: "Services marketplace · UAE", ar: "سوق الخدمات · الإمارات" },
      title: {
        en: "Book trusted services across the UAE",
        ar: "احجز خدمات موثوقة في جميع أنحاء الإمارات",
      },
      subtitle: {
        en: "Compare vendors on price, rating and availability, then book a time slot in minutes.",
        ar: "قارن بين المزوّدين من حيث السعر والتقييم والتوفر، ثم احجز موعدك في دقائق.",
      },
      search_placeholder: {
        en: "What do you need? e.g. AC service, deep cleaning",
        ar: "ما الخدمة التي تحتاجها؟ مثل صيانة المكيف أو التنظيف العميق",
      },
      popular_searches: [
        { label: { en: "AC service", ar: "صيانة المكيف" }, query: "ac service" },
        { label: { en: "Deep cleaning", ar: "تنظيف عميق" }, query: "deep cleaning" },
        { label: { en: "Pest control", ar: "مكافحة الحشرات" }, query: "pest control" },
        { label: { en: "Plumbing", ar: "السباكة" }, query: "plumbing" },
        { label: { en: "Haircut", ar: "قص الشعر" }, query: "haircut" },
      ],
    },
  },
  {
    type: "category_grid",
    source_mode: SourceMode.query,
    data_source: { type: "categories", query: { depth: 1 } },
    settings: { title: { en: "Browse by category", ar: "تصفح حسب الفئة" } },
  },
  {
    type: "service_carousel",
    source_mode: SourceMode.query,
    data_source: { type: "services", query: { limit: 12 } },
    settings: {
      title: { en: "Popular services", ar: "الخدمات الأكثر طلبًا" },
      subtitle: {
        en: "Bookable services from verified vendors, with prices shown upfront.",
        ar: "خدمات قابلة للحجز من مزوّدين موثّقين، مع عرض الأسعار مسبقًا.",
      },
    },
  },
  {
    type: "feature_grid",
    source_mode: SourceMode.manual,
    settings: {
      variant: "steps",
      eyebrow: { en: "How it works", ar: "كيف تعمل المنصة" },
      title: { en: "Booked in three steps", ar: "احجز في ثلاث خطوات" },
    },
    blocks: [
      feature(
        "how-find",
        "search",
        { en: "Find the service", ar: "اعثر على الخدمة" },
        {
          en: "Search the catalogue or browse by category and area.",
          ar: "ابحث في الدليل أو تصفح حسب الفئة والمنطقة.",
        },
      ),
      feature(
        "how-compare",
        "compare",
        { en: "Compare vendors", ar: "قارن بين المزوّدين" },
        {
          en: "See prices, ratings and availability side by side.",
          ar: "اطّلع على الأسعار والتقييمات والمواعيد المتاحة جنبًا إلى جنب.",
        },
      ),
      feature(
        "how-book",
        "calendar",
        { en: "Book a time slot", ar: "احجز موعدك" },
        {
          en: "Pick a slot that suits you and get an instant confirmation.",
          ar: "اختر الموعد المناسب لك واحصل على تأكيد فوري.",
        },
      ),
    ],
  },
  {
    type: "feature_grid",
    source_mode: SourceMode.manual,
    settings: {
      variant: "cards",
      eyebrow: { en: "Why ServiceHubUAE", ar: "لماذا ServiceHubUAE" },
      title: { en: "Service you can count on", ar: "خدمة يمكنك الاعتماد عليها" },
    },
    blocks: [
      feature(
        "why-verified",
        "shield",
        { en: "Verified vendors", ar: "مزوّدون موثّقون" },
        {
          en: "Trade licences are checked before a vendor can take bookings.",
          ar: "نتحقق من الرخص التجارية قبل أن يبدأ المزوّد في استقبال الحجوزات.",
        },
      ),
      feature(
        "why-prices",
        "tag",
        { en: "Clear prices", ar: "أسعار واضحة" },
        {
          en: "See the price in AED before you book. No surprises.",
          ar: "اطّلع على السعر بالدرهم قبل الحجز، دون مفاجآت.",
        },
      ),
      feature(
        "why-slots",
        "clock",
        { en: "Live availability", ar: "مواعيد متاحة مباشرة" },
        {
          en: "Only real open slots are shown, so your booking is confirmed straight away.",
          ar: "نعرض المواعيد المتاحة فعليًا فقط، ليتم تأكيد حجزك فورًا.",
        },
      ),
      feature(
        "why-reviews",
        "star",
        { en: "Honest ratings", ar: "تقييمات حقيقية" },
        {
          en: "Ratings come from customers who booked through ServiceHubUAE.",
          ar: "تأتي التقييمات من عملاء حجزوا عبر ServiceHubUAE.",
        },
      ),
    ],
  },
  {
    type: "area_links",
    source_mode: SourceMode.query,
    data_source: { type: "areas", query: {} },
    settings: {
      eyebrow: { en: "Across all seven emirates", ar: "في الإمارات السبع" },
      title: { en: "Areas we serve", ar: "المناطق التي نخدمها" },
    },
  },
  {
    type: "promotional_banner",
    source_mode: SourceMode.manual,
    settings: {},
    blocks: [
      {
        id: "become-a-vendor",
        type: "banner",
        data: {
          title: {
            en: "Run a service business? Reach customers across the UAE",
            ar: "لديك نشاط خدمي؟ تواصل مع العملاء في جميع أنحاء الإمارات",
          },
          subtitle: {
            en: "List your services, manage your calendar and bookings from one dashboard.",
            ar: "اعرض خدماتك وأدر مواعيدك وحجوزاتك من لوحة تحكم واحدة.",
          },
          cta_text: { en: "Become a vendor", ar: "انضم كمزوّد" },
          cta_link: "/become-a-vendor",
        },
      },
    ],
  },
  {
    type: "newsletter_signup",
    source_mode: SourceMode.manual,
    settings: {
      eyebrow: { en: "ServiceHubUAE updates", ar: "تحديثات ServiceHubUAE" },
      title: { en: "Offers worth knowing about", ar: "عروض تستحق المعرفة" },
      subtitle: {
        en: "New services, trusted vendors and seasonal offers, once a month.",
        ar: "خدمات جديدة ومزوّدون موثوقون وعروض موسمية، مرة واحدة في الشهر.",
      },
    },
  },
];

/**
 * Idempotent CMS bootstrap:
 * - inserts section types that are missing by name (existing rows, which an
 *   admin may have relabelled, are left alone);
 * - creates and publishes the `home` layout only if no platform `home` layout
 *   exists, including a soft-deleted one, so a re-seed never overwrites
 *   what an admin built.
 */
export async function seedCms(
  ds: DataSource,
  adminUserId: string,
): Promise<{ sectionTypes: number; homeLayout: boolean }> {
  const typeRepo = ds.getRepository(SectionType);
  const existing = await typeRepo.find({ select: ["id", "name"] });
  const have = new Set(existing.map((t) => t.name));
  const missing = SECTION_TYPES.filter((t) => !have.has(t.name));
  if (missing.length) {
    await typeRepo.save(missing.map((t) => typeRepo.create({ ...t, is_active: true })));
  }

  const homeExists = await ds
    .getRepository(PageLayout)
    .findOne({ where: { slug: "home", vendor_id: IsNull() }, withDeleted: true });
  if (homeExists) return { sectionTypes: missing.length, homeLayout: false };

  const typeIds = new Map(
    (await typeRepo.find({ select: ["id", "name"] })).map((t) => [t.name, t.id]),
  );

  await ds.transaction(async (em) => {
    const layout = await em.save(
      em.create(PageLayout, {
        slug: "home",
        vendor_id: null,
        title: { en: "Home", ar: "الرئيسية" },
        status: LayoutStatus.published,
        created_by: adminUserId,
      }),
    );
    const now = new Date();
    const version = await em.save(
      em.create(LayoutVersion, {
        layout_id: layout.id,
        version_number: 1,
        published_at: now,
        created_by: adminUserId,
      }),
    );
    await em.save(
      HOME_SECTIONS.map((s, position) => {
        const sectionTypeId = typeIds.get(s.type);
        if (!sectionTypeId) throw new Error(`section type ${s.type} missing`);
        return em.create(LayoutSection, {
          version_id: version.id,
          section_type_id: sectionTypeId,
          position,
          source_mode: s.source_mode,
          settings: s.settings,
          data_source: s.data_source ?? null,
          blocks: s.blocks ?? null,
        });
      }),
    );
    await em.update(PageLayout, layout.id, { published_version_id: version.id });
  });

  return { sectionTypes: missing.length, homeLayout: true };
}
