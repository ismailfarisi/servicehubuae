---
name: project_cloudflare_stream_webhook
description: Cloudflare Stream (reels video) webhook + credential wiring across staging and prod
metadata: 
  node_type: memory
  type: project
  originSessionId: 8193b0c7-558d-47a8-8132-f21903bb7eac
---

Reels video uses one shared **Cloudflare Stream account** (`6512df04867622564d90d378ab767673`) for BOTH staging and prod. Cloudflare allows only ONE webhook notificationUrl per account, and it points to **prod**: `https://api.mypickuae.com/reels/webhooks/cloudflare-stream` (set 2026-05-31). Webhook is HMAC-signed (`webhook-signature` header); reels-service verifies via `config.cloudflareStream.webhookSecret`. The route is public — `jwt-auth.ts` allowlists `/reels/webhooks/`.

**Implication:** staging does NOT receive Cloudflare webhooks (single webhook → prod); staging relies on the reels upload **recovery job** that polls Cloudflare for missed `video.ready` events.

**Credential wiring (3 values: account-id, api-token, webhook-secret):**
- Env vars: `CLOUDFLARE_STREAM_{ACCOUNT_ID,API_TOKEN,WEBHOOK_SECRET}`.
- GitHub secrets: `PROD_CLOUDFLARE_STREAM_*` and `STAGING_CLOUDFLARE_STREAM_*` (same values — shared account).
- Prod SSM (AWS, KMS SecureString): `/mypickuae/production/cloudflare/{account-id,api-token,webhook-secret}`. Source of truth = GitHub secrets; `deploy-prod.yml` "Push secrets to SSM" syncs GH→SSM, then the box's `refresh-env-from-ssm.sh` materializes `.env`.
- Staging is on Netcup (`deploy-staging-netcup.yml`) — injects GH secrets straight into env, no AWS SSM.

**Gotcha:** changing the SSM/GitHub webhook secret only takes effect on prod after a prod deploy/env-refresh + reels-service restart. Until then signed webhooks 401 (recovery job still backstops). The committed `terraform/staging/terraform.tfvars` also carries these CF values. See [[project_prod_infra_and_listing_diag]], [[project_vendor_reel_studio_deferred]].
