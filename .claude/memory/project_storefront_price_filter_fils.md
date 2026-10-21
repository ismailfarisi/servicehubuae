---
name: project_storefront_price_filter_fils
description: Storefront price filter is AED in the URL but fils at the API; useResultCount bypassed the converter (count showed 0)
metadata: 
  node_type: memory
  type: project
  originSessionId: 78443813-e54e-4e47-a3d0-83803ec07dc6
---

Storefront "Price (AED)" filter inputs write `minPrice`/`maxPrice` to the URL in **whole AED**, but product-service stores/filters prices in **fils** (AED×100). So an unconverted `maxPrice=20` means "≤ 0.20 AED" → ~0 matches.

**Conversion boundary:** `apps/web/src/components/product/listing-params.ts` `translateListingParams` (used by `buildListingParams`/`buildSearchListingParams`/`buildBrandListingParams`) converts AED→fils. Shared converter is `money.aedToFils` (inverse of `filsToAed`; returns a number, drops blank/negative/non-numeric). Category/brand are SSR (`server.get` + buildListingParams); search page = `useProducts(buildSearchListingParams(...))`. **`useProducts` must NOT convert** — it always receives already-translated (fils) params, so converting there double-counts.

**The gap (PR #330):** the live "Show N results" count in the mobile filter sheet uses `useResultCount` (`lib/queries/products.ts`), which calls `GET /products` directly and bypassed the translator → count read wrong (usually 0) whenever a price filter was set. Fixed by converting via a local `withPriceInFils(filters)` helper in `useResultCount`.

Backend `minPrice`/`maxPrice` contract is fils across BOTH search adapters (typesense `price_min:>= X`, postgres `p.price >= :minPrice`) and collection rules (`collection-resolver` `minPrice: c.price_min`) — so fix on the frontend (cheaper side), never in the adapters. Verified on prod: makeup `maxPrice=20`→0, `maxPrice=2000` (=AED 20)→325.

PR #330 also fixed a second bug in the same modal: `filter-sheet.tsx` header "Clear All" collided with `SheetContent`'s always-rendered absolute close ✕ (`right-4 top-4`) → looked like text spilling off the right edge on a phone ("wider than the page"). Fix: header gets physical `pr-12` (physical, since the ✕ is `right-4` not logical, so it holds in RTL). NOT a width-overflow bug — the bottom sheet is `fixed inset-x-0` and measures exactly viewport-width. See [[project_marketplace_category_scope]].
