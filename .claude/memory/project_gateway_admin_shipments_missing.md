---
name: project_gateway_admin_shipments_missing
description: "Gateway had no /admin/shipments proxy prefix → admin shipment status/history/events all 404'd silently"
metadata: 
  node_type: memory
  type: project
  originSessionId: 123e486a-f212-4292-9430-c39608c13584
---

The api-gateway `proxy.ts` `serviceRoutes` table had **no `/admin/shipments` prefix**, so every admin shipment sub-route 404'd through the gateway: `PATCH /admin/shipments/:id/status`, `GET /admin/shipments/:id/history`, and the new `GET /admin/shipments/:id/events` (#337). `resolveUpstream` is first-match-wins over explicit prefixes with **no catch-all** (returns null → 404). The admin order-detail page rendered empty ("No carrier events" / "No status history") because the React Query hooks got `undefined` data on the 404 — a silent failure, not an error toast.

Gotcha that caused it: `/admin/shipping-rates`, `/admin/shipping-contribution-tiers`, `/admin/shipping-providers` exist and *look* like they'd cover shipments, but `shipping` ≠ `shipments` — distinct strings, never matched. My #337 spec wrongly assumed "/admin/shipments already proxied because /history works" — it never worked through the gateway.

**Fix (PR #338, SHIPPED PROD v0.1.84):** add `{ prefix: "/admin/shipments", target: order }` to proxy.ts + a `resolveUpstream` test covering status/history/events. Verified: before = prod gateway logs showed requests arriving but image proxy.ts had 0 `admin/shipments` matches; after deploy, grep = 1 and an unauthenticated `bun fetch` to `localhost:3000/admin/shipments/:id/events` returns 401 (routed to order-service) instead of 404 (unrouted) — same as the known-good `/admin/orders/:id`.

Reinforces [[project_public_route_three_places]] and [[project_gateway_prefix_verbatim_mounting]]: a new gateway-reached route needs its prefix in proxy.ts. When adding routes under an existing service group, DON'T assume the prefix is proxied — grep proxy.ts for the exact prefix string.
