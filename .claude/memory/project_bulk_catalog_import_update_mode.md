---
name: project_bulk_catalog_import_update_mode
description: "Bulk catalog import \"update mode\" — partial updates on existing products/variants; PR"
metadata: 
  node_type: memory
  type: project
  originSessionId: b6c6b630-cb58-49ca-b6f4-b08ca08adf8a
---

Bulk catalog import gained a whole-file **update mode** (PR #322, branch `feat/catalog-import-update-mode`, off master 2026-07-12). Default `upsert` = create-or-update (unchanged); `update` = key-only, updates only provided columns (blank = leave unchanged), errors on unmatched keys (`update_product_not_found`/`update_variant_not_found`), never creates, supports variant-only files. `import_mode` enum column on `bulk_import_jobs`; interpreted ONLY by `catalog_import`.

**Runtime-path gotcha (bit this work, will bite future bulk-import changes):** catalog jobs run through `bulk-dispatcher.worker.ts`, NOT directly through the generic `BulkJobWorker`. The dispatcher preloads `buildValidationContext` ONCE and its `wrapWithPreloadedContext` OVERRIDES `buildValidationContext` to return that cached ctx — so the generic worker's own `buildValidationContext({importMode})` call is shadowed. **`ctx.mode` (and anything ctx-derived) comes SOLELY from the dispatcher's preload call**, which must pass `importMode: jobRow.import_mode`. `resolveParseOptions` is the exception — it's read via `job.import_mode` in `effectiveParseOptions`, not ctx, so it works regardless. Any new per-job context field must be threaded at the dispatcher preload, not just the generic worker.

**Design decisions:** unmatched keys error (not upsert-fallback); blank = leave unchanged (never clear); products + variants; whole-file toggle. Write path was the hard part — the original per-task work reused the full-row upsert write logic, which silently overwrote untouched columns; the whole-branch review caught 3 write-path bugs (product booleans coercing to defaults flipping `has_variants`; variant loop skipping only `undefined` not `null`, wiping `option_values`; variant-only files silently no-op because `writeProductsBatch` only writes variants nested under in-file products). Fix added `writeUpdateBatch` (products+variants updated independently, variant parent resolved from DB `ctx.productsBySku`/`ByExternalId`) and made coerce emit `null` (not defaults) for absent fields in update mode.

Pending before merge: live end-to-end DB smoke + 2 gated `import_mode` persistence tests (couldn't run — no local Docker/Postgres). Related: [[project_typeorm_datasource_registration]], [[reference_bun_test_live_db_pooling]].

**CI-only test flake gotcha (cost a red CI on PR #322):** a mocked `EntityManager` whose `getRepository(entity)` branched on `entity.name` (string match "Product"/"ProductVariant") PASSED locally (isolation AND full 465-test suite) but FAILED in CI — `getRepository(ProductVariant)` fell through to the default null-`findOne` branch, so `writeVariantRow`'s `current[field]` threw "null is not an object". Root cause not fully pinned (some CI build/run difference makes `entity.name` matching unreliable), but the fix is general: **mock `getRepository` by keying `findOne` on `where.id` (return `rowsById[id]`), never on entity class name/identity.** Behavior-based, environment-independent. Also note: cms-service DB-test failures (ECONNREFUSED / "No metadata for HeaderNavigationConfig") are non-blocking CI noise per [[reference_ci_no_db_turbo_cache]] — the real gate that went red was `@mypickuae/product-service#test exited (1)`.
