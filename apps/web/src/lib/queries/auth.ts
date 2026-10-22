import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api, clearGuestSessionToken, getGuestSessionToken, shouldProbeAuthSession } from "../api";
import { useAuthStore } from "@/stores/auth";

type QueryClient = ReturnType<typeof useQueryClient>;

async function runPostAuthEffects(
  queryClient: QueryClient,
  setUser: (user: any) => void,
  user?: any,
) {
  if (user) {
    setUser(user);
  }
  // Refetch the canonical /auth/me so the store/cache carry the full user
  // immediately after login.
  queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

  // The guest session (reel views, guest support tickets) ends at login: link
  // it to the account via auth-service, then drop the token so authenticated
  // traffic never carries the guest identity. A transient failure keeps the
  // token so the next login can retry; a 4xx (already merged / expired)
  // clears it.
  const guestToken = getGuestSessionToken();
  if (guestToken) {
    try {
      await api.post("/auth/guest/merge", { session_token: guestToken });
      clearGuestSessionToken();
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status !== undefined && status >= 400 && status < 500) {
        clearGuestSessionToken();
      }
    }
  }
  queryClient.invalidateQueries({ queryKey: ["reels"] });
}

export function useMe(enabled = true) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const logout = useAuthStore((s) => s.logout);
  // Known guests (a previous probe 401'd) skip /auth/me entirely — it can only
  // 401 again and drag a refresh-400 behind it. Anyone we haven't classified
  // yet still gets probed, so a valid refresh cookie can restore the session.
  const shouldProbe = shouldProbeAuthSession();

  useEffect(() => {
    if (enabled && !shouldProbe) logout();
  }, [enabled, shouldProbe, logout]);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.data.user);
        return data.data.user;
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 401 || status === 403) {
          // Definitive: the interceptor's refresh failed too.
          logout();
        } else {
          // Transient (network/5xx): resolve loading but keep the session
          // hint so the next load retries hydration.
          setLoading(false);
        }
        throw error;
      }
    },
    enabled: enabled && shouldProbe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post("/auth/login", credentials);
      return data.data;
    },
    onSuccess: async (data) => {
      await runPostAuthEffects(queryClient, setUser, data?.user);
    },
  });
}

export function useStartPhoneAuth() {
  return useMutation({
    mutationFn: async (phone: string) => {
      const { data } = await api.post("/auth/phone/start", { phone });
      return data.data as { phone: string };
    },
  });
}

export function useVerifyPhoneAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { phone: string; code: string }) => {
      const { data } = await api.post("/auth/phone/verify", payload);
      return data.data as {
        requires_registration?: boolean;
        phone?: string;
        registration_token?: string;
        user?: any;
      };
    },
    onSuccess: async (data) => {
      if (data.user) {
        await runPostAuthEffects(queryClient, setUser, data.user);
      }
    },
  });
}

export function useRegisterPhoneAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      phone: string;
      registration_token: string;
      first_name: string;
      last_name: string;
      email: string;
    }) => {
      const { data } = await api.post("/auth/phone/register", payload);
      return data.data as { user: any };
    },
    onSuccess: async (data) => {
      await runPostAuthEffects(queryClient, setUser, data.user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    }) => {
      const { data } = await api.post("/auth/register", payload);
      return data.data;
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Cookie-based auth: the server reads the refresh token from the cookie
      await api.post("/auth/logout", {});
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}
