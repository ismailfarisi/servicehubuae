"use client";

import { Eyebrow } from "@/components/ui/maison-primitives";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/stores/auth";
import {
  ArrowLeft,
  CalendarClock,
  ChevronRight,
  LifeBuoy,
  type LucideIcon,
  MapPin,
  Settings,
  Star,
  Video,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  key: string;
  icon: LucideIcon;
  href: string;
  /** Message key to use for the label, if different from `key` (when the
   * natural key is already taken by a nested translation block). */
  labelKey?: string;
}

const navItems: NavItem[] = [
  { key: "bookings", icon: CalendarClock, href: "/account/bookings" },
  { key: "addresses", icon: MapPin, href: "/account/addresses" },
  { key: "reels", icon: Video, href: "/account/reels" },
  { key: "support", icon: LifeBuoy, href: "/account/support" },
  { key: "settings", icon: Settings, href: "/account/settings" },
];

/** Creator dashboard nav item — only shown to graduated creators/influencers. */
const creatorNavItem: NavItem = { key: "creator", icon: Star, href: "/account/creator" };

/** "Become a Creator" nav item — shown to non-creators so they can find the apply flow. */
const becomeCreatorNavItem: NavItem = {
  key: "becomeCreator",
  icon: Star,
  href: "/account/creator/apply",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isReady } = useRequireAuth();

  const isCreator = user?.creator_tier === "creator" || user?.creator_tier === "influencer";
  // Insert the creator link just before Settings: the dashboard for graduated
  // creators, or the "Become a Creator" apply flow for everyone else.
  const visibleNavItems = [
    ...navItems.slice(0, -1),
    isCreator ? creatorNavItem : becomeCreatorNavItem,
    navItems[navItems.length - 1],
  ];

  // Exact match: only the menu landing page, not any subpage under it.
  const isIndex = pathname === `/${locale}/account`;
  const activeItem = visibleNavItems.find(({ href }) => pathname.startsWith(`/${locale}${href}`));

  if (!isReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background text-sm text-nl-russet">
        {tCommon("loading")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {/* Profile header — mobile: menu landing only, desktop: always */}
        <div className={`${isIndex ? "flex" : "hidden md:flex"} items-center gap-4 mb-6 md:mb-8`}>
          <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-nl-pearl ring-1 ring-nl-amber/20">
            <span className="font-display text-xl font-bold text-nl-amber-text">
              {(user?.first_name?.charAt(0) ?? user?.email?.charAt(0) ?? "U").toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <Eyebrow>Account</Eyebrow>
            <h1 className="mt-0.5 truncate font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="truncate text-sm text-nl-russet">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-5 md:gap-10">
          <nav
            className={`${isIndex ? "flex" : "hidden"} flex-col md:flex md:flex-col gap-0.5 w-full md:w-56 shrink-0 self-start rounded-2xl border border-nl-cacao/10 bg-nl-linen p-2 shadow-sm`}
            aria-label="Account navigation"
          >
            {visibleNavItems.map(({ key, labelKey, icon: Icon, href }) => {
              const fullHref = `/${locale}${href}`;
              const isActive = pathname.startsWith(fullHref);
              return (
                <Link
                  key={key}
                  href={fullHref}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center justify-between md:justify-start gap-3 rounded-lg px-3 py-3 md:py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-nl-amber ${
                    isActive
                      ? "bg-nl-pearl text-nl-amber-text font-semibold"
                      : "text-nl-cacao font-medium hover:bg-nl-pearl"
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-nl-amber" : "text-nl-russet"}`}
                      strokeWidth={1.75}
                    />
                    <span className="leading-tight line-clamp-1">{t(labelKey ?? key)}</span>
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-nl-russet opacity-60 md:hidden rtl:rotate-180"
                    strokeWidth={1.75}
                  />
                </Link>
              );
            })}
          </nav>
          <div className={`flex-1 min-w-0 ${isIndex ? "hidden md:block" : ""}`}>
            {!isIndex && (
              <Link
                href={`/${locale}/account`}
                className="md:hidden inline-flex items-center gap-2 mb-4 text-sm font-semibold text-nl-amber-text hover:underline"
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
                <span>{tCommon("back")}</span>
                {activeItem && (
                  <span className="font-normal text-nl-russet">
                    · {t(activeItem.labelKey ?? activeItem.key)}
                  </span>
                )}
              </Link>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
