import { config } from "@servicehubuae/config";

/** Every live upstream the gateway proxies to. Each answers `GET /health`. */
export const UPSTREAM_SERVICES = [
  "auth",
  "vendor",
  "booking",
  "catalog",
  "cms",
  "notification",
  "integration",
  "reels",
] as const;

export type UpstreamService = (typeof UPSTREAM_SERVICES)[number];

export function upstreamHealthUrl(service: UpstreamService): string {
  return `http://${config.serviceHost[service]}:${config.port[service]}/health`;
}

/**
 * Probe every upstream's root `/health` with a short timeout. A non-2xx
 * response, a timeout or a connection error all count as "down".
 */
export async function checkUpstreams(
  fetchImpl: (url: string, init?: RequestInit) => Promise<Response> = fetch,
  timeoutMs = 2000,
): Promise<Record<UpstreamService, "up" | "down">> {
  const entries = await Promise.all(
    UPSTREAM_SERVICES.map(async (service) => {
      try {
        const res = await fetchImpl(upstreamHealthUrl(service), {
          signal: AbortSignal.timeout(timeoutMs),
        });
        return [service, res.ok ? "up" : "down"] as const;
      } catch {
        return [service, "down"] as const;
      }
    }),
  );
  return Object.fromEntries(entries) as Record<UpstreamService, "up" | "down">;
}
