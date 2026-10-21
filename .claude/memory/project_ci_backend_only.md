---
name: project_ci_backend_only
description: CI lints/typechecks/tests/builds the BACKEND only — frontend apps/packages are not gated in CI
metadata: 
  node_type: memory
  type: project
  originSessionId: b3094e3f-c996-46b1-aa13-6132e6eb2d92
---

`.github/workflows/pr-check.yml` (and the deploy workflows) run Biome lint with `working-directory: backend`, and run `turbo typecheck/test/build` filtered to the backend services only (api-gateway, auth, product, order, vendor, notification, cms, integration). **`apps/*` (web, admin-panel, vendor-dashboard) and `packages/ui` are NOT linted, typechecked, tested, or built in CI.**

There is no root `bun run lint` script. The only Biome config is `backend/biome.json` (backend-scoped); running `bunx biome` on a frontend file uses Biome's *default* config, which is NOT how the frontend is actually gated.

**Why:** Don't chase Biome findings produced by running the backend linter on frontend code. E.g. `useExhaustiveDependencies` flagging an intentional `useEffect(..., [pathname])` close-on-navigate trigger is a false positive — CI never sees it, and ESLint's `exhaustive-deps` doesn't flag extra deps anyway.

**How to apply:** For frontend-only changes, the meaningful local gate is `bunx tsc --noEmit` in the app dir plus a compile/serve smoke test (`bun run dev:admin`→`:4002`, `dev:vendor`→`:4001`, `dev:web`), not `biome check`. Pre-push backend checklist (`cd backend && biome check`) is irrelevant to frontend edits. Related: [[feedback_local_lint_diagnostic_level]].
