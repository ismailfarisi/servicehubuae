---
name: project_quote_etag_stale_expiry
description: "Checkout \"quote expired\" could never self-heal because the ETag is timestamp-free, so a 304 refetch served the stale expires_at; fixed by forcing a non-304 fetch"
metadata: 
  node_type: memory
  type: project
  originSessionId: b5035321-8ace-48fc-842f-a7701f690cc4
---

The checkout quote ETag (`backend/.../quote/etag.ts`) is `hash(cartHash | addressId | userId | rulesEpoch | fxDate)` — **intentionally timestamp-free** so unchanged carts hit the `cache-control: max-age=60` / `If-None-Match` 304 path. But `expires_at` and `quote_token` (issuedAt) change every build. So when the web client refetched an unchanged cart it got **304 (empty body)** and replayed the cached quote with its old, already-past `expires_at` → `isQuoteExpired()` stayed true forever → "Place Order" was permanently stuck on "quote expired" (triggered by pausing, navigating back >55s React-Query staleTime, or retrying after an error).

**Non-obvious:** the server's `validateQuoteToken` does NOT enforce expiry — it re-derives the HMAC from the `issuedAt` baked into the token, so an "expired" token still validates as long as cart/rules/fx match. The expiry block was a pure client-side illusion that couldn't clear because of the 304.

**Fix (frontend-only, #238):** `apps/web/src/lib/queries/checkout-quote.ts` exports `invalidateQuoteEtag(addressId)` (drops the module-level etagCache + dataCache entry) so the next fetch is a full 200 with a fresh expires_at + token. `checkout-page.tsx` calls it on expiry, force-refetches, then continues placing when the reviewed total is unchanged, else shows a re-confirm message. Placement reads the freshly-resolved quote/token, not the stale render-closure `quoteData`/`quoteToken`. Kept the 304 optimization for background polling. See [[project_cod_surcharge_shipping_source]] for the related quote-vs-charge total work.
