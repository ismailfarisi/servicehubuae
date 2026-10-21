---
name: reference_worktree_db_test_invocation
description: How to run migrations + live-DB integration tests in a fresh git worktree (env not auto-loaded)
metadata: 
  node_type: memory
  type: reference
  originSessionId: 63c10b93-a0ee-4034-ab90-6b2250258529
---

A fresh git worktree has no `node_modules` and no `backend/.env` (gitignored). To make a worktree runnable: `bun install` at the worktree root, then `cp /d/ecom/backend/.env <worktree>/backend/.env` (local dev DB is `funkysouq`/`funkysouq` @127.0.0.1:5432, started via Docker Desktop + `docker compose up`).

Bun does NOT auto-load `backend/.env` when cwd is a sub-app, so pass it explicitly:
- Migrations: from `backend/`, `bun --env-file=.env libs/database/src/run-migrations.ts` (NOT `cd libs/database && bun run migrate` — that connects as the wrong role `mypickuae`).
- reels-service live-DB integration tests: from `backend/`, `REELS_LIVE_DB=1 bun test --env-file=.env apps/reels-service/tests/integration/<file>.test.ts`. Tests are gated by `REELS_LIVE_DB=1` (skip without it).

Schema truth that bit the test seed: `vendors.user_id` was DROPPED (Phase 3b) — vendor ownership is now a `vendor_members` row (role `owner`, status `active`); the `vendorMembership` JWT guard reads it. And `orders.surcharge_total` is NOT NULL with no default, so raw order inserts must set it. See [[project_cod_surcharge_shipping_source]] and [[feedback_use_worktree_for_work]].
