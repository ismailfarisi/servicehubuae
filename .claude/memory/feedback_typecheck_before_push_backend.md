---
name: feedback_typecheck_before_push_backend
description: "Run `bun run typecheck` before pushing backend changes — CI gates it, biome+bun test don't catch TS errors"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7d7dc960-443b-4fe0-8776-f087ba12bce1
---

Before pushing backend changes, run the affected app's `bun run typecheck`
(e.g. `cd backend/apps/product-service && bun run typecheck`) in addition to
biome + bun test. NOTE: there is NO `typecheck` script in `backend/`'s own
package.json — the per-package script (`tsc --noEmit`) lives in each app/lib,
and the whole-monorepo CI gate is `bunx turbo run typecheck` from the REPO ROOT.

**Known PRE-EXISTING baseline typecheck errors (on master, ignore as noise):**
`libs/database/src/entities/entities.test.ts` (2: TS18048, TS2769),
`libs/guards/src/vendor-membership.test.ts` (~3 Elysia TS2345). `apps/web`
`bunx tsc --noEmit` emits ~30 errors, ALL in test/spec files (jest-dom /
playwright / bun:test not typed) — SOURCE is clean. Frontend "clean" check:
`bunx tsc --noEmit 2>&1 | grep -E "error TS" | grep -vE "\.test\.|\.spec\.|__tests__|tests/e2e"` must be empty.

**Why:** CI's "Lint, Test & Build" runs typecheck and fails the whole job on
TS errors. `bun test` + `biome check` pass right through type errors, so a
green local run is NOT enough. Bit PR #329: typing a destructured
`manager.query` result as an array tripped TS2532 (`noUncheckedIndexedAccess`)
on `rows[0].id` — invisible to test/biome, caught only by CI.

**How to apply:** treat typecheck as part of the pre-push checklist for backend
work. Caveat: a fresh worktree's `bun install` can resolve mixed typeorm
versions (0.3.28 vs 0.3.31), producing spurious `EntityManager` TS2739 noise —
tell real errors from that noise by whether they cite files you actually
touched (and cross-check against what CI reported). Related:
[[reference_typeorm_update_returning_tuple]], [[reference_ci_no_db_turbo_cache]].

**Worktree gotcha (bit again PR #337):** a worktree where you only ran
`cd backend && bun install` leaves order-service `tsc` spewing bun-global DOM
noise (`Property 'ok'/'json' does not exist on type 'Response'`, `Buffer not
assignable to ArrayBufferView`) across many files — tsc exits 2 and drowns your
real error. Fix by running `bun install` at the WORKTREE ROOT (root workspace
covers apps + backend), after which order-service `tsc --noEmit` runs clean and
surfaces genuine errors. A test fixture typed as an object literal that must
equal a `Promise<Entity[]>` result trips TS2769 "No overload matches" (missing
entity fields) — type the fixture `any[]`, matching the repo mocks'
`Promise<any>` style. Do NOT trust `bun test`+biome as a typecheck proxy.
