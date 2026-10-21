# Fork notes (internal, delete before handover)

Source: working tree of the NoorLuna repo on 2026-10-21 (tracked + untracked, no ignored files). History squashed to one initial commit. Every "noorluna" spelling, domain and package name was renamed to MyPickUAE (716 files); only `backend/.env` (untracked, local) still carries the old Postgres user/password because it points at the NoorLuna dev container.

## Done (2026-10-21)
- Removed product-service, order-service, bulk-jobs, the sales-channel feeds in integration-service, the reels commerce domain (product tags, attribution, creator commissions on orders), affiliates, referrals, beauty profile, order emails, 91 entities and all 123 old migrations.
- Kept: gateway, auth, vendor, booking, cms, notification, integration (outbound webhooks, mappings, pending writes, retention), reels + creators + collabs + licensing (+ creator wallet moved to `domain/wallet`).
- Fresh initial migration generated from the entities plus hand-added: notifications monthly partitions + helper functions, `no_double_book` GiST exclusion on staff_engagements, reel/user counter triggers, creator auto-graduation trigger, rules_epoch bump trigger. 92 entity tables.
- Local DB: database `mypickuae` on the NoorLuna dev Postgres container (host port 5434, user/password from `backend/.env`). Seeded admin `admin@mypickuae.com` / customer `customer@mypickuae.com` (passwords from `SEED_ADMIN_PASSWORD` / `SEED_CUSTOMER_PASSWORD` env or the seed defaults), 6 placeholder categories, VAT rates, site settings.
- Type-check: 14 backend packages and 3 apps clean (the apps have pre-existing test-only type errors from jest-dom/playwright typings). Unit tests pass. Booking integration tests: 105/122 pass; the 17 failures are the Stripe/order-service money paths that no longer exist.
- Apps: product, cart, checkout, gifts, brands, collections, affiliates, orders, returns, coupons, flash deals, bulk, sales-channel routes and components removed; navigation menus pruned; shared UI primitives moved to `apps/web/src/components/ui/maison-primitives.tsx`.

## Known leftovers (planned work, not bugs)
- booking-service still calls order-service for money (`BookingPaymentClient` → `/internal/booking-payment/*`). M2 replaces this with a payments module + MyFatoorah adapter (hosted checkout, callback + webhook, GetPaymentStatus, refunds; M5 supplier payouts). The `payments/commissions/vendor_payouts/webhook_events` tables are ready.
- integration-service inbound dispatch targets still point at order/product hosts (`DomainDispatch`); re-point to booking events in M2.
- notification templates still list order_* types; replace with booking/quotation types.
- Web/admin/vendor keep NoorLuna-era design tokens (`nl-*` Tailwind colours, serif display) and some copy (home layout sections for brands/products, beauty-quiz link in account nav). M1 rebrand replaces the design system with the blue-and-white MyPickUAE homepage.
- `terraform/` still describes the NoorLuna AWS layout under new names; rewrite for the client's account in M6.
- `apps/web/src/lib/queries/search.ts`, `recent-searches.ts` and the home `layout-renderer` brand/category sections are product-search era; replace with the 440-service search in M1.
- Vendor "Shipping Integrations" and warehouse concepts are gone; vendor settings pages may still show shipping fields.

## Next
1. M1: rebrand (tokens, homepage sections), 440-service catalogue import, service search, vendor registration flow check, staging deploy, CI.
2. M2: Quick Services booking on web + MyFatoorah.
3. Expo apps (M3), quotations + chat (M4), admin/AI Spot/reviews/Arabic (M5), hardening (M6).
