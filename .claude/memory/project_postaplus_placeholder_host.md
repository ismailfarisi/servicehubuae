---
name: project-postaplus-placeholder-host
description: "PostaPlus official API is devinfolink.postaplus.net (Xchanges/*, PartnerKey header); adapter rewritten against it — auth header + consignee-code gaps found 2026-06-11"
metadata: 
  node_type: memory
  type: project
  originSessionId: 5c3de04b-84f4-46b6-bc5d-e59f07484b3a
---

The official PostaPlus integration (per the merchant-provided "Posta API Docs_V3.2.pdf" + Insomnia collection `PREM_API-UAE_CR26006559_V1.0`) is: test base `https://devinfolink.postaplus.net/api`, prod `https://infolink.postaplus.net/api`, endpoints `Xchanges/CreateShipment|CreateShipmentWithPickup|CreatePickup|CancelShipment|CancelPickup|GetShipmentTracking|GetShipmentLabel|UpdateShipment|DeliveryRateCalculation`, auth = API key in a header literally named `PartnerKey`, plus `WaitResponse: 0` header on every request. Webhook payload = `{ShipmentCode, ActionCode, ActionName, ActionDate "YYYY-MM-DD - HH:mm", ...}` with NO signature mechanism. UAE test account: customer `CR26006559`, tenant `DXB`, createdBy `POSTACLNT`. (An earlier note about a "MyNet Global / mynetglobal.group" API was a different Net-Holding product — ignore it.)

`postaplus.adapter.ts` (branch feat/postaplus-create-shipment-pickup) was rewritten against this API; body shape matches the collection sample. Gaps found in 2026-06-11 review: adapter sent `X-Partner-Key` instead of `PartnerKey`; consignee mapping sends empty `cityCode` for customer addresses (they carry city/state *names*, no PostaPlus codes — docs allow `cityDescription`/`provinceDescription` name fallback which the adapter never sends); no consignee email in the order address snapshot (docs: M); keep `webhook_secret` null or all webhooks 401.

**Shipping model (decided 2026-06-11):** PostaPlus is the PLATFORM carrier — every vendor ships through MyPickUAE's account by default; vendor-own carrier accounts are an opt-in override. Platform account = `vendor_carrier_accounts` row with `vendor_id NULL` (one per provider, partial unique index, migration 1780900000000); `resolveShippingAccount` in auto-shipment.job.ts does vendor-default→platform fallback; `vendors.auto_create_shipment` is opt-OUT (default true). Seed/rotate the platform account with `scripts/seed-platform-postaplus.ts` (POSTAPLUS_* env vars; also activates the provider).

**Staging is live (2026-06-11):** platform account b78f0bd3 seeded on Netcup staging with the collection's test creds (CR26006559/DXB, devinfolink default base URL); provider activated; first end-to-end staging booking = AWB 102601528506 for order FKS-2026-162319. For PROD seeding, POSTAPLUS_BASE_URL=https://infolink.postaplus.net/api MUST be set (adapter default is the TEST endpoint) plus real prod creds. Container gotcha: the image has no scripts/ dir — base64 the script into /app/libs/database/ (typeorm resolves there, not from /app root).

**Why:** these wire-level details (header name, name-vs-code address fallback) are invisible in type checks and only fail against the live API.

**How to apply:** Reference docs: `C:\Users\ismai\Downloads\Posta API Docs_V3.2.pdf` (text extracted to `D:\tmp\posta_api_docs.txt`) and `C:\Users\ismai\Downloads\PostaPlus_UAE_TEST_API_Collection_v1.0` (Insomnia YAML, includes live test PartnerKey). Warehouse PostaPlus location codes are stashed in `warehouses.operating_hours.postaplus` JSONB. Lookups (city/area codes) at https://preicos.postaplus.net/lookups/API/swagger/index.html.
