---
name: project_admin_item_cancellation
description: Admin item-level order cancellation (OOS) feature — PR
metadata: 
  node_type: memory
  type: project
  originSessionId: 93af6368-3b57-4975-83ab-a10f3c829842
---

Admin cancels one/more items (or partial qty) from a **pre-shipment** order when a vendor is OOS: refund + payout correction + inventory release + COD carrier amend + customer email + 3 order-detail UIs. **PR #332 — MERGED to master 2026-07-15** (commit 0f1281a1; squash). NOT prod-deployed (needs v*.*.* tag for the `order_item_cancellations` migration). CI fix during merge: TS2532 in `order-email.service.test.ts` (guard `sent[0]!`). Spec+plan on `design/booking-service` under `docs/superpowers/`.

Core: `OrderItemCancellationService.cancelItems` (order-service). Endpoint `POST /admin/orders/:id/cancel-items` (admin-only; `/admin/orders` already gateway-proxied → no proxy change). New table `order_item_cancellations` (JSONB `items` snapshot; status pending/completed/failed).

**Payout correction** = adjust the per-order-item `pending` commissions (full→`cancelled`, partial→recompute pending). Payout sums only `pending` `vendor_earning`, so no PayoutService change. See [[project_order_placed_emails]].

**Non-obvious decisions/gotchas:**
- **COD over-collection fix**: partial COD cancel must AMEND the courier's collect amount, not just drop the books. `PostaPlusAdapter.amendCodAmount` → `POST /Xchanges/UpdateShipment` (FLAT body, `codAmount` in **AED major units** = `round2(fils/100)`, needs full shipper/consignee/dims). Emptied sub-order → `cancelShipment` instead. `resolveCodAmountFils` (auto-shipment.job) now subtracts `order.refund_total` for not-yet-booked shipments. All carrier calls best-effort (log to `vendor_orders.booking_error`, never roll back the refund). Consignee email must be backfilled from `order.user.email` (PostaPlus requires it; snapshots often lack it) — same as booking.
- **Refund idempotency**: cancellation row pre-persisted `pending` BEFORE the Stripe call; a retry resumes the matching pending row (reuses id → same Stripe key `refund:item_cancellation:<id>` → no double refund). Resume matches over ALL pending rows for the order by exact item-set (`find`, not `findOne`). Bookkeeping + status→completed share one tx (exactly-once).
- **State machine**: `ADMIN_BYPASS_TARGETS` (order-state-machine.ts) widened to include `partially_refunded` + `refunded` (admin-gated only) — item cancel needs confirmed/processing/ready_to_ship → partially_refunded.
- **Serialization**: customer/vendor cancellation payloads omit `admin_id`+`gateway_refund_id` and show only `completed` rows; vendor filters to its own items. Admin sees all.
- Stripe refund `reason` must be a valid enum (`requested_by_customer`), NOT free text like "out_of_stock" (RefundService forwards it verbatim to Stripe).

**Deploy**: ships a migration → prod needs a `v*.*.*` tag (migrate compose service). See [[reference_prod_deploy_tag_and_migrations]]. Frontends not in CI ([[project_ci_backend_only]]).

Deferred (non-blocking): admin qty input not floored; `--nl-amber` WCAG on account/ pages; dup audience mappers; residual double-refund window on crash AFTER finalize commit; Stripe 24h idempotency window; multi-vendor COD replicates order-level COD per shipment (pre-existing, [[project_postaplus_placeholder_host]]).
