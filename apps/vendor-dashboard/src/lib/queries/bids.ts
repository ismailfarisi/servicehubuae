import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export function useMyBids() {
  return useQuery({
    queryKey: ["vendor-bids"],
    queryFn: () => api.get("/vendor/bids").then((r) => r.data.data),
  });
}

export function useAvailableSections() {
  return useQuery({
    queryKey: ["vendor-bids", "available"],
    queryFn: () => api.get("/vendor/bids/available-sections").then((r) => r.data.data),
  });
}

export function usePlaceBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      section_id: string;
      bid_amount_fils: number;
      // Sponsored carousels: the featured service offering id (legacy field name).
      product_id?: string;
      content?: Record<string, unknown>;
      starts_at: string;
      expires_at: string;
    }) => api.post("/vendor/bids", data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-bids"] }),
  });
}

export function useUpdateBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; bid_amount_fils?: number; content?: Record<string, unknown> }) =>
      api.put(`/vendor/bids/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-bids"] }),
  });
}

export function useCancelBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/vendor/bids/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-bids"] }),
  });
}

// ─── Bid Preview Token ──────────────────────────────────────────────────────

export function usePreviewBidToken() {
  return useMutation({
    mutationFn: async (bidId: string) => {
      const { data } = await api.post<{
        data: { token: string; layout_slug: string; expires_at: string };
      }>(`/vendor/bids/${bidId}/preview-token`);
      return data.data;
    },
  });
}

export interface SectionContext {
  layout_slug: string | null;
  layout_title: Record<string, string> | null;
  position: number | null;
}
