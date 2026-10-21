---
name: PDP endpoint strategy — lean core, parallel fan-out
description: Don't aggregate everything into /products/:slug; keep it fast and load reels/recs/vendor-extras/BNPL via separate client-side requests
type: project
originSessionId: de94d6d8-d33b-48ed-978b-304106a8e5bf
---
For the Product Detail Page on MyPickUAE, **do not build a fat aggregated `/products/:slug` endpoint** that joins reels, recommendations, vendor follow state, BNPL eligibility, etc.

**Rule:** The core `/products/:slug` stays lean — product + variants + images + vendor card + category + inventory + reviews summary. Everything else is fetched in parallel from the client after first paint.

Suggested separate endpoints:
- `/reels?product_id=…` (reels for the PDP)
- `/products/:id/related?type=more-from-brand|pairs-with|you-may-also-love`
- `/products/bestsellers?category_id=…`
- `/me/follows/vendors/:id` (follow state — auth only)
- `/me/recommendations?product_id=…` (personalized "you may also love")
- `/checkout/bnpl-eligibility?cart_total=…` (BNPL strip — but eligibility is cart-total only, see project_bnpl_eligibility.md)

**Why:** User explicitly flagged on 2026-05-07 that the aggregated approach would slow down PDP load. Hero buy box should paint first; secondary rails fill in progressively.

**How to apply:** When implementing the PDP, resist the temptation to add joins/relations to `getBySlug`. If a new section needs data, add a dedicated endpoint and let the frontend fire it in parallel. Reserve `getBySlug` for "above-the-fold-or-first-render" data only.
