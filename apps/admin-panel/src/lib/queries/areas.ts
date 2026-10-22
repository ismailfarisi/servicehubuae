import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

/** A UAE locality customers pick on the storefront (catalog-service `areas`). */
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

export const EMIRATES = [
	"Abu Dhabi",
	"Dubai",
	"Sharjah",
	"Ajman",
	"Umm Al Quwain",
	"Ras Al Khaimah",
	"Fujairah",
] as const;

export interface AreaWritePayload {
	name?: string;
	/** Derived from `name` by the API when omitted. */
	slug?: string;
	city?: string;
	emirate?: string;
	country_code?: string;
	is_active?: boolean;
	sort_order?: number;
}

const KEY = ["admin", "areas"] as const;

/** GET /admin/areas — every area, including inactive ones. */
export function useAdminAreas() {
	return useQuery({
		queryKey: KEY,
		queryFn: async () => {
			const { data } = await api.get<{ data: Area[] }>("/admin/areas");
			return data.data ?? [];
		},
	});
}

export function useCreateArea() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (
			body: AreaWritePayload & { name: string; city: string; emirate: string },
		) => {
			const { data } = await api.post("/admin/areas", body);
			return data.data as Area;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
}

export function useUpdateArea() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, ...body }: AreaWritePayload & { id: string }) => {
			const { data } = await api.patch(`/admin/areas/${id}`, body);
			return data.data as Area;
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
}

/** Soft delete. Vendor locations and service areas keep pointing at the row. */
export function useDeleteArea() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			await api.delete(`/admin/areas/${id}`);
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
	});
}
