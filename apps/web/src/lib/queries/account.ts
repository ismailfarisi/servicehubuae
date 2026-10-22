import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

// Map backend address entity to frontend shape
function mapAddress(addr: any) {
  return {
    ...addr,
    full_name: addr.full_name || `${addr.first_name || ""} ${addr.last_name || ""}`.trim(),
    street: addr.street || addr.address_line_1,
    area: addr.area || addr.address_line_2 || "",
    building_name: addr.building_name || "",
    apartment: addr.apartment || "",
    floor: addr.floor || "",
    emirate: addr.emirate || addr.state || "",
  };
}

// Addresses
export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me/addresses");
      return (data.data || []).map(mapAddress);
    },
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (address: object) => {
      const { data } = await api.post("/auth/me/addresses", address);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...address }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.patch(`/auth/me/addresses/${id}`, address);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/auth/me/addresses/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

// Verified phones (OTP gate for saving an address phone number)
export function useVerifiedPhones() {
  return useQuery<{ phone: string; verified_at: string }[]>({
    queryKey: ["account", "verified-phones"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me/verified-phones");
      return data.data;
    },
  });
}

export function useStartPhoneVerification() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const { data } = await api.post("/auth/me/verified-phones/start", { phone });
      return data.data as { phone: string; retry_after_seconds: number };
    },
  });
}

export function useConfirmPhoneVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      const { data } = await api.post("/auth/me/verified-phones/confirm", { phone, code });
      return data.data as { phone: string; verified_at: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account", "verified-phones"] });
    },
  });
}

// Wallet
export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me/wallet");
      return data.data;
    },
  });
}

export function useWalletTransactions(params?: { page?: number }) {
  return useQuery({
    queryKey: ["wallet-transactions", params],
    queryFn: async () => {
      const { data } = await api.get("/auth/me/wallet/transactions", { params });
      return data.data;
    },
  });
}

// Creator application
export interface CreatorApplication {
  id: string;
  status: "pending" | "needs_info" | "approved" | "rejected";
  review_notes: string | null;
}

export function useMyCreatorApplication() {
  return useQuery({
    queryKey: ["creator-application"],
    queryFn: async () => {
      const { data } = await api.get("/me/creator/application");
      return (data.data ?? null) as CreatorApplication | null;
    },
  });
}

export function useApplyForCreator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      display_name: string;
      bio: string;
      primary_category: string;
      social_links: Record<string, string>;
      follower_estimate?: number;
      sample_urls?: string[];
      motivation?: string;
      agreed_to_terms: boolean;
    }) => {
      const { data } = await api.post("/me/creator/apply", payload);
      return data.data as CreatorApplication;
    },
    onSuccess: (application) =>
      queryClient.setQueryData(["creator-application"], application),
  });
}

// Settings
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: object) => {
      const { data } = await api.patch("/auth/me", profile);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: {
      current_password: string;
      new_password: string;
    }) => {
      const { data } = await api.post("/auth/change-password", payload);
      return data.data;
    },
  });
}
