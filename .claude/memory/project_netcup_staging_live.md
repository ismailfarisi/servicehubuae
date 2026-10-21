---
name: project-netcup-staging-live
description: Netcup staging stack went live 2026-05-29. https://api.stage.mypickuae.com served by 9 GHCR-built backend services behind host Caddy + LE on 89.58.29.111. Deploy via .github/workflows/deploy-staging-netcup.yml.
metadata: 
  node_type: memory
  type: project
  originSessionId: 4d3b6c09-ee99-431a-a6e6-d05e3d130cdb
---

Netcup staging is up and serving 2026-05-29.

**Topology:**
- Host: Netcup VPS 1000 ARM G11 (89.58.29.111, arm64, Ubuntu 25.10)
- Edge: Caddy 2.11 on host, auto-LE for `api.stage.mypickuae.com`, reverse-proxies `localhost:3000`
- Containers: 9 mypickuae services from GHCR + Postgres (imresamu/postgis:16-3.4 multi-arch) + Redis + Typesense, all on docker compose
- Deploy: `.github/workflows/deploy-staging-netcup.yml` — as of 2026-05-31 auto-deploys on push to `master` (paths: `backend/**`) plus `workflow_dispatch`. The AWS `deploy-staging.yml` is now demoted to `workflow_dispatch`-only legacy fallback. Builds multi-arch buildx → GHCR, SCPs .env + compose to `/opt/mypickuae/` on the box, `docker compose pull && migrate && up -d`
- Branch: merged to master (was `netcup-staging-deploy`)
- Secrets: GitHub repo secrets (STAGING_NETCUP_*, STAGING_* — populated from AWS SSM during cutover)

**SSH access:** `ssh -i ~/.ssh/netcup_deploy_ci deploy@89.58.29.111` (NOT root, NOT the `netcup_staging` key). fail2ban bans the source IP after a few failed publickey attempts — once banned, every connection just times out (not "permission denied"); wait it out. The DB is a containerized Postgres (db/user `mypickuae`), reach it via `docker exec <postgres-container> psql -U mypickuae -d mypickuae`. When SSH is banned, the **public API** (api.stage.mypickuae.com) is a fallback for reads.

**Footguns discovered (worth flagging on prod migration):**
1. `postgis/postgis:16-3.4` is amd64-only — use `imresamu/postgis` for arm64 or anywhere multi-arch matters.
2. `bun run migrate` (workspace script) fails inside our images because `bun.lockb` isn't shipped — invoke by file path: `bun run libs/database/src/run-migrations.ts`.
3. `@mypickuae/config` does `requireEnv` for many vars at import time in production mode; every service container that imports `@mypickuae/config` (i.e., all of them) needs the full `.env` available. Compose pattern: `env_file: .env` on each service plus `environment:` for container-specific overrides (REDIS_HOST=redis, etc.).
4. `VENDOR_DASHBOARD_URL` and `ADMIN_PANEL_URL` are required env vars but were never in AWS SSM — `requireEnv` fires for them in production. Provide them in the workflow's .env render even if just placeholders.
5. `data-source.ts` forced SSL in production for RDS — added `DB_SSL=false` override for containerized Postgres (committed in netcup-staging-deploy branch).
6. Typesense docker image has no curl/wget — drop healthcheck and use `service_started` for dependents.
7. **PowerShell pipe + gh secret set adds a UTF-16 BOM** to multi-byte values. Use `gh secret set NAME --body $value` (arg, not pipe) and pre-strip with `-replace "[^\x20-\x7E]"`. The BOM made ENCRYPTION_KEY 65 chars instead of 64 and broke hex parsing on the vendor/order/integration services.
8. SSH config `mypickuae` alias was pointing at `api.stage.mypickuae.com` which now resolves to Netcup, not EC2. EC2 host needs to be reached by IP, not the public DNS name, post-cutover.

**Not yet done:**
- AWS keys (S3_MEDIA_BUCKET, AWS_ACCESS_KEY_ID etc.) are still empty in the new .env — cms-service/notification-service work for everything except media uploads + email. Need to mint a dedicated IAM user for Netcup or migrate media to R2 + email to Resend per [[project-infra-migration-target]].
- pg_dump from EC2 staging → Netcup not yet done. Fresh DB on Netcup, migrations clean.
- DNS for staging web frontends (stage.mypickuae.com) still owned by Vercel, not on the tunnel.
