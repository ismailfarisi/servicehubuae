---
name: project_gifting_slice1_architecture
description: How gift boxes are modeled across cart/checkout/order — the integration future gifting slices build on
metadata: 
  node_type: memory
  type: project
  originSessionId: d51015dc-e827-42a7-9412-ed129711343e
---

Gifting slice 1 (predefined multi-vendor gift boxes) shipped in PR #264 (branch feat/gifting-box-builder). Key architecture for future slices (build-your-own, subscriptions, corporate, ops, analytics):

- **Tables:** gift_occasions, gift_box_styles (packaging SKU: base_price fils, max_capacity, dimensions), gift_boxes (no stored price — computed; discount_percentage), gift_box_occasions (M:N, hard-deleted pivot, no deleted_at), gift_box_items (product+variant+qty; TWO partial unique indexes for NULL-variant safety), gift_orders (order-time snapshot, no deleted_at), cart_gift_boxes (persisted cart line w/ components jsonb snapshot). Plus products.is_gift_eligible/is_gift_only, order_items.gift_order_id.
- **Pricing is shared:** `computeGiftBoxPrice` lives in `@mypickuae/utils` (not product-service) so order-service + product-service both use it. total = itemsSubtotal − round(subtotal·discount%/100) + packaging(style.base_price).
- **Cart is DB-backed, NOT Redis-primary** (this bit the original plan): cart_items table dual-written to Redis; getCart() reads the TABLE; order-service CartService reads Product/ProductVariant (and now gift tables) directly via repos. A gift box persists as a `cart_gift_boxes` row (NOT exploded into cart_items — packaging has no vendor and cart_item.vendor_id is NOT NULL).
- **Checkout explodes the box:** checkout.service `expandGiftBoxes` turns each cart_gift_box into per-vendor order_item lines (full price → commission) + packaging into surchargeTotal + box discount into discountTotal (platform-absorbed); order-creation persists one gift_order per box and stamps order_item.gift_order_id (matched via transient __giftBoxRef, index-aligned with the commission loop). gift_order is the hook the future ops/packing slice uses to reassemble "one beautiful box".
- **Known follow-ups:** gift component order_items show product_name "Unknown" (expander doesn't hydrate names — matters for packing slips/invoices later); migration + live E2E were deferred (no local Docker at build time). See [[reference_local_dev_stack]].
- Slice scope decisions: multi-vendor boxes, contents = catalog + gift-only SKUs, predefined-only (no builder yet), full buy-through, computed pricing, admin CRUD, gift-message-only personalization.

## Slice 2 — Fulfillment (hub-assemble), PR #265 (branch feat/gift-fulfillment)
Vendors ship gift-box items to a central MyPickUAE hub; ops receive each parcel, assemble one box, dispatch a single outbound shipment to the customer. Vendor payout gated on hub receipt.
- gift_order gained a fulfillment lifecycle: `fulfillment_status` (enum GiftFulfillmentStatus: awaiting_items→partially_received→ready_to_assemble→[assembling]→packed→shipped→delivered, +cancelled/exception; `assembling` is intentionally skipped — ready_to_assemble→packed direct), `hub_warehouse_id` (→ default platform warehouse: vendor_id NULL+is_default), assembled/dispatched/delivered_at, outbound_carrier/tracking_number/tracking_url, assembly_notes. The OUTBOUND hub→customer shipment lives on gift_order fields (NO new shipment row — shipment.vendor_order_id stayed NOT NULL, avoided that risky change).
- vendor_order gained `gift_order_id` + `received_at_hub_at`. New `gift_order_status_history` audit table.
- **Checkout split refinement:** gift items now group into their OWN per-(vendor, giftBoxRef) vendor_orders (helper `groupItemsForVendorOrders`) that ship to the hub; normal items stay customer-bound. Gift-item commissions created `held` (new CommissionStatus.held), released → `pending` on hub receipt (payout query keys on status=pending). Hold+release both keyed by vendor_order_id (safe because gift buckets are pure).
- Ship-to: `resolveShipTo` (order-service/domain/gift-fulfillment) returns the hub address for gift vendor_orders; wired into auto-shipment.job booking + vendor-order API `ship_to` field + vendor-dashboard badge.
- `GiftFulfillmentService` (receive/assemble/dispatch/deliver/cancel) + gift-order-state-machine; admin `/admin/gift-fulfillment/*` + admin-panel "Gift Fulfillment" hub console (receiving checklist, dispatch form, packing slip). Default hub seeded idempotently in libs/database/src/seeds.
- Deferred: migration run + live E2E (no Docker at build time); integrated outbound carrier booking, recipient address/scheduling, customer tracking page, multi-hub routing.
