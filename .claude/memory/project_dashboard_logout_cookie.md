---
name: project_dashboard_logout_cookie
description: "Why dashboard logout silently re-authenticated, and how admin/vendor sessions stay isolated"
metadata: 
  node_type: memory
  type: project
  originSessionId: 1001a43d-62b0-4a87-aa09-cd9692d9a299
---

Admin & vendor dashboard logout left users logged in. `clearAuthSession()` cleared the Zustand store + React Query cache but NOT the `*_access_token` cookie. `queryClient.clear()` triggers the `useMe` refetch → request interceptor re-reads the lingering (httpOnly:false) cookie → `/auth/me` 200 → session restored before the `/login` redirect fires. The backend `clearAuthCookies` DOES run on `/auth/logout`, but its expiry `Set-Cookie` didn't match the cookie's original domain/path (cookie set with `domain=.mypickuae.com`), so it never cleared client-side.

Fix (#fix/dashboard-logout-cookie, commit c725097f): added `clearAccessTokenCookie()` in each app's `lib/api.ts`, called first in `clearAuthSession()`, expiring the cookie for host-only + current host + registrable parent domain (`.mypickuae.com`). Works because `/auth/logout` already revokes the refresh token server-side, so once the access cookie is gone `/auth/me` 401 → `/auth/refresh` also 401 → guard redirects to `/login`. NOTE: deleting only the access cookie is NOT enough on its own — if the refresh token is still valid the 401 interceptor silently re-issues a new access cookie via `/auth/refresh`. The real logout's refresh-revocation is what makes it stick.

Cross-app isolation: cookie names are per-app (`vendor_access_token` / `admin_access_token`, refresh too), driven by the `X-Client-App` header in `auth-cookies.ts getCookieNames`. Both live on `.mypickuae.com` but coexist by name; backend revokes only the refresh token matching `X-Client-App`. Verified on staging both directions: logging out of seller does NOT log out admin, and vice versa.

Frontend-only fix (no backend redeploy) per [[feedback_wire_shape_fix_side]]. Frontend isn't in CI ([[project_ci_backend_only]]) so verified via unit tests (admin vitest+jsdom, vendor bun:test) + Playwright runtime against the staging backend.
