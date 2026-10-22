"use client";

import { useTranslations } from "next-intl";

/** Phone-only bar pinned to the bottom: price, duration and a jump to the slot picker. */
export function MobileBookBar({
	price,
	duration,
}: { price: string; duration: string }) {
	const t = useTranslations("service.detail");
	return (
		<div className="fixed inset-x-0 bottom-0 z-40 border-t border-nl-cacao/10 bg-nl-linen/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
			<div className="mx-auto flex max-w-xl items-center justify-between gap-4">
				<div className="min-w-0">
					<p className="text-lg font-bold leading-tight text-nl-cacao">
						{price}
					</p>
					<p className="text-xs text-nl-russet">{duration}</p>
				</div>
				<a
					href="#book"
					className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-nl-amber px-6 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90"
				>
					{t("bookNow")}
				</a>
			</div>
		</div>
	);
}
