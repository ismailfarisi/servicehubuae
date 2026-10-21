---
name: project_postaplus_pickfalid_retriable
description: "PostaPlus PICKFALID (per-attempt pickup failure) was wrongly mapped to terminal failed_delivery; it's retriable (3 attempts)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 123e486a-f212-4292-9430-c39608c13584
---

PostaPlus attempts pickup up to 3 times before permanently failing it. Each failed attempt emits `PICKFALID` ("Pickup Failed"), then `PICK_Reschedule` → fresh `PICKDIS` (re-dispatch). Only on giving up does it send a terminal code `ACT-PKPCLS` ("pickup closed"). Payload has NO attempt counter — PostaPlus owns the retry count.

**Bug:** `PICKFALID` was in no explicit code set in `postaplus.adapter.ts` `mapStatus`, so it fell through to the generic `/\b(fail|failed|...)\b/` regex → `failed_delivery` (terminal AND customer-visible) on the FIRST pickup miss. Seen in prod on orders FKS-2026-266234 (102601669350) and FKS-2026-815743 (102601666412), where PostaPlus rescheduled/re-dispatched after the "failure" we surfaced.

**Fix (PR #336, SHIPPED TO PROD v0.1.83, verified live):** add `PICKFALID` to `PENDING_EVENT_CODES` → non-terminal (awaiting re-pickup). Forward-only tracking logic (STATUS_ORDER: pending=0, in_transit=2, failed_delivery=-1) keeps shipment at in_transit through retries; only ACT-PKPCLS / "PICK UP FAILED" (already in FAILED set, distinct codes) flip to failed_delivery. Decision: trust PostaPlus terminal code, don't count attempts ourselves.

`PICKFALID` (prod's actual actionCode, no spaces) is DISTINCT from the already-terminal `PICK UP FAILED` (spaced) and `ACT-PKPCLS`.

Related: these failed-pickup shipments were never picked up, so their vendor_orders correctly stay `ready_to_ship` (NOT shipped) — see [[project_autobooked_order_stuck_ready_to_ship]]. The 2 prod shipments still show stale failed_delivery (forward-only won't reprocess); optional data correction not done.
