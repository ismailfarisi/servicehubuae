---
name: project-public-route-three-places
description: "A public (unauthenticated) storefront API route must be registered in THREE places, not just the service + gateway proxy"
metadata: 
  node_type: memory
  type: project
  originSessionId: 3e3cffec-7329-418b-9c93-ebb74545b771
---

To make a backend route reachable **publicly** (no JWT) through the gateway, you must touch **three** places — missing the third silently 401s:

1. The **service** route file (e.g. `product-service/src/routes/collection.routes.ts`) — defines the handler.
2. The **gateway proxy** routing — `backend/apps/api-gateway/src/proxy.ts` `serviceRoutes` array maps the path prefix → upstream service (so the gateway knows where to forward).
3. The **gateway auth allowlist** — `backend/libs/guards/src/jwt-auth.ts` `isPublicRoute(path, method)`. The gateway applies `jwtAuth` globally (`app.ts`), so any path not matched by `isPublicRoute` gets a 401 **before** proxying. Admin/auth'd routes (`/admin/*`) intentionally are NOT here.

The collections feature (PRs #215/#216) added #1 and #2 for the public storefront `GET /collections/:slug` but missed #3 → it returned 401 on staging while `/admin/collections` (auth-gated) worked. Fix pattern (read-only public catalog route):
```ts
// in isPublicRoute, with `const isRead = method === "GET" || method === "HEAD";`
if (isRead && (path === "/collections" || path.startsWith("/collections/"))) return true;
```
`/admin/collections` is unaffected (starts with `/admin/`, not `/collections/`). Add a guards.test.ts case. Related: [[project-typeorm-datasource-registration]] (same "explicit registry, easy to miss one" class of bug).
