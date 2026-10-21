---
name: project_autobooked_order_stuck_ready_to_ship
description: Auto-booked (PostaPlus) vendor_orders froze at ready_to_ship because state machine barred system role on ready_to_ship→shipped
metadata: 
  node_type: memory
  type: project
  originSessionId: 123e486a-f212-4292-9430-c39608c13584
---

Auto-booked shipments froze every vendor_order at `ready_to_ship` even as the PostaPlus parcel moved through the carrier network. Found investigating prod order FKS-2026-266234 (carrier webhook/poll feed was healthy — 8 shipment_events ingested; the vendor_order just never advanced).

**Root cause:** auto-shipment.job books the shipment, moves vendor_order confirmed→processing→ready_to_ship, then calls `createShipment(auto_booked: true)`. For auto-booked shipments createShipment *deliberately skips* the `ready_to_ship→shipped` hop (`shipment-tracking.service.ts` `if (!isAutoBooked)`), leaving it to the carrier webhook, which fires `transitionVendorOrder(..., shipped, {role:"system"})`. But `order-state-machine.ts` VENDOR_ORDER_TRANSITIONS allowed `ready_to_ship→shipped` for role `"vendor"` only → threw INVALID_STATUS_TRANSITION → swallowed by processWebhookEvent's `catch {}`. Manual vendor ship (vendor role) was unaffected.

**Fix:** added `"system"` to that transition's roles. PR #335 (squash `49017cd5`, master). SHIPPED TO PROD in tag v0.1.83 (deploy success, verified live in mypickuae-order-service-1). Matches existing pattern where system already drives shipped→out_for_delivery→delivered. Forward-only webhook processing means the fix does NOT retroactively unstick already-frozen orders.

**Still open (user scoped to code-fix-only):**
- 3 prod vendor_orders remain stuck at ready_to_ship (won't self-heal): FKS-2026-266234 (×2: tracking 102601669349 in_transit, 102601669350 failed_delivery) + FKS-2026-815743 (102601666412 failed_delivery). Repair via `transitionVendorOrder` when wanted (see [[markorderpaid_status_race]] for the 815743 SSM-repair precedent).
- Prod deploy DONE: v0.1.83 (no migrations; also carried #336 PICKFALID fix + #337 admin carrier-event log). prod branch FF'd to master e30d96e9. See [[reference_prod_deploy_tag_and_migrations]].

Silent `catch {}` in the webhook handler hid this for weeks — a candidate follow-up is to at least log swallowed transition failures.
