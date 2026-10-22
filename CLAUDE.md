# ServiceHubUAE

Services marketplace for the UAE: customers browse a catalogue of 440 services, compare up to 3 of 10 eligible vendors, book a time slot (Quick Services) or request quotations from 3 vendors with chat (Quotation Services). Vendors run their listings, availability, bookings and quotations; an admin dashboard runs the platform. Payments go through MyFatoorah; vendors are paid out minus the platform commission.

## Stack

- **Runtime:** Bun 1.4 (package manager and runtime), Turborepo monorepo, TypeScript strict.
- **Backend:** ElysiaJS services with a NestJS-style structure (modules, DI in `container.ts`, lifecycle hooks). PostgreSQL 16 + PostGIS via TypeORM (migrations), Redis, BullMQ, Typesense for search.
- **Web:** Next.js 16 (React 19, Turbopack) App Router apps: `apps/web` (customer site), `apps/vendor-dashboard`, `apps/admin-panel`.
- **Mobile:** Expo React Native customer and vendor apps (to be added under `apps/`).
- **Payments:** MyFatoorah (hosted checkout, webhooks, refunds, supplier payouts). The `payments`, `commissions`, `vendor_payouts` and `webhook_events` tables are the ledger.
- **Cloud:** client's AWS (ECS, RDS, S3 + CloudFront, SES), Terraform in `terraform/`.
- **Lint/test:** Biome, `bun test`.

## Layout

```
backend/apps/
  api-gateway         proxy + rate limit + Swagger at /api/docs
  auth-service        JWT (15m access / 7d refresh), phone OTP, OAuth, 2FA
  vendor-service      vendor onboarding, licence documents, members, locations, bank accounts
  catalog-service     categories, service offerings (public, vendor CRUD, admin approval), areas, service search (Typesense), media presign, recent searches
  booking-service     staff/capacity, availability, holds, bookings, payments gateway, commissions, dashboards, reviews, reminders
  cms-service         pages, banners, layouts, header navigation, settings, support tickets
  notification-service  email (SES), push (FCM), WhatsApp, in-app; BullMQ dispatch
  integration-service vendor integrations: signed outbound webhooks, mappings, retention
  reels-service       short video reels, creators, collabs, licensing, moderation, analytics
backend/libs/         config, database (entities + migrations + seeds), dto, guards, plugins, utils, integration-events, integration-mapper
apps/                 web, vendor-dashboard, admin-panel
```

## Commands

```bash
bun install
docker compose -f backend/docker-compose.yml up postgres redis   # or point backend/.env at a running Postgres
cd backend/libs/database && bun run migrate && bun run src/seeds/index.ts
bun run dev:local                            # one command: docker infra + migrate + seed + search index + all services + apps
bun run prod:local                           # same, but production builds of the apps (fast pages, low memory, no hot reload)
bun run dev                                  # all services + apps (turbo), infra already running
cd backend && bunx --bun @biomejs/biome@1.9.4 check .   # lint before push
cd backend/apps/<service> && bun test        # unit tests; integration tests need BOOKING_LIVE_DB=1 and a live DB
```

## Rules

- Entities in `backend/libs/database/src/entities` are the schema source of truth; every schema change ships with a migration in the same PR.
- Money is stored in fils (integers). Never store card data; MyFatoorah holds it.
- Double booking is prevented by the `no_double_book` exclusion constraint on `staff_engagements`; keep `slot_range` a generated column.
- Booking creation, payment confirmation and webhook handling must stay idempotent.
- Seed data, copy, emails and test fixtures are ServiceHubUAE-branded; do not introduce other brand names.
