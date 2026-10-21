---
name: reference-local-dev-stack
description: "How to bring up and connect to the local dev stack (compose path, DB name, Typesense key override, ports)"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 3e3cffec-7329-418b-9c93-ebb74545b771
---

Local dev stack lives at **`backend/docker-compose.yml`** (NOT repo root). Bring up infra with: `cd backend && docker compose up -d postgres redis typesense`. Use **PowerShell** for docker (MSYS mangles `-f /d/...` paths). Docker Desktop daemon must be started first (`& "C:\Program Files\Docker\Docker\Docker Desktop.exe"`).

Two dev-env mismatches between `backend/.env` and the compose containers (the persisted volumes pre-date the compose defaults, so `.env` wins for the DB and the container key wins for Typesense):
- **Postgres:** as of 2026-07-11 the `pgdata` volume is **`mypickuae`/`mypickuae`/`mypickuae`** (matches compose defaults; the old `funkysouq` role no longer exists — that volume was re-initialized ~2026-06-25). `backend/.env` still carries stale `funkysouq` creds, so services fail `password authentication failed` with a bare `--env-file=.env`; make a copy with `DB_USERNAME/DB_PASSWORD/DB_NAME=mypickuae` and pass that (`bun --env-file` OVERRIDES shell-exported vars, so `DB_PASSWORD=x bun --env-file=.env ...` does NOT work). Connect via `docker exec backend-postgres-1 psql -U mypickuae -d mypickuae`.
- **Typesense:** container key is **`dev-typesense-key`** (compose `--api-key`), but `.env`'s `TYPESENSE_API_KEY` is a stale value. To run reindex/search locally, override non-destructively: `TYPESENSE_API_KEY=dev-typesense-key bun scripts/reindex-typesense.ts` (dotenv won't overwrite an already-set process var). The running product-service needs the same override or its Typesense calls 401.

Ports: product-service **:3002**. Reindex CLI: `backend/scripts/reindex-typesense.ts` (drops + recreates the `products` collection from the current schema, so it doubles as the Typesense schema-migration step). Seed products currently have **no `sku`** values. Related: [[project-typeorm-datasource-registration]].
