---
name: project-elysia-optional-rejects-null
description: "Elysia/TypeBox t.Optional(X) rejects null on the wire — frontends must omit (undefined), not send null, for empty optional fields"
metadata: 
  node_type: memory
  type: project
  originSessionId: 3e3cffec-7329-418b-9c93-ebb74545b771
---

Elysia request-body validation uses TypeBox. `t.Optional(X)` means the property may be **absent (undefined)** — it does **NOT** accept `null`. Sending `null` for a `t.Optional(t.String())` field 400s. Worse, for `t.Optional(t.Object({...}))`, Elysia's decode/clean coerces a sent `null` into a defaulted object (e.g. `{conditions:{}}`) which then fails on the required inner keys (`v`, `match`) — a confusing error whose `found` shows the coerced shape, not your `null`.

Bit the collections admin UI **twice** on staging: empty `starts_at`/`ends_at` and an untouched `rules` were sent as `null` → 400 on create.

Fixes (cheaper side = frontend, since the backend was already deployed to Netcup — see [[feedback-wire-shape-fix-side]]):
- **Omit** the field when empty: send `undefined` (e.g. `rules: rules ?? undefined`). Works for create. BUT omitting can't *clear* a previously-set value in an editor (the service's `update` does `if (data.x !== undefined)`), so it won't unset.
- For fields that must support clearing, send a **falsy non-null** value the schema accepts and the service maps to null (e.g. `""` for a `t.Optional(t.String())` date, where the service does `data.x ? new Date(data.x) : null`).
- **Complete fix** (supports clear + is the correct API): make the body schema accept null — `t.Optional(t.Union([X, t.Null()]))` — since services here already handle null. Costs a backend redeploy. Recommended when edit-clear matters.

Related: [[project-public-route-three-places]] (another easy-to-miss gateway/validation gotcha).
