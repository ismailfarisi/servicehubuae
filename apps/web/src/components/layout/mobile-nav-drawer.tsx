"use client";

import type { NavTab } from "@/lib/api/navigation";
import { useAuthModalStore } from "@/stores/auth-modal";
import { useAuthStore } from "@/stores/auth";
import { VENDOR_REGISTER_URL } from "@/lib/vendor-dashboard";
import { CalendarCheck, ChevronDown, Clapperboard, LayoutGrid, Store, User, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
	open: boolean;
	onClose: () => void;
	tabs: NavTab[];
}

export function MobileNavDrawer({ open, onClose, tabs }: Props) {
	const t = useTranslations("common");
	const tFooter = useTranslations("footer");
	const locale = useLocale();
	const { isAuthenticated } = useAuthStore();
	const openAuthModal = useAuthModalStore((s) => s.open);
	const [openTabId, setOpenTabId] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [open, onClose]);

	if (!open) return null;

	const quickLinks = [
		{ href: `/${locale}/services`, label: t("services"), Icon: LayoutGrid },
		{ href: `/${locale}/reels`, label: t("reels"), Icon: Clapperboard },
		{ href: `/${locale}/account/bookings`, label: t("myBookings"), Icon: CalendarCheck },
		// Vendor dashboard is a separate app, so this is a plain cross-origin link.
		{ href: VENDOR_REGISTER_URL, label: tFooter("sell"), Icon: Store },
	];

	return (
		<dialog
			open
			aria-modal="true"
			className="fixed inset-0 z-50 m-0 w-full max-w-none h-full bg-nl-linen lg:hidden flex flex-col"
		>
			<div className="flex items-center justify-between px-4 h-14 border-b border-nl-cacao/10">
				<span className="font-display text-base font-semibold text-nl-cacao">
					{t("browse")}
				</span>
				<button
					type="button"
					aria-label="Close"
					onClick={onClose}
					className="text-nl-cacao p-3 -me-3 rounded-lg hover:bg-nl-pearl transition-colors"
				>
					<X className="h-5 w-5" strokeWidth={1.75} />
				</button>
			</div>

			<nav className="flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
				<ul className="list-none m-0 p-0">
					{tabs.map((tab) => {
						const expanded = openTabId === tab.id;
						return (
							<li key={tab.id} className="border-b border-nl-cacao/5">
								<button
									type="button"
									onClick={() => setOpenTabId(expanded ? null : tab.id)}
									aria-expanded={expanded}
									className="w-full flex items-center justify-between px-4 py-4 text-base font-medium text-nl-cacao"
								>
									<span>{tab.label}</span>
									<ChevronDown
										className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
										strokeWidth={1.75}
									/>
								</button>
								{expanded && (
									<ul className="list-none m-0 p-0 pb-3">
										{tab.subcategories.map((s) => (
											<li key={s.href}>
												<Link
													href={s.href}
													onClick={onClose}
													className="block px-7 py-3 text-sm text-nl-russet hover:text-nl-cacao hover:bg-nl-pearl transition-colors"
												>
													{s.label}
												</Link>
											</li>
										))}
										{tab.brand_list.brands.length > 0 && (
											<li className="px-7 pt-3 pb-1 text-xs font-semibold text-nl-russet">
												{tab.brand_list.title}
											</li>
										)}
										{tab.brand_list.brands.map((b) => (
											<li key={b.id}>
												<Link
													href={b.href}
													onClick={onClose}
													className="block px-7 py-3 text-sm text-nl-russet hover:text-nl-cacao hover:bg-nl-pearl transition-colors"
												>
													{b.name}
												</Link>
											</li>
										))}
									</ul>
								)}
							</li>
						);
					})}
				</ul>

				{/* Core destinations — always present, even when the CMS nav is empty */}
				<ul className="list-none m-0 p-0 mt-2 border-t border-nl-cacao/10">
					{quickLinks.map(({ href, label, Icon }) => (
						<li key={href} className="border-b border-nl-cacao/5">
							<Link
								href={href}
								onClick={onClose}
								className="flex items-center gap-3 px-4 py-3.5 text-base font-medium text-nl-cacao hover:bg-nl-pearl transition-colors"
							>
								<Icon className="h-4 w-4 text-nl-russet" strokeWidth={1.75} />
								{label}
							</Link>
						</li>
					))}
					<li>
						{isAuthenticated ? (
							<Link
								href={`/${locale}/account`}
								onClick={onClose}
								className="flex items-center gap-3 px-4 py-3.5 text-base font-medium text-nl-cacao hover:bg-nl-pearl transition-colors"
							>
								<User className="h-4 w-4 text-nl-russet" strokeWidth={1.75} />
								{t("account")}
							</Link>
						) : (
							<button
								type="button"
								onClick={() => {
									onClose();
									openAuthModal("login");
								}}
								className="w-full flex items-center gap-3 px-4 py-3.5 text-base font-medium text-nl-cacao hover:bg-nl-pearl transition-colors"
							>
								<User className="h-4 w-4 text-nl-russet" strokeWidth={1.75} />
								{t("login")}
							</button>
						)}
					</li>
				</ul>
			</nav>
		</dialog>
	);
}
