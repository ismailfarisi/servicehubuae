---
name: reference_bun_test_live_db_pooling
description: Live-DB tests via bun test are flaky (pg connection terminated / bun crash); use mocked-repo unit tests instead
metadata: 
  node_type: memory
  type: reference
  originSessionId: 83b8385f-f548-4e11-a34d-ef57da49ffb9
---

Backend unit tests must NOT drive a live Postgres through the shared `AppDataSource` under `bun test`. Doing several sequential TypeORM repo ops across `it` blocks (or even within one `it`) makes a pooled pg connection go stale and get handed out dead → `QueryFailedError: Connection terminated`, and bun can hard-crash (SIGSEGV-style crash report). Reproduced on the booking-service LocationService test; the identical sequence runs perfectly in a one-shot `bun --env-file=.env -e '...'` script (get()→NotFoundError in 3ms), so it's a bun-test-runner + pg-pool artifact, not a code bug.

**How to test instead** (matches the repo — there are NO existing live-DB bun tests; product-service uses this):
- **Mocked-repo unit tests**: constructor-inject `Repository<X>` into the service, pass fake `{create,save,find,findOne,softRemove}` objects cast `as unknown as Repository<X>`, assert the service's own logic (scoping, defaults, the where-clause it hands the repo, `NotFoundError`). CI-safe (CI has no DB anyway — [[reference_ci_no_db_turbo_cache]]).
- **Live DB behaviour** (partial unique indexes, GiST EXCLUDE, real CRUD): verify with a one-shot `bun -e` script or an HTTP endpoint smoke (start the service, curl), NOT a committed bun test.

**New gotcha (2026-07-13, booking Phase 6):** in the live suites that DO exist now (BOOKING_LIVE_DB=1-gated), `expect(promise).rejects.toBeInstanceOf(...)` on a query that throws Postgres `23P01` (exclusion violation) HANGS under bun test's shared pg pool — the identical op is fine via `bun run`. Use explicit try/catch + assert on the caught error instead (same family as the known `expect().resolves` hang).

**How to apply:** for booking-service and any new backend service, write mocked-repo `*.service.test.ts` (see `apps/booking-service/src/domain/location/location.service.test.ts` and `apps/product-service/src/domain/service-offering/service-offering.service.test.ts`). The DB-constraint-critical checks (e.g. the `no_double_book` EXCLUDE) get a live `bun -e` verification run, reported in the commit — don't rely on a bun-test integration test that will flake/crash. Local DB access needs the postgres container port published + [[reference_worktree_db_test_invocation]] env.
