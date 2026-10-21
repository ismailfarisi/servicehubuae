---
name: project_typeorm_upsert_partial_index
description: "TypeORM repo.upsert with bare conflictPaths fails against this repo's partial unique indexes (WHERE deleted_at IS NULL); must pass indexPredicate"
metadata: 
  node_type: memory
  type: project
  originSessionId: e6284df2-8085-41ce-bc8a-d696075551fb
---

Tables here use **partial** unique indexes for soft deletes (`... WHERE deleted_at IS NULL`), e.g. `uq_site_settings_key_active ON site_settings(key) WHERE deleted_at IS NULL`. TypeORM `repo.upsert(x, ["key"])` (or `{ conflictPaths: ["key"] }`) emits a bare `INSERT ... ON CONFLICT ("key")`, which Postgres refuses to match a *partial* index → runtime 500 `"there is no unique or exclusion constraint matching the ON CONFLICT specification"`.

**Why:** ON CONFLICT must name the index's predicate to match a partial index. An entity column-level `unique: true` would create a full constraint under `synchronize`, so mocked/synchronize tests pass while migration-built prod fails — silent drift.

**How to apply:** pass the predicate — `repo.upsert(x, { conflictPaths: ["key"], indexPredicate: "deleted_at IS NULL" })` (TypeORM 0.3.x). Do NOT "fix" it by adding a full unique constraint — that breaks soft-delete re-creation. Verify against the real schema, not synchronize: `EXPLAIN INSERT ... ON CONFLICT (col) WHERE deleted_at IS NULL ...` should show `Conflict Arbiter Indexes: <partial idx>`. Bit `AiSettingsRepository.update` (fixed in v0.1.25, #231). Related: [[project_typeorm_datasource_registration]].
