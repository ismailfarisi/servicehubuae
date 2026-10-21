---
name: project_support_chat_slice1
description: Customer-facing support chat (guest-capable tickets + SSE widget) shipped as PR
metadata: 
  node_type: memory
  type: project
  originSessionId: a653443c-1852-4a13-a76c-1e12ecae9386
---

Storefront had NO customer entry to the (backend-only, admin-UI-only) support-ticket + dispute systems; old contact page even claimed a nonexistent live chat. Built **Slice 1 = support chat** on branch `worktree-support-chat` → **PR #339 — MERGED to master 2026-07-15** (commit 536cb564; squash). NOT prod-deployed (no v*.*.* tag). 8-task subagent-driven build off a spec+plan under `docs/superpowers/{specs,plans}/2026-07-15-support-chat-*`.

**What shipped (Slice 1):**
- Guest-capable tickets: migration `1782000000000-SupportTicketsGuestCapable` makes `support_tickets.user_id` nullable + adds `guest_session`/`guest_email`/`guest_name` (+ CHECK user_id OR guest_session), `support_messages.sender_id` nullable.
- Identity-based `SupportService` (`TicketIdentity = {userId|guestSession}`); customer `/support/tickets…` routes made **optional-auth** in `libs/guards/jwt-auth.ts` → guests identified by `x-guest-session` header. Admin `/support/admin/*` stays gated.
- Real-time: `GET /support/tickets/:id/stream` SSE (authorizes owner-only BEFORE subscribe) + Redis pub/sub fan-out in `cms-service/src/lib/ticket-events.ts` (publish on customer + non-internal admin msgs; internal notes never published/shown). Gateway already streams `/support` unbuffered — no gateway change.
- Frontend `apps/web`: streamed-`fetch` SSE reader `lib/sse.ts` (NOT EventSource — so auth/guest headers attach), hooks `lib/queries/support.ts`, global `components/support/chat-widget.tsx`, account pages `account/support/{,[id],new}`, `support` i18n en/ar.

**Decisions:** guest tickets stay guest-scoped v1 (no account-merge); attachments text-only v1; SSE consumed via fetch-stream so one path serves guest+auth. See [[project_optional_auth_not_public]] [[project_elysia_strips_unknown_body_props]].

**Follow-ups (non-blocking, documented):** optional-auth routes never 401 → expired token on a support call yields guest/empty/400, so axios silent-refresh doesn't auto-fire from support alone (fixed the worst symptom: `api.ts` sends `x-guest-session` ONLY when no access-token cookie; `useTicketStream` rebuilds headers per reconnect + capped backoff). Later: omit admin `sender_id` from customer projection; hash `guest_session` at rest; throttle guest ticket creation + cap concurrent streams.

**Admin panel support UI was mis-mapped (PRE-EXISTING, fixed → master e004158f, pushed direct, NOT via PR):** `apps/admin-panel/.../support` was built against a shape the backend never returns → tickets list always empty. Real contract: list at `response.data.data` (hook returns res.data.data = `{data:[...],total,...}`; page had read `.tickets`/`.items`); detail messages use `message`/`is_internal`/`sender_role` (NOT body/is_internal_note/sender.role); reply POST body = `{message,is_internal}` (NOT {body,is_internal_note} — Elysia strips unknown). FOLLOW-UP DONE (master 7529f093, direct push): listAllTickets + getAdminTicket now SELECTIVELY join `user` + `assignedToUser` (+ `order.order_number` on detail) — `.leftJoin("t.user","user").addSelect(["user.id","user.email","user.first_name","user.last_name"])` etc. (id/email/first_name/last_name ONLY — never leak sensitive User cols). Admin UI reads `ticket.user`/`assignedToUser`/`order`; guests still fall back to guest_email/name. Backend change pushed direct to master → triggers staging deploy; runtime join NOT verified locally (worktree DB conn failed) — verify registered-customer email shows on staging admin. Still deferred: detail "Assigned To" is a raw-value text field (needs an agent picker); admin sender_id still in customer projection.

**Slice 2 = customer disputes (NOT built):** own plan later. Prereq: `order-service/dispute.routes.ts` is BROKEN today — calls `disputeController.openDispute`/`listMessages` (real methods `open`/`getMessages`) and `addMessage(id,userId,body)` drops body into the senderRole slot. Fix those before building the disputes UI. Disputes stay authenticated-only (need an owned delivered/shipped order). Reuse the same SSE pattern (user wants SSE, not polling).

Prod deploy is tag-gated (`v*.*.*`) → runs migrate service; additive migration is backward-compatible. See [[reference_prod_deploy_tag_and_migrations]].
