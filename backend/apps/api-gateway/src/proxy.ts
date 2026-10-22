import { config } from "@servicehubuae/config";

interface ServiceRoute {
  prefix: string;
  target: string;
}

const auth = `http://${config.serviceHost.auth}:${config.port.auth}`;
const catalog = `http://${config.serviceHost.catalog}:${config.port.catalog}`;
const vendor = `http://${config.serviceHost.vendor}:${config.port.vendor}`;
const notification = `http://${config.serviceHost.notification}:${config.port.notification}`;
const cms = `http://${config.serviceHost.cms}:${config.port.cms}`;
const reels = `http://${config.serviceHost.reels}:${config.port.reels}`;
const integration = `http://${config.serviceHost.integration}:${config.port.integration}`;
const booking = `http://${config.serviceHost.booking}:${config.port.booking}`;

/**
 * Prefix → upstream table. resolveUpstream is first-match-wins, so a more
 * specific prefix must precede any broader prefix it would otherwise fall
 * under (e.g. `/vendor/reels/analytics` before `/vendor/reels`).
 */
const serviceRoutes: ServiceRoute[] = [
  // Auth service
  { prefix: "/admin/users", target: auth },
  { prefix: "/admin/auth", target: auth },
  { prefix: "/auth", target: auth },

  // Catalog service — categories, service offerings, areas, media, search
  { prefix: "/admin/categories", target: catalog },
  { prefix: "/admin/service-offerings", target: catalog },
  { prefix: "/admin/search", target: catalog },
  { prefix: "/admin/areas", target: catalog },
  { prefix: "/categories", target: catalog },
  // Public service listing/PDP. `/services/:slug/availability` is the one
  // booking-service path under this prefix — resolveUpstream special-cases it.
  { prefix: "/services", target: catalog },
  { prefix: "/vendor/services", target: catalog },
  { prefix: "/areas", target: catalog },
  { prefix: "/media", target: catalog },
  { prefix: "/me/recent-searches", target: catalog },

  // Booking service
  { prefix: "/booking", target: booking },
  { prefix: "/admin/bookings", target: booking },
  // Plural customer APIs (hold, create, detail). `"/bookings".startsWith(
  // "/booking/")` is false, so the singular prefix above never shadows it.
  { prefix: "/bookings", target: booking },
  { prefix: "/me/bookings", target: booking },
  { prefix: "/vendor/booking", target: booking },
  // Vendor walk-in/phone bookings and time blocks.
  { prefix: "/manage", target: booking },
  // Signed iCal feed — token-authenticated, see libs/guards jwt-auth's
  // isPublicRoute bypass for the same prefix.
  { prefix: "/calendar", target: booking },

  // Vendor service
  { prefix: "/admin/vendors", target: vendor },
  { prefix: "/admin/role-permissions", target: vendor },
  { prefix: "/vendor/reels-program", target: vendor },
  { prefix: "/vendor-members", target: vendor },
  { prefix: "/vendors", target: vendor },
  { prefix: "/me/follows/vendors", target: vendor },
  { prefix: "/webhooks/stripe/connect", target: vendor },

  // Integration service — vendor integrations, admin views, inbound webhooks
  { prefix: "/admin/integrations", target: integration },
  { prefix: "/vendor/integrations", target: integration },
  { prefix: "/integrations/inbound", target: integration },

  // Notification service
  { prefix: "/notifications", target: notification },
  { prefix: "/newsletter", target: notification },
  { prefix: "/webhooks/whatsapp", target: notification },

  // CMS service
  { prefix: "/admin/layouts", target: cms },
  { prefix: "/vendor-layouts", target: cms },
  { prefix: "/admin/section-types", target: cms },
  { prefix: "/section-types", target: cms },
  { prefix: "/admin/bids", target: cms },
  { prefix: "/vendor/bids", target: cms },
  { prefix: "/admin/header-navigation", target: cms },
  { prefix: "/navigation", target: cms },
  { prefix: "/layouts", target: cms },
  { prefix: "/admin/audit-log", target: cms },
  { prefix: "/pages", target: cms },
  { prefix: "/banners", target: cms },
  { prefix: "/settings", target: cms },
  { prefix: "/support", target: cms },

  // Reels service
  { prefix: "/admin/reels/analytics", target: reels }, // must precede /admin/reels
  { prefix: "/admin/reels", target: reels },
  { prefix: "/admin/creators", target: reels },
  { prefix: "/vendor/reels/analytics", target: reels }, // must precede /vendor/reels
  { prefix: "/vendor/reels", target: reels },
  { prefix: "/me/reels", target: reels },
  { prefix: "/me/creator", target: reels },
  // Public user profiles + follow graph: GET /users/:id, POST /users/:id/follow.
  { prefix: "/users", target: reels },
  { prefix: "/reels", target: reels },
];

/**
 * Resolve which upstream service handles this request path.
 */
export function resolveUpstream(path: string): { target: string; upstreamPath: string } | null {
  // Availability lives in booking-service, but the `/services` prefix routes the
  // PDP (`GET /services/:slug`) to catalog-service. Match the availability
  // suffix explicitly and first so it reaches booking-service.
  if (/^\/services\/[^/]+\/availability$/.test(path)) {
    return { target: booking, upstreamPath: path };
  }
  for (const route of serviceRoutes) {
    if (path === route.prefix || path.startsWith(`${route.prefix}/`)) {
      return {
        target: route.target,
        upstreamPath: path,
      };
    }
  }
  return null;
}

/**
 * Forward an HTTP request to the upstream service.
 */
export async function proxyRequest(
  request: Request,
  target: string,
  upstreamPath: string,
  correlationId: string,
): Promise<Response> {
  const url = new URL(request.url);
  const upstreamUrl = `${target}${upstreamPath}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set("x-correlation-id", correlationId);
  headers.set("x-forwarded-for", headers.get("x-forwarded-for") || "unknown");
  headers.set("x-forwarded-host", url.host);
  headers.set("x-forwarded-proto", url.protocol.replace(":", ""));

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    (init as any).duplex = "half";
  }

  const response = await fetch(upstreamUrl, init);
  return response;
}
