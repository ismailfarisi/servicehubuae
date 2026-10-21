---
name: project_elysia_guard_wiring
description: "vendorMembership (or any user-reading guard) 401s EVERY caller unless .use(jwtAuth) is chained in the SAME Elysia instance — scoped derives don't cross plugin encapsulation; mocked tests can't catch it"
metadata: 
  node_type: memory
  type: project
  originSessionId: 55c1568a-9fde-41a7-9bee-9594617639db
---

Any Elysia route plugin that uses `vendorMembership(...)` (or any guard reading `context.user`) MUST also `.use(jwtAuth)` in the **same instance chain** — app-level `jwtAuth` does NOT propagate into nested route plugins (scoped derives don't cross plugin encapsulation), so `context.user` stays undefined and the guard returns 401 "Authentication required" for every caller, valid JWT or not.

**Why:** Bit the entire booking vendor surface (Phases 2–7): /vendor/booking/*, /vendor/services, /vendor/product-groups all 401'd for ANY caller — latent for five phases because mocked-repo tests inject user directly and no live HTTP call ever used a vendor JWT until the Phase 7 dashboard checkpoint. Diagnostic signature: 401 body says "Authentication required" (vendorMembership's message = user never derived) instead of "Unauthorized — invalid or missing access token" (jwt-auth's own message).

**How to apply:** copy the order-service coupon-routes pattern (`.use(jwtAuth)` then `.use(vendorMembership(...))` in-instance). Regression net exists since ea2fab92/feef2e7c: DB-free composed-app auth-wiring tests with a signed vm-claim JWT asserting non-401 (booking-service + product-service `*.auth-wiring.test.ts`) — extend them when adding new guarded route files. Related: [[project_gateway_prefix_verbatim_mounting]], [[project_public_route_three_places]].
