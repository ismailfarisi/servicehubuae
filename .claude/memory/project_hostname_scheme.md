---
name: project-hostname-scheme
description: Public hostname scheme for MyPickUAE environments on Cloudflare. Staging uses api-stage.mypickuae.com (NOT api.stage.mypickuae.com) due to free Universal SSL only covering one wildcard level deep.
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d3b6c09-ee99-431a-a6e6-d05e3d130cdb
---

Final hostname scheme decided 2026-05-28 during Cloudflare Tunnel setup:

| Env | API (Netcup via CF Tunnel) | Web (Vercel) |
|---|---|---|
| Production | `api.mypickuae.com` | `mypickuae.com` |
| Staging | `api-stage.mypickuae.com` | `stage.mypickuae.com` |

**Ownership split:** the web frontends live on Vercel; only the API/backend stack lives on Netcup. CF Tunnel routes ONLY the `api*.mypickuae.com` hostnames to the Netcup box. The web hostnames must be DNS-only (gray cloud) in Cloudflare so Vercel handles TLS without double-proxy interference.

**Why:** Cloudflare's free Universal SSL covers `mypickuae.com` and `*.mypickuae.com`, but NOT `*.stage.mypickuae.com` or any other second-level wildcard. So `api.stage.mypickuae.com` would TLS-handshake-fail on the free plan. Renaming to single-level `api-stage.mypickuae.com` keeps the cost at zero. Confirmed by direct test 2026-05-28: `stage.mypickuae.com` returns HTTP 200 through the tunnel, `api.stage.mypickuae.com` returns `SEC_E_ILLEGAL_MESSAGE` SSL alert.

**How to apply:**
- Don't reintroduce two-level subdomains (e.g. `*.stage.mypickuae.com`, `*.qa.mypickuae.com`) on the free Cloudflare plan — they will SSL-fail at the edge.
- For any new environment, use a flat single-level hostname: `pr-123.mypickuae.com`, `qa.mypickuae.com`, `demo.mypickuae.com`.
- App code, env vars, CORS allowlists, OAuth callback URLs, mobile app config must all use the renamed staging hostnames going forward.
- If a deep subdomain is truly required, the options are: Advanced Certificate Manager (~$10/mo/zone) or manually uploaded Let's Encrypt cert. Don't pay for ACM unless there's a real reason — see [[project-infra-migration-target]] cost goals.

**Orphan to clean up:** an old `api.stage.mypickuae.com` CNAME may still exist in Cloudflare DNS from the initial tunnel setup before the rename. Safe to delete in the CF dashboard.
