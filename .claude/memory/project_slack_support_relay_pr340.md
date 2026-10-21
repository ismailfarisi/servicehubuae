---
name: project_slack_support_relay_pr340
description: Slack support relay (two-way agent surface over Slice 1 support chat) — PR
metadata: 
  node_type: memory
  type: project
  originSessionId: addb1d4a-3bad-498f-a03c-f19dbb154e38
---

Two-way Slack relay for customer support chat, built on top of merged Slice 1 ([[project_support_chat_slice1]]). Customer/admin messages → per-ticket Slack thread in `#support`; agents reply in-thread → become `agent` messages delivered to the customer over the existing SSE stream. Admin-configured; bot token + signing secret + channel id AES-256-GCM encrypted at rest in `site_settings` (reuses `config.encryption.key`, no new env vars). All backend in **cms-service**.

Built subagent-driven (7-task TDD plan `docs/superpowers/plans/2026-07-15-slack-support-relay.md`), per-task + Opus whole-branch review. Branch `feature/slack-support-relay` (worktree `D:\ecom\.claude\worktrees\support-chat`, locked). **PR #340, base master — NOT merged, NOT prod-deployed.** Migration `1782100000000-SlackSupportRelay` needs a v*.*.* tag to run in prod (see [[reference_prod_deploy_tag_and_migrations]]).

Key pieces: `SlackSettingsRepository` (encrypted, `getPublic()` masks to `••••1234`+`*_set` booleans — raw secrets NEVER in any HTTP response or audit log), `SlackService` (fetch-based post/auth.test + `verifySignature` HMAC `v0:ts:rawBody`, timingSafeEqual, 300s window), public webhook `POST /support/slack/events` (allowlisted in libs/guards, `parse:["text"]` raw body, gateway already prefix-proxies `/support`), echo guard via new `support_messages.origin` col + `bot_id`/`subtype` inbound filter, Redis `event_id` dedup (SET NX EX, fail-open) so Slack retries don't double-post. Admin Settings→Slack page (write-only secret inputs, Events URL copy, Test button).

Notable review catches (all fixed in-branch): PUT route would have leaked decrypted secrets → `SlackController.update` returns `getPublic()`; `relayToSlack` wrapped try/catch so a settings/DB throw can't fail the customer message; Task 5 webhook route was created but not mounted → Task 6 must `.use(slackWebhookRoutes)` in app.ts + decorate `slackService` in container.

Deferred follow-ups (in PR body): key rotation orphans stored secrets (false "not configured", no unset path); first-post race can double-create Slack threads. Pre-prod smoke deferred to a real Slack test app (live round-trip, set NEXT_PUBLIC_API_URL for admin-panel, confirm gateway forwards x-slack-* headers).

Windows gotcha hit here: full-tree `biome check .` reports the changed files as "errors" that are pure CRLF formatter noise — committed blobs are LF (0 CR bytes). To verify CI-clean, rewrite the working tree to LF (`git -c core.autocrlf=false checkout -- <files>`) then `biome check` = 0 errors. See [[feedback_local_lint_diagnostic_level]].
