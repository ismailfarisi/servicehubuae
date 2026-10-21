---
name: project_prod_duplicate_inventory_rows
description: "Prod \"duplicate warehouses\" is really duplicate inventory rows — missing unique constraint on inventory(product,variant,warehouse)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 56de6a3e-3468-42c9-b5b1-f259bae3d8f1
---

Reported 2026-07-13 as "duplicate warehouses in prod". The `warehouses` table is actually clean (9 rows, one per vendor, no dups). The real bug: duplicate **`inventory`** rows for the same (product_id, variant_id, warehouse_id) — the product Inventory tab renders one line per inventory row, so the same warehouse shows N times.

Extent (prod, live rows): 11,277 total inventory rows; 4,222 duplicated keys; ~6,149 extra rows (~55%). Worst: Multiplex Intl (vendor 6efa3a2d, wh be22f0a1) 3,589 extra up to 5×; Forever Makeup (7cc190d9, ac22118d) 1,696 up to 4×; Impression Beauty (042bcd52) 602. Almost all are `variant_id IS NULL` (simple products).

**Why:** `inventory` has NO unique constraint on (product_id, variant_id, warehouse_id) — confirmed in inventory.entity.ts and 1711500000000-InitialSchema.ts. Restock/bulk-import path INSERTs a new row instead of upserting (NULL variant_id makes plain ON CONFLICT unmatchable); repeated inventory-import/update jobs each fork a fresh row. Dup dates cluster (Forever Makeup all 2026-06-01 ×4; Multiplex 2026-06-15 ×2 then 2026-07-05 +3).

**How to apply:** Cleanup can't just SUM copies — Multiplex copies disagree (e.g. {10,10,2,2,2}); keep-latest-activity. Forever Makeup copies identical = pure dupes. Investigated via [[reference_prod_rds_ssm_debug]] (SSM + dockerized postgres:16-alpine + --env-file from vendor-service container).

**SHIPPED + VERIFIED ON PROD (PR #324 merged 86db15b3; released v0.1.79 → deploy-prod.yml ran the `migrate` compose service). Post-deploy prod check: index live (NULLS NOT DISTINCT WHERE deleted_at IS NULL), 6,149 rows soft-deleted → 5,128 live, 0 dup groups, 0 quantity_available drift, Multiplex products now 1 row each.** Details: migration `1782200000000-DedupeInventoryAddUniqueIndex` — soft-deletes 6,149 losers (survivor = last_restocked_at DESC NULLS LAST, updated_at DESC, created_at DESC, id DESC; re-points movements+reservations first), repairs quantity_available on all live rows, then `CREATE UNIQUE INDEX uq_inventory_product_variant_warehouse_active ON inventory(product_id,variant_id,warehouse_id) NULLS NOT DISTINCT WHERE deleted_at IS NULL` (prod is PG16.13; NULLS NOT DISTINCT is essential — variant_id NULL on 11,242 rows). vendor_id deliberately NOT in key (implied by product_id). Root cause was PR #314 stopping new dupes but deferring cleanup+index. Code audit: 5 inventory write sites, none broken by index; catalog-import.write.ts:512 variant seed's bare `ON CONFLICT DO NOTHING` now actually works via the new index; also set quantity_available in write.ts:512 + inventory-update.job-type.ts (both were leaving it 0, perpetuating the drift #314 fixed elsewhere). Dedupe validated read-only against prod (6,149→0 dup groups). Docs updated (db-design 05-catalog.md corrected: quantity_available is NOT generated, and the real unique key; 14-indexes.md). biome+tsc clean on changed files.
