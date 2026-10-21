---
name: reference_ci_no_db_turbo_cache
description: CI pr-check has no Postgres; libs/database changes bust turbo cache and expose DB-dependent unit tests
metadata: 
  node_type: memory
  type: reference
  originSessionId: 63c10b93-a0ee-4034-ab90-6b2250258529
---

`.github/workflows/pr-check.yml` (the "Lint, Test & Build" PR gate) runs `bunx turbo run test` with **no Postgres service** and no remote/actions cache. So any backend unit test that calls `AppDataSource.initialize()` or uses a real entity `manager` connects to 127.0.0.1:5432 → `ECONNREFUSED` → cascading `No metadata for "X"` errors. Most DB-heavy suites are mocked or gated to skip; a few are not.

Two gotchas that bit the UGC licensing PR (#269):
1. **A change to `libs/database` busts the turbo `test` cache for EVERY dependent service** (they all import `@mypickuae/database`), forcing their tests to actually execute in CI rather than replay. That's how a shared-lib PR surfaces latent no-DB failures that a service-local PR never triggers.
2. **Not all services' `test` task propagates failure.** `cms-service`'s `HeaderNavigationService` tests genuinely need a DB and FAIL in CI (81 ECONNREFUSED) — but the job stays green, so they're pre-existing non-blocking noise. `order-service`'s `test` DOES propagate (`@mypickuae/order-service#test ... exited (1)` fails the whole gate). When triaging a red gate, find the service whose task `exited (1)`, ignore cms noise.

Practical rule: if you add code to an existing service method that newly calls `repo.manager.query/transaction`, its mock-based unit test (e.g. `payout.service.test.ts` uses a hand-rolled `mockCommissionRepo`) will break — add a `manager` mock (`query -> []`, `transaction -> cb({ getRepository: () => mockPayoutRepo, query })`) and make the `beforeEach` `mockClear` tolerant of the nested object (`m.mockClear?.()`). See [[project_ugc_licensing_slice2_architecture]] and [[project_ci_backend_only]].
