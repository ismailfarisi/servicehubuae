---
name: project-infra-migration-target
description: "MyPickUAE is planning AWS → Netcup + Cloudflare migration. Single 32GB box for prod, single 8GB box for staging, both EU. Goal is cost reduction; HA is explicitly deprioritized."
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d3b6c09-ee99-431a-a6e6-d05e3d130cdb
---

Migration target chosen 2026-05-28: leave AWS (ECS/RDS/S3/CloudFront/SES), move to Netcup + Cloudflare.

**Topology (confirmed against Netcup G12 catalog 2026-05-28):**
- **Production:** single Netcup **RS 4000 G12** (12 ded EPYC 9645 Zen 5 cores, 32GB DDR5 ECC, 1TB NVMe, €33.54/mo) running Postgres + Redis + Typesense + all Elysia services via docker compose
- **Staging:** single Netcup **RS 1000 G12** (4 ded cores, 8GB DDR5 ECC, 256GB NVMe, €10.74/mo) with same stack
- Netcup G12 includes built-in COW snapshots and supports Cloud vLAN for private networking between RS boxes — earlier-generation Netcup advice about "manual snapshots / must roll WireGuard" no longer applies
- **Edge:** Cloudflare (R2 for media replacing S3, CDN replacing CloudFront, Tunnel for ingress so no public ports, WAF, Turnstile)
- **Email:** Resend replacing SES
- **Region:** Netcup Nürnberg (EU). User accepted ~100ms UAE latency in exchange for ~10× cost reduction.

**Why this shape:**
- Server cost reduction is the explicit driver. Single-box-per-env is intentional, not an oversight.
- Cloudflare Tunnel removes the need for a Failover-IP / elastic-IP add-on (Netcup offers one for ~€3/mo but Tunnel reassignment achieves the same swap without it).
- Postgres self-managed (user chose this over Neon/managed) — see [[feedback-self-host-postgres]] if that ever gets recorded.

**How to apply:**
- When discussing infra, deploy targets, env vars, or CI/CD, default to this topology, not AWS.
- Treat HA as an accepted risk, not a gap to fill — don't suggest multi-AZ, read replicas, or managed-DB upsells unless user asks.
- Backups are the entire safety net: any infra suggestion must preserve pgBackRest → R2 + restic → R2 with tested restore drills.
- Memory budget on the 32GB prod box is tight; flag features (e.g. CLIP visual-search embeddings, large Typesense indexes) that would push it over.
- Plan is in proposal stage as of 2026-05-28 — verify it was actually executed before assuming any box exists.
