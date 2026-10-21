---
name: cod-surcharge-shipping-single-source-of-truth
description: "Checkout fix making Payment Methods page (COD) and Shipping Rates page (shipping) the canonical configs, both reflected in displayed total AND charged order"
metadata: 
  node_type: memory
  type: project
  originSessionId: b5035321-8ace-48fc-842f-a7701f690cc4
---

Branch `worktree-cod-surcharge-shipping-source` (12 commits, 2026-06-01) fixes two quote-vs-charge mismatches in checkout. Plan: `docs/superpowers/plans/2026-06-01-cod-surcharge-shipping-single-source.md`.

**The two bugs:** (1) COD surcharge (`payment_method_thresholds.surcharge_fils`, edited on admin Settings → Payment Methods) was shown as text only and never added to the quote total or the order. (2) Shipping was charged two ways — the quote showed the CMS `site_settings` flat fee (`shipping_flat_fee_fils`/`shipping_free_above_fils`) while order creation charged `shipping_rates.base_cost` (first vendor only). The CMS "shipping charge" the user saw was the duplicate; COD was only ever in Payment Methods.

**Decisions (user):** COD canonical = Payment Methods page; shipping canonical = Settings → Shipping Rates (`shipping_rates`); CMS shipping flat-fee retired.

**What shipped:**
- `orders.surcharge_total` column added (migration `1780300000000`); `order-creation` adds it to `grand_total` and persists it.
- Shared `quote/shipping-total.ts` → `selectedShippingFils()` (sum of cheapest available method per delivery group). Both `quote.service` and `checkout.service` use it with identical zone resolution (`user_addresses.area_id`), rates query, and vendor-holiday set, so displayed shipping == charged shipping. `delivery-groups.ts` already computed correct per-group prices; the quote had been discarding them (hardcoded `price_fils:0`) and charging the flat fee.
- `/checkout/initiate` now takes `payment_method`; `checkout.service` resolves the COD surcharge, enforces the COD `max_amount_fils` server-side (throws BadRequestError over-limit / when COD disabled), and only charges shipping when an address is present.
- Web order-summary + mobile bar display the *selected* method's surcharge (`grand_total_fils + selectedSurchargeFils`); place-order charges authoritative `order.grandTotal`.
- Migration `1780300001000` retires the two CMS shipping site_settings and seeds a platform-default `shipping_rates` row from the old flat-fee values IF none exists (preserves 15/150 AED). CMS Site Settings "Shipping" tab removed.

**Known leftovers (documented, not blockers):** two now-dead constructor params — `QuoteService.siteSettingRepo` and `CheckoutService.shippingService` (removal would churn container + 2 test harnesses). Pre-existing bug NOT fixed here: the displayed grand total doesn't subtract coupon discount (`quote.service` grand_total omits `discount_fils`) — same displayed≠charged class, worth a follow-up. DB-backed `*.integration.test.ts` (need Postgres) were not run locally — they are the CI gate. 89 checkout unit tests pass.

Related: [[project_bnpl_eligibility]], [[project_typeorm_datasource_registration]] (new entities/columns), [[feedback_ask_before_pr]].
