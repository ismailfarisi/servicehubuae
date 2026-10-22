import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../api";

export interface SuggestService {
	id: string;
	slug: string;
	name: string;
	media_url: string | null;
	price_fils: number;
	vendor_name: string;
}

export interface SuggestCategory {
	id: string;
	name: string;
	slug: string;
}

/** GET /services/suggest `data` (catalog-service). */
export interface SuggestResponse {
	services: SuggestService[];
	categories: SuggestCategory[];
}

export { categoryHref, searchResultsHref, serviceHref } from "../links";

export function useSearchSuggest(q: string) {
	return useQuery({
		queryKey: ["search-suggest", q],
		queryFn: async () => {
			const { data } = await api.get("/services/suggest", {
				params: { q, limit: 5 },
			});
			const body = (data.data ?? {}) as Partial<SuggestResponse>;
			return {
				services: body.services ?? [],
				categories: body.categories ?? [],
			} satisfies SuggestResponse;
		},
		enabled: q.trim().length >= 2,
		staleTime: 30_000,
		gcTime: 5 * 60_000,
		placeholderData: keepPreviousData,
	});
}
