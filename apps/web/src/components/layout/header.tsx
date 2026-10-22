"use client";

import type { NavTab } from "@/lib/api/navigation";
import { useAuthModalStore } from "@/stores/auth-modal";
import { useAuthStore } from "@/stores/auth";
import { useCollapseOnScroll } from "@/hooks/use-collapse-on-scroll";
import { useMobileNavStore } from "@/stores/mobile-nav";
import { VENDOR_REGISTER_URL } from "@/lib/vendor-dashboard";
import { CalendarCheck, LayoutGrid, MapPin, Menu, Search, Store, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { CurrencySelector } from "./currency-selector";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import { MobileSearchOverlay } from "./mobile-search-overlay";
import { NavBar } from "./nav-bar";
import {
	SearchAutocomplete,
	SearchAutocompleteFallback,
} from "./search-autocomplete";

interface HeaderProps {
	tabs: NavTab[];
}

export function Header({ tabs }: HeaderProps) {
	const t = useTranslations("common");
	const locale = useLocale();
	const { isAuthenticated, user } = useAuthStore();
	const openAuthModal = useAuthModalStore((s) => s.open);
	const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
	const mobileNavOpen = useMobileNavStore((s) => s.drawerOpen);
	const openMobileNav = useMobileNavStore((s) => s.openDrawer);
	const closeMobileNav = useMobileNavStore((s) => s.closeDrawer);
	const collapsed = useCollapseOnScroll();

	return (
		<header
			className={`sticky z-40 transition-[top] duration-300 ease-out motion-reduce:transition-none ${
				collapsed ? "-top-9" : "top-0"
			}`}
		>
			{/* Utility bar — coverage, perks, locale, currency.
			    Scrolls up out of the viewport when `collapsed` shifts the sticky
			    offset by its own height, leaving the main row pinned at the top. */}
			<div className="bg-nl-cacao text-white/80">
				<div className="max-w-[1400px] mx-auto px-4 md:px-12 h-9 flex items-center justify-between text-xs">
					<div className="flex items-center gap-2">
						<MapPin className="h-3.5 w-3.5 text-white/70" strokeWidth={1.75} />
						<span className="hidden sm:inline">
							Services across the{" "}
							<span className="font-medium text-white">United Arab Emirates</span>
						</span>
						<span className="sm:hidden font-medium text-white">UAE</span>
					</div>
					<div className="flex items-center gap-3 md:gap-[18px]">
						<span className="hidden md:inline">
							Compare up to{" "}
							<span className="font-medium text-white">3 vendors</span>
						</span>
						<span className="hidden md:block w-px h-3 bg-white/20" />
						<LocaleSwitcher />
						<CurrencySelector />
					</div>
				</div>
			</div>

			{/* Main header — logo + search + actions */}
			<div className="bg-nl-linen/95 backdrop-blur-md border-b border-nl-cacao/10">
				<div className="max-w-[1400px] mx-auto px-4 md:px-12 grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-9 py-3 md:py-4">
					{/* Logo */}
					<Link
						href={`/${locale}`}
						aria-label="ServiceHubUAE"
						className="shrink-0 inline-flex items-center"
					>
						<Image
							src="/servicehubuae-logo.png"
							alt="ServiceHubUAE"
							width={216}
							height={120}
							priority
							className="h-11 md:h-14 w-auto"
						/>
					</Link>

					{/* Search — desktop */}
					<div className="hidden md:flex relative justify-self-center w-full max-w-[760px] items-center gap-3 px-5 py-2.5 rounded-full bg-nl-pearl border border-nl-cacao/10 transition-colors focus-within:border-nl-amber focus-within:bg-nl-linen focus-within:ring-2 focus-within:ring-nl-amber/20">
						<Search
							className="h-4 w-4 text-nl-russet shrink-0"
							strokeWidth={1.75}
						/>
						<div className="flex-1 min-w-0">
							{/* Boundary is required: SearchAutocomplete reads useSearchParams,
							    which would otherwise deopt every page under this layout out of
							    static rendering and fail the build. */}
							<Suspense fallback={<SearchAutocompleteFallback />}>
								<SearchAutocomplete />
							</Suspense>
						</div>
						<span className="rounded-md border border-nl-cacao/10 bg-nl-linen px-1.5 py-0.5 text-xs font-medium text-nl-russet shrink-0">
							⌘K
						</span>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-self-end gap-1 md:gap-5 text-sm font-medium text-nl-russet shrink-0">
						{/* Mobile hamburger */}
						<button
							type="button"
							onClick={openMobileNav}
							aria-label="Menu"
							className="lg:hidden text-nl-cacao p-3 rounded-lg hover:bg-nl-pearl transition-colors"
						>
							<Menu className="h-5 w-5" strokeWidth={1.75} />
						</button>

						{/* Mobile search toggle */}
						<button
							type="button"
							onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
							className="md:hidden text-nl-cacao p-3 rounded-lg hover:bg-nl-pearl transition-colors"
							aria-label="Search"
						>
							<Search className="h-5 w-5" strokeWidth={1.75} />
						</button>

						{/* Services — desktop only */}
						<Link
							href={`/${locale}/services`}
							className="hidden lg:inline-flex items-center gap-1.5 hover:text-nl-cacao transition-colors"
						>
							<LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
							{t("services")}
						</Link>

						{/* Become a vendor — desktop only (vendor dashboard is a separate app) */}
						<a
							href={VENDOR_REGISTER_URL}
							className="hidden lg:inline-flex items-center gap-1.5 hover:text-nl-cacao transition-colors"
						>
							<Store className="h-4 w-4" strokeWidth={1.75} />
							Sell
						</a>

						{/* My bookings */}
						{isAuthenticated && (
							<Link
								href={`/${locale}/account/bookings`}
								aria-label={t("myBookings")}
								className="hidden sm:inline-flex p-3 rounded-lg text-nl-cacao hover:bg-nl-pearl hover:text-nl-amber-text transition-colors"
							>
								<CalendarCheck className="h-[19px] w-[19px]" strokeWidth={1.75} />
							</Link>
						)}

						{/* Account / Login */}
						{isAuthenticated ? (
							<Link
								href={`/${locale}/account`}
								className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 border border-nl-cacao/15 bg-nl-linen font-semibold text-nl-cacao hover:bg-nl-pearl transition-colors"
							>
								<User className="h-4 w-4" strokeWidth={1.75} />
								<span className="hidden lg:inline max-w-[80px] truncate">
									{user?.first_name || t("account")}
								</span>
							</Link>
						) : (
							<button
								type="button"
								onClick={() => openAuthModal("login")}
								className="inline-flex items-center justify-center gap-2 rounded-lg bg-nl-amber px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors cursor-pointer"
							>
								<User className="h-4 w-4" strokeWidth={1.75} />
								<span className="hidden sm:inline">{t("login")}</span>
							</button>
						)}
					</div>
				</div>

				<NavBar tabs={tabs} />
			</div>

			<MobileSearchOverlay
				open={mobileSearchOpen}
				onClose={() => setMobileSearchOpen(false)}
				tabs={tabs}
			/>
			<MobileNavDrawer open={mobileNavOpen} onClose={closeMobileNav} tabs={tabs} />
		</header>
	);
}
