---
name: project-markorderpaid-status-race
description: "markOrderPaid silently no-ops if order left pending_payment before the Stripe webhook — payment_status stays pending, reservations expire, emails skipped"
metadata: 
  node_type: memory
  type: project
  originSessionId: 8fc8afd5-da19-497d-9291-968971e4c898
---

Prod incident 2026-07-11 (order FKS-2026-815743): a manual shipment flipped the master order `pending_payment` → `processing` (vendor-order aggregation) ~1 min before Stripe's `payment_intent.succeeded` webhook arrived. The webhook processed fine — `payments` row set to captured, webhook_events row `processed` — but `markOrderPaid` (order-confirmation.service.ts) guards on `status === "pending_payment"` and silently returned `{confirmed:false}`, skipping the entire confirmation bundle: orders.payment_status stayed `pending`, the inventory reservation expired (stock released while shipping → oversell), no customer/vendor confirmation emails, no commissions/channel publishes, cart not cleared.

**Why:** the guard conflates "order not payable" with "order already progressed past confirmation".

**How to apply:** any fulfilment/admin status change during the payment window can reproduce this. Data repair = set orders.payment_status='captured' via SSM psql (done for this order; reservation/emails left as-is). See [[reference_prod_rds_ssm_debug]] for the query mechanics.

**CODE FIX SHIPPED (PR #318, merged, prod v0.1.75 on 2026-07-12):** split the guard — markOrderPaid now no-ops only when `payment_status === "captured"` (idempotency on the capture, not on order status); otherwise it records the capture and fires ALL side-effects (cart clear, reservation commit, commission/channel publish, auto-shipment, `emitOrderPlaced`) exactly once, keeping any more-advanced status instead of regressing to `confirmed`. This is what restores the order-placed emails. Diagnosed 2026-07-12 from a fresh prod report ("emails not sending"): SES transport verified healthy (live send from notification-service container returned a MessageId); COD path was fine (COD calls emitOrderPlaced unconditionally at placement); only the prepaid/webhook race dropped emails. Related: [[project_order_placed_emails]].
