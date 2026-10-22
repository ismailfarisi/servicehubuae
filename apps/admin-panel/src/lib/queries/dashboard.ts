import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

/** GET /admin/bookings/dashboard (booking-service). Money is in fils. */
export interface AdminBookingDashboard {
	bookings_today: number;
	bookings_30d: number;
	completed_30d: number;
	gmv_30d_fils: number;
	commission_30d_fils: number;
	active_vendors: number;
	pending_service_approvals: number;
	customers_total: number;
}

export function useAdminBookingDashboard() {
	return useQuery({
		queryKey: ["admin", "bookings", "dashboard"],
		queryFn: async () => {
			const { data } = await api.get<{ data: AdminBookingDashboard }>(
				"/admin/bookings/dashboard",
			);
			return data.data;
		},
	});
}
