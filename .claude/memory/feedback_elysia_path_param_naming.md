---
name: elysia-path-param-naming-must-match-at-same-position
description: "Elysia's router (memoirist) crashes at startup if two route files use different param names at the same path position — must check existing routes before naming a new one"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1a29c910-e96f-4d95-8b22-1a6a8d9f7d2c
---

Elysia's router (memoirist) requires **consistent parameter names** at the same path position across all mounted route groups. Two route files registering `/vendors/:vendorId/...` and `/vendors/:id/...` crash at startup with:

```
Cannot create route '/vendors/:vendorId/...' with parameter 'vendorId'
because a route already exists with a different parameter name ('id')
in the same location
```

**How to apply:** When adding a new route file at a path that branches off an existing route prefix:

1. Grep first for the existing param name:
   ```bash
   grep -rn "Elysia({ prefix: \"/<your-prefix>" backend/apps/<service>/src/routes/
   ```
2. Match the existing name. The placeholder name doesn't change the URL (`/vendors/v-1/...` works either way), so renaming the destructured value (`params.id` vs `params.vendorId`) in your handlers is the simple fix.

This is a **runtime crash, not a typecheck error** — local `bun test` passes if no two route files are mounted in the same Elysia instance at test time, so it only surfaces when the service boots in production. Add a route-conflict smoke check to integration tests if this becomes a recurring problem.

**Why:** Phase 3a's `vendor-members.routes.ts` was authored with `:vendorId` to match its handler intent ("vendor id from path"), but the existing `vendor.routes.ts` already mounted `/vendors/:id/profile`. Crash-looped vendor-service on the staging deploy (PR #149 fixed).
