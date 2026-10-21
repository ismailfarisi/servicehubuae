---
name: project_pdp_oos_and_plp_reels_pr333
description: PR
metadata: 
  node_type: memory
  type: project
  originSessionId: 1164b8b3-ff83-4e9d-94b1-ff32c8639c46
---

Combined storefront-UI PR **#333** on branch `feat/pdp-out-of-stock` (off master), worktree `D:\tmp\ecom-pdp-oos`. Two independent changes:

**1. PDP out-of-stock gating.** `ProductHero` (the live PDP buy box — NOT the dead `PurchasePanel`) now disables "Add to bag" → "Out of stock" + muted when OOS. OOS = product total 0 OR selected variant 0. Per-variant availability computed **frontend-side** from `product.inventoryRecords` (already serialized to client via `/products/by-slug/:slug` — no backend change, cheaper side). `FormatSelector` marks sold-out variants; mobile `StickyBottomBar` gates on product-level stock. Signal convention: `product.in_stock === false || quantity_available <= 0` (matches product-card + JSON-LD).

**2. PLP reels.** Category listing `ListingStoryRail` used a bespoke inline modal that overflowed on mobile (horizontal page scroll). Replaced with the canonical full-screen `ReelFeed` (same as `/reels`), seeded to tapped reel + scoped to category, in `fixed inset-0` overlay + body-scroll lock. Kept story circles. Added optional `categorySlug` prop to `ReelFeed` (forwarded to getFeed when context==="category").

**Why:** user asked for OOS gating in PDP + fix PLP reels horizontal scroll ("use modal from homepage" — but homepage has no modal, it's a `ReelProductCard` rail → `/reels`; user chose "keep circles, open shared feed").

**Status: SHIPPED to prod.** Squash-merged to master `388030bb` (#333); `prod` branch FF'd `04975a70→388030bb` + pushed → Vercel ecom-web production deploy. Frontend-only, NO v*.*.* tag (that's backend-only per [[reference_prod_deploy_tag_and_migrations]]). Prod frontend deploys by pushing the `prod` branch (Vercel prod tracks `prod`).

**OPEN ITEM:** unit-tested (product-hero +3, listing-story-rail rewritten) + tsc clean, but the **mobile horizontal-scroll fix is NOT browser-verified** — category page is force-dynamic (needs live API). Confirm on prod / Vercel preview at mobile width (Vercel = real validation per [[project_ci_backend_only]]). Frontend not gated in CI. Worktree `D:\tmp\ecom-pdp-oos` still present; node_modules are junctions → `D:\ecom` (see [[feedback_use_worktree_for_work]]).
