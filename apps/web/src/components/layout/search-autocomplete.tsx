"use client";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useRecordSearch } from "@/hooks/use-record-search";
import {
	categoryHref,
	searchResultsHref,
	serviceHref,
	useSearchSuggest,
} from "@/lib/queries/search";
import { MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AreaSelect } from "./area-select";
import { EmptySearchState } from "./empty-search-state";
import { SearchAutocompleteResults } from "./search-autocomplete-results";

/** `/en/services`, `/ar/services` (the results page) — locale prefix is always present, but tolerate its absence. */
const SEARCH_PATH = /^\/(?:[a-z]{2}\/)?services\/?$/;

const INPUT_CLASS =
	"w-full bg-transparent border-0 outline-none text-sm text-nl-cacao placeholder:text-nl-russet/60 font-sans";

const AREA_CLASS =
	"w-[140px] lg:w-[180px] bg-transparent border-0 outline-none text-sm text-nl-cacao cursor-pointer font-sans";

/** Divider + pin + area picker: the right-hand half of the header search pill. */
function AreaField({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
	return (
		<div className="flex items-center gap-2 shrink-0 ps-3 border-s border-nl-cacao/10">
			<MapPin className="h-4 w-4 text-nl-russet shrink-0" strokeWidth={1.75} aria-hidden="true" />
			<AreaSelect value={value} onChange={onChange} className={AREA_CLASS} />
		</div>
	);
}

/**
 * Prerender stand-in for the Suspense boundary in `header.tsx`.
 *
 * `SearchAutocomplete` reads `useSearchParams()`, which opts its subtree out of
 * static rendering. The header sits in the shared layout, so without a boundary
 * that bailout would take every storefront page down with it. Rendering the same
 * input shape (just inert) keeps the header from reflowing on hydration.
 */
export function SearchAutocompleteFallback() {
	const t = useTranslations("common");
	return (
		<div className="w-full flex items-center gap-3">
			<input
				type="text"
				disabled
				placeholder={t("search")}
				className={INPUT_CLASS}
			/>
			<AreaField value="" onChange={() => {}} />
		</div>
	);
}

export function SearchAutocomplete() {
	const t = useTranslations("common");
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [query, setQuery] = useState("");
	const [area, setArea] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const debouncedQuery = useDebouncedValue(query, 200);
	// Only fetch while the panel is actually open. Previously a non-empty query
	// implied the user had focused and typed; now that the input is prefilled
	// from ?q= on the results page, an ungated call would fire a suggest request
	// on every search page load for a dropdown nobody opened.
	const { data } = useSearchSuggest(isOpen ? debouncedQuery : "");
	const recordSearch = useRecordSearch();

	// Flatten the two buckets into a keyboard-navigable list, preserving
	// visual order (categories → services).
	const flatRows = useMemo(() => {
		if (!data)
			return [] as Array<{
				kind: "category" | "service";
				href: string;
				payload: unknown;
			}>;
		return [
			...data.categories.map((c) => ({
				kind: "category" as const,
				href: categoryHref(locale, c.slug),
				payload: c,
			})),
			...data.services.map((svc) => ({
				kind: "service" as const,
				href: serviceHref(locale, svc.slug),
				payload: svc,
			})),
		];
	}, [data, locale]);

	// Reset highlight when rows change (which happens when debouncedQuery triggers a fetch).
	// biome-ignore lint/correctness/useExhaustiveDependencies: setActiveIndex has no captured deps
	useEffect(() => setActiveIndex(-1), [debouncedQuery]);

	// The header is mounted in the persistent [locale] layout, so this component
	// is never remounted by a client-side navigation — including browser Back.
	// Left to itself the input would keep whatever was last typed forever, so
	// drive it from the URL instead: mirror ?q= while on the results page (the
	// query stays editable there) and clear it on every other route.
	//
	// Deliberately keyed on the *value* of q rather than the searchParams object:
	// applying a facet on the results page rewrites the URL without touching q,
	// and that must not wipe a query the user is halfway through retyping.
	const onResultsPage = SEARCH_PATH.test(pathname ?? "");
	const urlQuery = onResultsPage ? (searchParams.get("q") ?? "") : "";
	// biome-ignore lint/correctness/useExhaustiveDependencies: `pathname` is load-bearing.
	// urlQuery is "" for every non-search route, so moving between two of them
	// leaves it unchanged — only the pathname marks that a navigation happened,
	// and without it typed-but-unsubmitted text would survive the move.
	useEffect(() => {
		setQuery(urlQuery);
	}, [pathname, urlQuery]);

	// The area is a location preference rather than a query, so it is mirrored
	// from ?area= on the results page (where the sidebar can also change it)
	// but kept as-is on every other route.
	const urlArea = onResultsPage ? (searchParams.get("area") ?? "") : null;
	useEffect(() => {
		if (urlArea !== null) setArea(urlArea);
	}, [urlArea]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const q = query.trim();
		if (!q && !area) return;
		if (q) recordSearch(q);
		router.push(searchResultsHref(locale, q, area));
		setIsOpen(false);
	}

	// Picking an area applies it straight away. On the results page it is one
	// more filter, so the others (category, price, …) are kept; anywhere else
	// it starts a search for whatever is typed, in that area.
	function handleAreaChange(slug: string) {
		setArea(slug);
		if (onResultsPage) {
			const params = new URLSearchParams(searchParams.toString());
			if (slug) params.set("area", slug);
			else params.delete("area");
			params.delete("page");
			const qs = params.toString();
			router.push(`${pathname}${qs ? `?${qs}` : ""}`);
		} else {
			router.push(searchResultsHref(locale, query.trim(), slug));
		}
		setIsOpen(false);
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		const total = flatRows.length;
		if (!total) return;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((i) => (i + 1) % total);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((i) => (i - 1 + total) % total);
		} else if (e.key === "Enter" && activeIndex >= 0) {
			e.preventDefault();
			router.push(flatRows[activeIndex].href);
			setIsOpen(false);
		}
	}

	const hasAnyResults =
		!!data &&
		data.services.length + data.categories.length > 0;

	return (
		<div className="w-full flex items-center gap-3">
			<form onSubmit={handleSubmit} className="flex-1 min-w-0">
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => setIsOpen(true)}
					onBlur={() => setTimeout(() => setIsOpen(false), 200)}
					onKeyDown={handleKeyDown}
					placeholder={t("search")}
					className={INPUT_CLASS}
				/>
			</form>
			<AreaField value={area} onChange={handleAreaChange} />
			{isOpen && (
				<div className="absolute top-full mt-2 left-0 right-0 z-50">
					{hasAnyResults && data ? (
						<SearchAutocompleteResults
							data={data}
							query={query}
							activeIndex={activeIndex}
							onSelect={() => {
								recordSearch(query);
								setIsOpen(false);
							}}
						/>
					) : debouncedQuery.trim().length < 2 ? (
						<EmptySearchState onSelect={() => setIsOpen(false)} />
					) : null}
				</div>
			)}
		</div>
	);
}
