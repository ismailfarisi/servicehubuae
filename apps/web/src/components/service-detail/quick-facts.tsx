"use client";

import { areaNamesFor } from "@/components/services/service-location-line";
import type { ServiceListItem, ServiceOffering } from "@/lib/booking/types";
import { CalendarCheck, Home, ShieldCheck, Store, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const MAX_AREAS = 4;

function Fact({
	icon,
	title,
	detail,
}: { icon: ReactNode; title: string; detail?: string }) {
	return (
		<li className="flex items-start gap-3 rounded-xl border border-nl-cacao/10 bg-nl-linen p-3">
			<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nl-pearl text-nl-amber-text">
				{icon}
			</span>
			<span className="min-w-0">
				<span className="block text-sm font-semibold text-nl-cacao">
					{title}
				</span>
				{detail && (
					<span className="mt-0.5 block text-xs leading-relaxed text-nl-russet">
						{detail}
					</span>
				)}
			</span>
		</li>
	);
}

function areaList(
	names: string[],
	more: (count: number) => string,
): string | undefined {
	if (!names.length) return undefined;
	const shown = names.slice(0, MAX_AREAS).join(", ");
	return names.length > MAX_AREAS
		? `${shown} ${more(names.length - MAX_AREAS)}`
		: shown;
}

/** Where, how you pay, and what happens if plans change — the answers people scan for first. */
export function QuickFacts({
	offering,
	indexed,
}: {
	offering: ServiceOffering;
	indexed: ServiceListItem | null;
}) {
	const t = useTranslations("service.detail.facts");
	const more = (count: number) => t("moreAreas", { count });
	const premises = indexed ? areaNamesFor(indexed, "premises") : [];
	const homeVisit = indexed ? areaNamesFor(indexed, "home_visit") : [];

	const facts: ReactNode[] = [];
	if (offering.location_mode !== "at_premises") {
		facts.push(
			<Fact
				key="home"
				icon={<Home aria-hidden="true" className="h-4 w-4" />}
				title={t("homeVisit")}
				detail={areaList(homeVisit, more)}
			/>,
		);
	}
	if (offering.location_mode !== "home_visit") {
		facts.push(
			<Fact
				key="premises"
				icon={<Store aria-hidden="true" className="h-4 w-4" />}
				title={t("atPremises")}
				detail={areaList(premises, more)}
			/>,
		);
	}
	facts.push(
		<Fact
			key="pay"
			icon={<Wallet aria-hidden="true" className="h-4 w-4" />}
			title={
				offering.payment_mode === "pay_at_venue"
					? t("payAtVenue")
					: offering.payment_mode === "deposit"
						? t("deposit")
						: t("prepay")
			}
			detail={
				offering.payment_mode === "pay_at_venue"
					? t("payAtVenueDetail")
					: undefined
			}
		/>,
	);
	if (offering.cancellation_window_hours > 0) {
		facts.push(
			<Fact
				key="cancel"
				icon={<ShieldCheck aria-hidden="true" className="h-4 w-4" />}
				title={t("freeCancellation", {
					hours: offering.cancellation_window_hours,
				})}
			/>,
		);
	}
	facts.push(
		<Fact
			key="confirm"
			icon={<CalendarCheck aria-hidden="true" className="h-4 w-4" />}
			title={offering.auto_approve ? t("instantConfirm") : t("vendorConfirms")}
			detail={t("liveSlots")}
		/>,
	);
	return <ul className="grid gap-2 sm:grid-cols-2">{facts}</ul>;
}
