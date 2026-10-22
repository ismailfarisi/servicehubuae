"use client";

import { useCollapseOnScroll } from "@/hooks/use-collapse-on-scroll";
import { useAuthModalStore } from "@/stores/auth-modal";
import { useAuthStore } from "@/stores/auth";
import { useMobileNavStore } from "@/stores/mobile-nav";
import { CalendarCheck, Clapperboard, House, LayoutGrid, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = /\/(reels|book|auth)(\/|$)/;

export function MobileTabBar() {
	const t = useTranslations("common");
	const tFooter = useTranslations("footer");
	const locale = useLocale();
	const pathname = usePathname() ?? "";
	const { isAuthenticated } = useAuthStore();
	const openDrawer = useMobileNavStore((s) => s.openDrawer);
	const openAuthModal = useAuthModalStore((s) => s.open);
	// Must run before the early return below — hooks cannot be conditional.
	const collapsed = useCollapseOnScroll();

	if (HIDDEN_ROUTES.test(pathname)) return null;

	const isHome = pathname === `/${locale}` || pathname === "/";
	const itemClass = (active: boolean) =>
		`flex flex-col items-center justify-center gap-1 h-full text-xs font-medium transition-colors ${
			active ? "text-nl-amber-text" : "text-nl-russet"
		}`;

	return (
		<>
			{/* Spacer so the fixed bar doesn't cover the end of the page/footer */}
			<div className="h-[calc(3.5rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden />
			<nav
				aria-label="Mobile navigation"
				className={`lg:hidden fixed bottom-0 inset-x-0 z-40 bg-nl-linen/95 backdrop-blur-md border-t border-nl-cacao/10 pb-[env(safe-area-inset-bottom)] will-change-transform transition-transform duration-300 ease-out motion-reduce:transition-none ${
					collapsed ? "translate-y-full" : "translate-y-0"
				}`}
			>
				<div className="grid grid-cols-5 h-14">
					<Link href={`/${locale}`} className={itemClass(isHome)}>
						<House className="h-5 w-5" strokeWidth={1.75} />
						{t("home")}
					</Link>
					<button type="button" onClick={openDrawer} className={itemClass(false)}>
						<LayoutGrid className="h-5 w-5" strokeWidth={1.75} />
						{tFooter("categories")}
					</button>
					<Link
						href={`/${locale}/reels`}
						className={itemClass(pathname.includes("/reels"))}
					>
						<Clapperboard className="h-5 w-5" strokeWidth={1.75} />
						{t("reels")}
					</Link>
					<Link
						href={`/${locale}/account/bookings`}
						className={itemClass(pathname.includes("/account/bookings"))}
					>
						<CalendarCheck className="h-5 w-5" strokeWidth={1.75} />
						{t("myBookings")}
					</Link>
					{isAuthenticated ? (
						<Link
							href={`/${locale}/account`}
							className={itemClass(pathname.includes("/account"))}
						>
							<User className="h-5 w-5" strokeWidth={1.75} />
							{t("account")}
						</Link>
					) : (
						<button
							type="button"
							onClick={() => openAuthModal("login")}
							className={itemClass(false)}
						>
							<User className="h-5 w-5" strokeWidth={1.75} />
							{t("login")}
						</button>
					)}
				</div>
			</nav>
		</>
	);
}
