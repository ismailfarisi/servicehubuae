---
name: project_order_placed_emails
description: "Order-placed transactional emails (customer + vendor) — shipped, trigger timing, and the no-vendor-in-app gap"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2a400d15-3a26-4c1d-9e5b-b06a88e9fd47
---

Order-placed emails shipped in PR #307 (merged + prod-deployed as v0.1.66 on 2026-07-05). Before this, NO order email reached anyone: markOrderPaid wrote status directly (no event), the notification email dispatcher was a console.log stub, and vendors had no path.

**Architecture:**
- `notification-service/src/services/order-email.service.ts` `OrderEmailService.sendForConfirmedOrder(orderId)` renders + sends two rich transactional emails via the shared SES `EmailService`: a customer confirmation + one per vendor (to `vendor.contact_email`, each vendor only its own line items). Bypasses the per-user notification-preference gate (transactional). Best-effort per-recipient.
- Templates: pure `notification-service/src/domain/order-email-templates.ts` (branded, table-layout, inline styles, + plaintext part).
- Trigger: both prepaid and COD emit ONE master-level `order.status.changed{toStatus:confirmed}` (no vendorOrderId, so the order-event bridge doesn't re-book shipment) → existing bridge → notification-events consumer → on confirmed calls OrderEmailService. Emitted from `OrderConfirmationService.emitOrderPlaced` (new method, needs orderEventQueue injected in order-service container).
- **Timing (per user requirement):** Card(Stripe)/BNPL(Tabby,Tamara) fire from markOrderPaid AFTER capture; COD fires at placement from checkout.service.ts `createPaymentIntent` cash_on_delivery case (no webhook). So a vendor is only emailed for a committed order.
- `SesEmailDispatcher` replaced `StubEmailDispatcher` → generic notification email channel (order_shipped/delivered/payout_sent) now delivers too. `order_confirmed`'s generic email is SUPPRESSED (RICH_EMAIL_TYPES set in notification-dispatcher.service.ts) so the customer doesn't get both plain + rich.
- No schema/enum/migration. Relies on SES already configured for notification-service (same EmailService the newsletter uses). `EmailService.sendTransactional()` added to @mypickuae/utils.

**Follow-up gap:** vendors get an EMAIL but NO in-app notification for new orders — that would need a `vendor_new_order` NotificationType enum + migration + vendor-member→user resolution. Out of scope, not done. See [[project_typeorm_datasource_registration]] if adding the entity path.

**UPDATE 2026-07-12 (PR #321, prod v0.1.77):** internal "new order" ops copy — `sendForConfirmedOrder` now also sends the FULL customer order layout (distinct subject `[New Order] <num> — <cur> <total> (<method>)`) to a platform ops inbox on every order. Recipient is a **site_setting** `order_ops_notification_email` (general group, seeded BLANK by migration 1782000000000, admin-editable in the generic Settings editor — NOT an env var; user explicitly wanted it "from settings"). `OrderEmailService` reads it via a new `siteSettingRepo` (8th constructor arg, before emailService; wired in notification-service container). Blank = disabled → inert until an admin fills it in; fires even for phone-only customers; best-effort. Prod deploy runs migrations (`docker-compose --profile tools run --rm migrate`) so the seed lands automatically.

**UPDATE 2026-07-12 (PR #318, prod v0.1.75):** `sendVendorEmails` no longer sends only to `vendor.contact_email` — it now fans out to `contact_email` PLUS every active `vendor_members` row in a fulfilment role (owner/manager/staff; viewers + pending/revoked excluded), deduped case-insensitively, one best-effort send each. `OrderEmailService` gained a `vendorMemberRepo` (constructor arg inserted after `vendorRepo`, wired in notification-service container). Same PR shipped the [[project_markorderpaid_status_race]] guard fix (the actual "emails not sending" root cause — a delayed webhook race). **Team management UI:** graduated out of `NEXT_PUBLIC_TEAM_MANAGEMENT_ENABLED` (now default-on unless `="false"`, PR #319) in vendor-dashboard; admin-panel got a Team tab + `/admin/vendors/:id/members` admin routes reusing `VendorMemberService` (PR #320, admin cannot remove/transfer the owner). So vendors can build the teams that now receive these emails.
