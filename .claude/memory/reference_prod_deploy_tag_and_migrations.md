---
name: reference_prod_deploy_tag_and_migrations
description: How to release to prod (AWS EC2) and how DB migrations get applied there
metadata: 
  node_type: memory
  type: reference
  originSessionId: 56de6a3e-3468-42c9-b5b1-f259bae3d8f1
---

Prod (AWS EC2 i-0f982d225cd7f140a, ap-south-1) deploys ONLY on pushing a `v*.*.*` git tag → `.github/workflows/deploy-prod.yml`. Merging to master does NOT deploy prod. Flow: backend lint/test → sync GH secrets to SSM → build all 9 service images to ECR (tagged with the version) → deploy-backend step SSH-less via SSM Run Command on the box (`cd /opt/mypickuae`, refresh .env from SSM, `docker-compose pull`, **`docker-compose --profile tools run --rm migrate`**, `docker-compose up -d --force-recreate`). Prior deploys ~5-6 min. Tag = FULL release of everything merged since the last tag, all services force-recreated.

Migrations: `migrationsRun` is NOT set in data-source.ts (defaults false) and `ensureDatabase()` only calls `AppDataSource.initialize()` — so migrations do NOT auto-run on service boot. They run via the dedicated `migrate` compose service (tools profile) during the deploy step above. So to apply a migration to prod: merge to master, then `git tag -a vX.Y.Z <commit> && git push origin vX.Y.Z`. Latest tags increment like v0.1.78 → v0.1.79.

Verify a deploy: `gh run watch <id> --exit-status` (Node20-deprecation lines are warnings, not failures; the cms-service `header-navigation.service.test.ts` ECONNREFUSED `X` lines are the known no-DB-in-CI noise per [[reference_ci_no_db_turbo_cache]] — order-service is the real test gate; "Missing GitHub Secrets (skipped): STRIPE_*/GEMINI" is a warning, SSM sync just doesn't overwrite them), then query prod read-only via [[reference_prod_rds_ssm_debug]] (SSM + dockerized postgres + --env-file from a service container) — check the `migrations` table for the migration name + `pg_indexes`/data. Staging is Netcup, separate (see [[feedback_default_staging_netcup]]).

EXACT PROCEDURE (used v0.1.80, 2026-07-14). There's a bookkeeping `origin/prod` branch that "merge master to prod" refers to, but the TAG is what actually triggers the deploy — the branch is just a record and drifts behind (was at #322 while last deploy was v0.1.79/#324). Do it all against remote refs WITHOUT switching branches (keeps a dirty working tree / feature branch untouched):
1. `git fetch origin` then confirm clean FF: `git merge-base --is-ancestor origin/prod origin/master && echo FF-OK` (should be empty the other way).
2. Fast-forward the prod branch on the remote: `git push origin origin/master:refs/heads/prod`.
3. Annotated tag on master tip (tags ARE annotated, message form `vX.Y.Z — <short summary of what's new> (#PR)`): `git tag -a vX.Y.Z origin/master -m "..."`. New tag = last +1 (v0.1.79 → v0.1.80).
4. Push the tag LAST (this is the deploy trigger): `git push origin vX.Y.Z`.
5. Confirm it started: `gh run list --workflow=deploy-prod.yml --limit 3`, then watch. The tag deploys everything on master since the previous tag, not just what the prod branch lacked.
