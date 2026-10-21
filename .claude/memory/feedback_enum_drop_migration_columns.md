---
name: enum-drop-migration-touch-every-column
description: "When dropping a value from a Postgres enum, the migration must DROP DEFAULT first AND re-cast every column typed by that enum, not just the obvious one"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 1a29c910-e96f-4d95-8b22-1a6a8d9f7d2c
---

When dropping a value from a Postgres enum (e.g. `users.role`), the migration MUST do BOTH:

1. **Drop any `DEFAULT` clause** on every affected column before the type swap. `ALTER COLUMN ... TYPE new_enum USING ...::text::new_enum` won't auto-cast a text default literal — Postgres errors with *"default for column 'X' cannot be cast automatically to type Y"*. Drop the default, swap the type, then `SET DEFAULT` again afterward.

2. **Re-cast EVERY column typed by the old enum**, not just the one you were thinking of. Find them with:
   ```bash
   grep -rn "enum.*MyEnum\|enumName.*my_enum" backend/libs/database/src/entities/
   ```
   If you miss one, `DROP TYPE my_enum_old` fails with *"cannot drop type X because other objects depend on it"*.

Also: if any rows have the value being dropped, `UPDATE` those rows to the replacement value BEFORE the type swap, in every affected table — not just `users`.

**Why:** Phase 3a vendor-membership migration hit both errors in sequence on staging deploy (PRs #147 + #148 to fix). The plan-write step should have enumerated every column typed by the enum, but only listed `users.role`. Missed `bulk_import_jobs.initiated_by_role`.

**How to apply:** When writing or reviewing any enum-modifying migration, do the audit pass first: grep for every entity using the enum, list them in the plan, and make sure the migration touches all of them (data rewrite + type alter). Same for the down() migration.
