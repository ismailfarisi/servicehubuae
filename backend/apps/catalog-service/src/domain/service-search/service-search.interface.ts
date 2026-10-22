import type { ServiceOfferingDocument } from "./service-offering.collection.ts";

export type ServiceSortOption = "price_asc" | "price_desc" | "rating" | "newest";

export interface ServiceFilters {
  query?: string;
  /** area SLUG (areas.slug), not id — matches `category` and keeps URLs readable. */
  area?: string;
  category?: string;
  /** `either` is never accepted here; see the widening rule in the adapter. */
  visit?: "at_premises" | "home_visit";
  /** fils */
  minPrice?: number;
  /** fils */
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  paymentMode?: "prepay" | "deposit" | "pay_at_venue";
  sortBy?: ServiceSortOption;
  page?: number;
  limit?: number;
}

export interface FacetCount {
  value: string;
  count: number;
}

export interface ServiceSearchFacets {
  areas: FacetCount[];
  categories: FacetCount[];
  visitTypes: FacetCount[];
  paymentModes: FacetCount[];
  vendors: FacetCount[];
}

export interface ServiceSearchResult {
  data: ServiceOfferingDocument[];
  total: number;
  page: number;
  limit: number;
  facets: ServiceSearchFacets;
}

export interface ServiceSuggestion {
  id: string;
  slug: string;
  name: string;
  media_url: string | null;
  price_fils: number;
  vendor_name: string;
}

export interface CategorySuggestion {
  id: string;
  name: string;
  slug: string;
}

export interface SuggestResult {
  services: ServiceSuggestion[];
  categories: CategorySuggestion[];
}
