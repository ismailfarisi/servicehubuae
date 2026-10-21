---
name: project_prod_ses_broken
description: Prod SES emails all fail because SES_FROM_ADDRESS is unset → app uses unverified noreply@mypickuae.com; the fix is one env var (noreply@mypickuae.com IS verified + has production access in ap-south-1)
metadata: 
  node_type: memory
  type: project
  originSessionId: 066c2b13-7d1d-4cf6-8d40-8f7c594553b0
---

Verified live on 2026-06-07 via SSM into prod EC2 (i-0f982d225cd7f140a), running the app's own SES client inside mypickuae-auth-service-1. Send-matrix result in prod's region (ap-south-1):
- `from=noreply@mypickuae.com` → **MessageRejected** "Email address is not verified".
- `from=noreply@mypickuae.com` → **OK, messageId returned**, delivered to an external Gmail (ismailfarisi@gmail.com).

So prod SES is actually healthy: **`mypickuae.com` is a verified identity in ap-south-1 AND the account has production access** (a send to an arbitrary external gmail succeeded → not sandbox-limited). The ONLY reason every transactional email currently fails is that **`SES_FROM_ADDRESS` is unset in the container**, so `email.service.ts:21` falls back to the hardcoded unverified `noreply@mypickuae.com` (wrong TLD — brand is `.ae`).

FIXED 2026-06-07 (PR #255). Live prod `/opt/mypickuae/.env` was patched (`SES_FROM_ADDRESS=noreply@mypickuae.com`, `APP_URL=https://mypickuae.com`, `PUBLIC_API_URL=https://api.mypickuae.com`) and auth/vendor/notification services recreated — end-to-end send confirmed. Made durable in IaC + staging: `terraform/production/user-data.sh` and `deploy-staging-netcup.yml`. Because SES identities are region-scoped and staging keeps S3 in me-south-1, added a dedicated `SES_REGION` env (config `aws.sesRegion = SES_REGION || AWS_REGION`, used by EmailService) set to `ap-south-1` everywhere.

Secondary (separate) issue, still true: `APP_URL` and `PUBLIC_API_URL` are also empty in the container → even once delivery works, verify/reset/magic-link/unsubscribe URLs default to `http://localhost:3000`. Set `APP_URL=https://mypickuae.com` + `PUBLIC_API_URL=https://api.mypickuae.com`. (Deploy sets `WEB_URL`, but the email service reads `APP_URL` — different var.)

Why this stayed invisible: `EmailService.sendEmail` catches every error and only `console.error`s "Failed to send email via SES", never throws — so signup/reset/invite flows look healthy while no mail goes out.

Diagnostic notes for next time: the EC2 role `mypickuae-production-ec2-role` HAS `ses:SendEmail` but NOT the SES read actions (GetSendQuota/ListIdentities/GetAccountSendingEnabled all AccessDenied), and the local `terraform` IAM user has no SES perms at all — so you cannot audit identities from the CLI; only by attempting a send from inside the box. Also the `me-south-1` SES endpoint hangs/times out from both the prod box and locally — don't probe there, prod is ap-south-1. See [[project_infra_migration_target]] (planned move to Resend) when weighing further SES investment.
