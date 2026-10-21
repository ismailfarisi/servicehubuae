---
name: project_optional_auth_not_public
description: "A route needing logged-in attribution but tolerating guests must be in isOptionalAuthRoute ONLY, never also isPublicRoute"
metadata: 
  node_type: memory
  type: project
  originSessionId: 2f653cfe-2faa-41a4-b333-bc7dae7fa65b
---

In `backend/libs/guards/src/jwt-auth.ts`, the jwtAuth derive checks `isPublicRoute` **first** and, when matched, returns `user: null` **without extracting or verifying the token at all**. So a route that should populate `user` when a token is present (e.g. to stamp `user_id`) but still allow anonymous callers must be registered in `isOptionalAuthRoute` **only** — NOT in `isPublicRoute`. Listing it as public silently makes `user` always null and breaks logged-in attribution, while still "working" for guests.

Optional-auth semantics (no 401 for guests, `user` populated for token-holders) come entirely from `isOptionalAuthRoute`; `isPublicRoute` means "auth middleware is skipped, user is always null."

**Why:** bit the newsletter subscribe endpoint (#249) — it was listed in both, so logged-in `user_id` stamping never fired until review caught it.

**How to apply:** truly anonymous endpoints (token unsubscribe links, webhooks) → `isPublicRoute`. Endpoints that want optional logged-in context → `isOptionalAuthRoute` only. Complements [[project_public_route_three_places]] (the 3-places rule for fully public routes).
