---
name: project-gateway-prefix-verbatim-mounting
description: api-gateway proxies prefixes verbatim — a service route nested under another Elysia prefix 404s silently; test mounting by importing the real app with container mocked
metadata: 
  node_type: memory
  type: project
  originSessionId: e80c79cd-10c8-413b-9332-e2e5484a9a32
---

The api-gateway (`backend/apps/api-gateway/src/proxy.ts`) forwards paths **verbatim** (`upstreamPath: path`), so every prefix it maps must exist at the target service's **root**. A route group declared inside an Elysia instance that already has a prefix (e.g. `.group("/vendor/warehouses", ...)` inside `new Elysia({ prefix: "/shipping" })`) really lives at `/shipping/vendor/warehouses` and the gateway-forwarded path 404s silently — this broke `GET /vendor/warehouses` from PR #279 until fix branch `fix/vendor-warehouse-list` (empty warehouse dropdown + all inventory rows "Unassigned" in vendor-dashboard).

**Why:** mock-app integration tests re-declare routes, so they can never catch a mount-path mismatch; only the composed real app shows it.

**How to apply:** new gateway-proxied prefixes get their own root-level `new Elysia({ prefix: "..." })` instance (pattern: `vendorShippingIntegrationsRoutes`). Regression-test mounting by `mock.module("../container.ts", () => ({ container: new Elysia() }))` then importing the real `app.ts` and asserting the path returns 401 (mounted, guard rejects) not 404 — see `order-service/src/routes/route-mounting.test.ts`. Works in CI (no DB needed; config only enforces env in production). Related: [[project-public-route-three-places]].

Also from this fix: `GET /vendor/warehouses` now returns owned **plus** `fulfillment_origin`-granted warehouses (`ShippingService.listVendorWarehouses`) because inventory restock/adjust accept granted platform/shared warehouses (`vendorCanUseWarehouse`), and the dropdown must offer the same set.
