---
name: project_vendor_reel_studio
description: "Vendor reel studio (create + tag products in vendor-dashboard) — SHIPPED, incl. taggable resolution + the is_active→status prod fix"
metadata: 
  node_type: memory
  type: project
  originSessionId: 8193b0c7-558d-47a8-8132-f21903bb7eac
---

Vendors can create reels and tag their products from `apps/vendor-dashboard` (My Reels list + upload + edit/tag/thumbnail/publish). **Shipped** (was deferred until vendor-membership phase3b dropped `vendors.user_id`; phase3b merged #225, then this landed). Scope as built: full 3-page studio, vendor's own **full catalog** as the tag-picker source, any vendor can create, vendor-authored reels stamped `author_kind = 'house'`.

**Vendor resolution (post-phase3b):** the logged-in user → vendor is resolved via active `vendor_members` membership, NOT `vendors.user_id`. reels-service derives the active vendor from the JWT `vm` claim ∩ `X-Active-Vendor-Id` header, with a DB fallback (`resolveActiveVendorIdWithFallback` → `loadActiveMemberships`) for tokens lacking the claim. The vendor dashboard's axios client already sends `X-Active-Vendor-Id` when the user has ≥2 memberships.

**Key PRs:** #227 (studio frontend by Codex + pending-draft/webhook-recovery), #228 (catalog-only taggable + robust resolution), #229 (gate reels-service in `pr-check.yml` + fix its 3 pre-existing tsc errors), #230 (the real prod fix — see below).

**The prod bug that made the picker empty:** product-service `TaggableProductsLookupService.listByVendor/listByPermission` filtered `p.is_active = TRUE`, but `products` has no `is_active` column (it has `status`; `published` = live). Postgres 42703 → product-service 500 → reels-service 503 `taggable_products_unavailable`. Fixed in #230 to `p.status = 'published'`. Lesson: raw query-builder column strings aren't tsc-checked and there's no DB-integration test for these lookups — a product-service integration test would have caught it. See [[project_pdp_reel_scope]], [[project_cloudflare_stream_webhook]], [[project_ci_backend_only]].
