---
name: project-coupon-flow-fixed
description: Coupon system was doubly broken (vendor create FK 500 + redemption cosmetic-only); PR
metadata: 
  node_type: memory
  type: project
  originSessionId: 939720e7-8dc6-4b50-a31c-4edf100c49bb
---

Coupon flow architecture after PR #310 (fix/coupon-flow, 2026-07-09; prod release v0.1.69):

- **Vendor-dashboard list endpoints** (`/vendor/coupons`, `/vendor/flash-deals`) spread the page at the TOP level (`{statusCode, items, total, page, limit}`) — hooks must return the whole body, not `data.data` (bit the empty coupon list, fixed direct-to-master 4c8454eb). Detail/create/update endpoints DO wrap in `data`. Coupon list rows use field `type`, not `discount_type`.
- Prod smoke pattern that works: mint HS256 JWT inside the order-service container (`bun -e`, JWT_ACCESS_SECRET env) with `{sub, email, role, vm:[{vid, r:"owner"}]}` — vendorMembership guard reads ONLY the token's `vm` claim (no DB fallback) + X-Active-Vendor-Id header.

- **Create bug root cause**: `coupons.created_by` FKs to `users(id)`; vendor controller passed the *vendor id* → every vendor create hit fk_coupons_creator (23503) → 500. Now passes the acting `user.id`.
- **Redemption design**: the coupon lives on the **cart** (`carts.coupon_id/coupon_code/coupon_discount`, written by `CartService.setCoupon`). Quote + `initiateCheckout` + order-creation all read the cart columns; `initiateCheckout` re-validates and refuses to charge a stale snapshot (clears invalid coupons and 400s). `/checkout/apply-coupon`'s `order_id` is legacy/ignored.
- **Usage recording**: `OrderConfirmationService.recordCouponUsage(orderId)` — prepaid from `markOrderPaid`, COD from `createPaymentIntent`; `CouponService.recordUsage` is idempotent per (coupon, order). Never at order creation (abandoned orders must not burn usage).
- **Scoping**: `CouponService.validate(code, userId, lines)` takes cart lines `{product_id, vendor_id, quantity, line_total}` and computes the discount over **qualifying lines only** (coupon vendor_id filter → exclusions → product list/collection). Vendor coupon with empty product list = all that vendor's products, NOT platform-wide. free_shipping discount=0; shipping is waived per covered delivery group in both quote and initiate (must stay mirrored).
- Quote grand total previously did NOT subtract discount_fils — it does now, and exposes `totals.coupon_code` so the web chip survives reloads (checkout zustand store is memory-only).
- Gotcha (FIXED in v0.1.71): the quote ETag originally excluded the coupon, so apply/remove didn't change it and the **browser's own HTTP cache** (which sends If-None-Match independently of the client's etagCache) replayed 304s with the stale coupon state — "remove coupon not working". computeEtag now takes a `couponFingerprint` ("CODE:discount"). Client-side etagCache invalidation alone can NOT fix this class of bug; the server ETag must cover every input that changes the body ([[project_quote_etag_stale_expiry]]).
- Cart mutations in apps/web must invalidate `["checkout","quote"]` + `["checkout","available-coupons"]` (helper invalidateCartDerived in lib/queries/cart.ts) or totals go stale until quote expiry.
- v0.1.70 added `GET /checkout/available-coupons` (validates public coupons per-cart, powers tap-to-apply chips) + AED-formatted min-order message; `--nl-amber-text` (hsl(32 55% 34%), 5:1 on linen) is the AA-safe token for checkout text — plain --nl-amber (2.75:1) is decorative-only.
- Vendor-dashboard edit page must hydrate restrictions from `couponProducts`/`couponExcludedProducts` relations; reading `product_ids` (nonexistent) wiped pivots on save.
- `@mypickuae/plugins` now has `ConflictError` (409) alongside the other HttpErrors ([[project_errorhandler_httperror_only]]).
