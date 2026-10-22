# ServiceHubUAE

ServiceHubUAE is a services marketplace for the UAE. Customers browse 440 services, compare vendors, book instantly or request quotations, and pay online through MyFatoorah. Vendors manage listings, availability, bookings and quotations from the vendor dashboard and app; the platform is run from the admin dashboard.

## Repository

- `backend/` — ElysiaJS (Bun) services and shared libraries, PostgreSQL via TypeORM, Redis, BullMQ.
- `apps/web` — customer website (Next.js 14).
- `apps/vendor-dashboard` — vendor portal (Next.js 14).
- `apps/admin-panel` — admin dashboard (Next.js 14).
- `terraform/` — AWS infrastructure.

## Getting started

```bash
bun install
cp backend/.env.example backend/.env           # fill in database, Redis and provider keys
docker compose -f backend/docker-compose.yml up -d postgres redis
cd backend/libs/database && bun run migrate && bun run src/seeds/index.ts && cd ../../..
bun run dev
```

Default local logins are created by the seed (see `backend/libs/database/src/seeds/index.ts`); change them before any shared deployment.

## Development

- Lint: `cd backend && bun run lint`
- Tests: `cd backend/apps/<service> && bun test`
- API docs: `http://localhost:3000/api/docs` when the gateway is running.
