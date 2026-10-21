---
name: project_staging_cors_vercel_preview
description: "Why browser-testing a feature-branch frontend against staging API fails (CORS), and how to do it"
metadata: 
  node_type: memory
  type: project
  originSessionId: ed8820cb-fbd8-42ba-8598-eb54d52e2761
---

The staging API gateway (api.stage.mypickuae.com) runs NODE_ENV=production, so api-gateway `app.ts` CORS uses the **env-driven allowlist** (ADMIN_PANEL_URL / VENDOR_DASHBOARD_URL / WEB_URL / WEB_WWW_URL → the `*.stage.mypickuae.com` hosts), not `origin:true`. Config only distinguishes `production` vs `development` (no staging flag).

**Consequence:** a Vercel **preview** deploy of a frontend (dynamic origin like `ecom-admin-panel-<hash>-…vercel.app`) is blocked by CORS when it calls the staging API — login itself fails at the `/auth/login` preflight. So you can't browser-test a feature-branch frontend against staging out of the box.

**Ways to verify instead:**
- Hit the API directly with a token (curl/Playwright-API) — CORS is browser-only, so server-side calls work. Login: `POST /auth/login`, token at `data.tokens.accessToken`; role admin = `admin@mypickuae.com`.
- Or test from the stable host `admin.stage.mypickuae.com` (already allow-listed) once the branch is merged/aliased.
- Proper fix if preview E2E is needed: add a staging-only allowance (e.g. push `/\.vercel\.app$/` into the allowlist when `CORS_ALLOW_VERCEL_PREVIEWS=true`, set only in deploy-staging-netcup.yml) — keep it off prod.

Relates to [[project_hostname_scheme]] and [[project_netcup_staging_live]].
