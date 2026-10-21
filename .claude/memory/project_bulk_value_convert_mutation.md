---
name: project_bulk_value_convert_mutation
description: "Bulk import crash — Value.Convert mutated shared row.values → coerceRow .trim() on a number; fixed by cloning (PR #328)"
metadata: 
  node_type: memory
  type: project
  originSessionId: bc48a795-3a23-4805-98bb-960d978441d6
---

Bulk **inventory update** crashed every run with
`(row.values.quantity_on_hand ?? "").trim is not a function` (coerceRow in
`inventory-update.job-type.ts`). Root cause was NOT the inventory code but the
shared validator `libs/bulk-jobs/src/validators/row-validator.ts`:
`validateRowSchema` ran `Value.Convert(schema, row.values)` **directly** on the
parsed row. In **TypeBox 0.34, `Value.Convert` mutates its input in place**
(verified: returns the same object ref with the field retyped). Because the
inventory schema types `quantity_on_hand` as `Type.Integer`, validation rewrote
the parser's string `"5"` → number `5` on the shared `row.values`, then the next
worker step `coerceRow` read it as the documented `Record<string, string>` and
`.trim()`ed a number.

Blast radius was wider than one job type:
- **inventory-update** — `Type.Integer` field → crashed in prod.
- **flash-deal-import** — `deal_price`/`original_price`/`quantity_limit`
  `Type.Integer`, `is_active` `Type.Boolean`; coerce helper `.trim()`s them all
  → same latent crash, just not exercised yet.
- **catalog-import** — survived only because every field is `Type.String` (some
  reads also defensively `String(val ?? "")`).

Existing unit tests missed it: they call `coerceRow` directly with clean strings
and never run `validateRowSchema` first (the worker runs validate → coerce on the
SAME row object — that ordering is what triggers the crash).

Fix (PR #328, merged squash `eaead66d`, off origin/master): one line —
`Value.Convert(schema, { ...row.values })` (shallow clone) so `row.values` stays
pristine strings for coerce/preValidate. Fixes both job types + immunizes future
ones. Added regression tests at the validator level (no-mutation for int+bool
fields) and a job-type test running the real worker sequence (reproduces the
exact prod TypeError without the fix). Runtime-only, NO migration → reaches prod
via a `v*.*.*` tag ([[reference_prod_deploy_tag_and_migrations]]).

Separate from the delta-based UI zero-stock fix in
[[project_inventory_panel_zero_out_of_stock]]. See also
[[project_bulk_catalog_import_update_mode]], [[project_elysia_strips_unknown_body_props]].
