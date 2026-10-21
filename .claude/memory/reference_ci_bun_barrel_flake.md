---
name: reference_ci_bun_barrel_flake
description: "CI test flakes (\"Export named X not found\" / mock.module 500s) from bun + big TypeORM barrel; fix = pin bun 1.3.13 + unit-only + preload + per-file"
metadata: 
  node_type: memory
  type: reference
  originSessionId: addb1d4a-3bad-498f-a03c-f19dbb154e38
---

Running the backend test suite in CI (the `turbo run test` gate in pr-check.yml + deploy-prod.yml) is fragile and was masked for a long time by turbo cache — any shared-lib change (`libs/database` migration/entities, `libs/guards`) busts dependents' caches, forces their tests to actually RUN in the DB-less CI job, and exposes several stacked, pre-existing problems. Hit hard while trying to prod-deploy the Slack relay ([[project_slack_support_relay_pr340]]); fixed in **PR #341** (merged to master 2026-07-16, shipped v0.1.86).

Root causes + fixes (all needed together):
1. **No Postgres/Redis in CI** but integration tests (`*.integration.test.ts`, `tests/integration/**`) sit in the same `bun test` glob → `ECONNREFUSED :5432/:6379`. Fix: `backend/scripts/test-ci.sh` runs UNIT tests only (git ls-files with `:!*.integration.test.ts :!tests/integration/*`), replacing `turbo run test` in both workflows. (Integration tests still need a future live-stack CI step — see [[reference_ci_no_db_turbo_cache]].)
2. **bun 1.3.14 regressed source-barrel resolution** — CI used `bun-version: latest` (1.3.14); it throws `Export named 'FlashDeal'/... not found in libs/database/src/index.ts`. Dev/local is 1.3.13 (fine). Fix: pin `bun-version: 1.3.13` in setup-bun in BOTH workflows.
3. **guards barrel<->impl cycle** — jwt-auth.ts/token-helpers.ts/bulk-job-access.ts did `import type {AuthUser,UserRole} from "./index.ts"` (the barrel that re-exports them) → "Export named 'jwtAuth' not found" on Linux. Fix: extract shared types to leaf `libs/guards/src/types.ts`; barrel + impl both import from there; index.ts must ALSO `import type` them locally (a bare re-export leaves `requireRole` unbound → TS2304).
4. **libs/database barrel (100+ interlinked TypeORM entities) partial-evaluates non-deterministically** even one file at a time — a test file's own imports interleave with the barrel eval → "Export named X not found", flapping between runs. Fix: `--preload backend/scripts/test-preload.ts` (imports `@mypickuae/database` + `@mypickuae/guards`) so the barrels fully evaluate ALONE before any test file's imports.
5. **mock.module("../container.ts") route tests lose interception** when a sibling file loads the container first in a shared process → real controller runs → 500 (e.g. order `cancel-items`). Two-part fix: use the RELATIVE `"../container.ts"` specifier (NOT an absolute `import.meta.dir` path — that misses on Linux), AND run **each test file in its own bun process** (test-ci.sh loops per-file) so every mock gets a fresh registry.

Net runner: `test-ci.sh` = per-app → per-FILE → `bun test --preload <preload> <file>`, unit-only. Deterministic; ~5min in CI (per-file is slower — watch the 8-min job timeout). Windows-local per-file is ~2× slower (bun startup penalty), not representative. Also: single-file bun test passes locally even when the whole-suite CI run flakes — don't trust a green single-file local run as proof.
