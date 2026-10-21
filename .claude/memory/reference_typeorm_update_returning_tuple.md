---
name: reference_typeorm_update_returning_tuple
description: "TypeORM manager.query() returns [rows,count] for UPDATE/DELETE, flat rows for SELECT/INSERT"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 7d7dc960-443b-4fe0-8776-f087ba12bce1
---

TypeORM 0.3.28 `EntityManager.query()` / `AppDataSource.query()` returns a
2-element tuple `[rows, rowCount]` for **UPDATE** and **DELETE** statements
(even with `RETURNING`), but a **flat rows array** for SELECT/INSERT. Verified
empirically: `UPDATE ... RETURNING id` → `[[{id}], 1]`, so `result[0].id` is
`undefined` and `result.length` is always 2. Read the rows with
`const [rows] = await manager.query(...)`.

This bit 4 raw-SQL sites in product-service bulk code (all fixed, PR #329
MERGED to master, squash commit ee4b7ecd — the only commit past tag v0.1.81):
- inventory-update writeBatch → **crashed** prod bulk inventory update with
  `null value in column "entity_id" of relation "bulk_import_job_row_changes"`
  (undefined entityId hit the diff-log NOT NULL col; INSERT fallback never ran).
  Only surfaced after [[project_bulk_value_convert_mutation]] (#328) removed the
  earlier coerceRow `.trim` crash that had stopped the job before writeBatch.
- flash-deal-delete writeBatch, bulk.service revert, image-fetch orphan
  recovery → silent (no crash): logged/reindexed nothing, wrong counts.

Shipped to prod as v0.1.82 (deploy success, [[reference_prod_deploy_tag_and_migrations]]),
runtime-only (no migration). Final behavioral proof = re-run the vendor bulk
inventory upload on prod (CSV `V14-05,,30,...` hits the UPDATE path).
