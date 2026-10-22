import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

/** GET /vendor/booking/dashboard (booking-service). Money is in fils. */
export interface VendorBookingDashboard {
  bookings_today: number;
  upcoming_7d: number;
  completed_30d: number;
  cancelled_30d: number;
  revenue_30d_fils: number;
  commission_30d_fils: number;
  published_services: number;
  pending_review_services: number;
  rating_avg: number | null;
  rating_count: number;
}

export function useVendorBookingDashboard(opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["vendor", "booking-dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/vendor/booking/dashboard");
      return data.data as VendorBookingDashboard;
    },
    enabled: opts.enabled ?? true,
  });
}
