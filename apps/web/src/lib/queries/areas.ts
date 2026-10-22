import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

/**
 * A platform service area — the list `user_addresses.area_id` FKs to and that
 * the booking backend's `area` query param on
 * `GET /services/:slug/availability` expects an id from (checked against the
 * vendor's `service_areas`). Served by catalog-service from the `areas` table.
 */
export interface Area {
  id: string;
  name: string;
  slug: string;
  city: string;
  emirate: string;
  country_code: string;
  is_active: boolean;
  sort_order: number;
}

/** GET /areas — public (catalog-service), active areas only, sorted by sort_order then name. */
export function useAreas(enabled = true) {
  return useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const { data } = await api.get("/areas");
      return (data.data ?? []) as Area[];
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}
