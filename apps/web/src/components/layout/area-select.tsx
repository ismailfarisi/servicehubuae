"use client";

import { UAE_EMIRATES } from "@/lib/emirates";
import { type Area, useAreas } from "@/lib/queries/areas";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

/** Areas grouped by emirate, emirates in canonical order, areas in sort order. */
function groupByEmirate(areas: Area[]): Array<{ emirate: string; areas: Area[] }> {
	const groups = new Map<string, Area[]>();
	for (const a of areas) {
		const key = a.emirate || "Other";
		groups.set(key, [...(groups.get(key) ?? []), a]);
	}
	const order: string[] = UAE_EMIRATES.map((e) => e.value);
	const rank = (e: string) => {
		const i = order.indexOf(e);
		return i < 0 ? order.length : i;
	};
	return [...groups.entries()]
		.sort(([a], [b]) => rank(a) - rank(b))
		.map(([emirate, list]) => ({
			emirate,
			areas: [...list].sort((x, y) => x.sort_order - y.sort_order),
		}));
}

interface Props {
	/** Area slug, "" for all areas — the `area` param of the services listing. */
	value: string;
	onChange: (slug: string) => void;
	className?: string;
}

/** Area picker for the header search; options are grouped by emirate. */
export function AreaSelect({ value, onChange, className }: Props) {
	const t = useTranslations("home");
	const tEmirates = useTranslations("emirates");
	const { data: areas } = useAreas();
	const groups = useMemo(() => groupByEmirate(areas ?? []), [areas]);

	const emirateLabel = (emirate: string) => {
		const key = UAE_EMIRATES.find((e) => e.value === emirate)?.labelKey;
		return key ? tEmirates(key) : emirate;
	};

	return (
		<select
			aria-label={t("areaLabel")}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className={className}
		>
			<option value="">{t("allAreas")}</option>
			{groups.map((g) => (
				<optgroup key={g.emirate} label={emirateLabel(g.emirate)}>
					{g.areas.map((a) => (
						<option key={a.slug} value={a.slug}>
							{a.name}
						</option>
					))}
				</optgroup>
			))}
		</select>
	);
}
