"use client";

import {
	categoryHref,
	searchResultsHref,
	serviceHref,
	type SuggestResponse,
} from "@/lib/queries/search";
import { formatPrice } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
	data: SuggestResponse;
	query: string;
	activeIndex: number;
	onSelect: () => void;
}

export function SearchAutocompleteResults({
	data,
	query,
	activeIndex,
	onSelect,
}: Props) {
	const router = useRouter();
	const locale = useLocale();

	return (
		<div className="bg-background border border-border/60 rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
			{data.categories.length > 0 && (
				<div className="p-3 border-b border-border/40">
					<p className="text-xs font-medium text-nl-russet mb-2">
						Categories
					</p>
					<div className="flex flex-wrap gap-2">
						{data.categories.map((c, i) => (
							<button
								key={c.id}
								type="button"
								className={`text-xs px-3 py-1 rounded-full border transition-colors ${
									activeIndex === i
										? "border-primary bg-primary/5"
										: "border-border/60 hover:bg-muted/60"
								}`}
								onMouseDown={() => {
									router.push(categoryHref(locale, c.slug));
									onSelect();
								}}
							>
								{c.name}
							</button>
						))}
					</div>
				</div>
			)}
			{data.services.length > 0 && (
				<div className="p-2">
					{data.services.map((s, i) => {
						const idx = data.categories.length + i;
						return (
							<button
								key={s.id}
								type="button"
								className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl text-start transition-colors ${
									idx === activeIndex ? "bg-primary/5" : "hover:bg-muted/60"
								}`}
								onMouseDown={() => {
									router.push(serviceHref(locale, s.slug));
									onSelect();
								}}
							>
								{s.media_url ? (
									<div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
										<Image
											src={s.media_url}
											alt={s.name}
											width={40}
											height={40}
											className="w-full h-full object-cover"
										/>
									</div>
								) : (
									<div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
								)}
								<div className="flex-1 min-w-0">
									<p className="truncate font-medium text-sm">{s.name}</p>
									<p className="truncate text-xs text-muted-foreground">
										{formatPrice(s.price_fils, "AED", locale)}
										{s.vendor_name ? ` · ${s.vendor_name}` : ""}
									</p>
								</div>
								<ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
							</button>
						);
					})}
				</div>
			)}
			<div className="border-t border-border/40 px-4 py-2.5">
				<button
					type="button"
					className="text-xs text-primary font-medium hover:text-primary/80 transition-colors flex items-center gap-1"
					onMouseDown={() => {
						router.push(searchResultsHref(locale, query.trim()));
						onSelect();
					}}
				>
					View all results for &ldquo;{query}&rdquo;
					<ArrowRight className="h-3 w-3" />
				</button>
			</div>
		</div>
	);
}
