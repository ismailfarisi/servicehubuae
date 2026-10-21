---
name: project-typeorm-datasource-registration
description: "New TypeORM entities must be added to data-source.ts entities[] array, not just the barrel — else runtime \"No metadata\" error"
metadata: 
  node_type: memory
  type: project
  originSessionId: 3e3cffec-7329-418b-9c93-ebb74545b771
---

`backend/libs/database/src/data-source.ts` registers entities via an **explicit `entities` array** (with explicit imports), NOT a glob. Adding a new entity to `entities/index.ts` (the barrel) is **not enough** — you must also import it and add it to the `entities` array in `data-source.ts`, or every repository call throws `Error: No metadata for "X" was found` at runtime.

**Why it bites:** migrations run fine (raw SQL, no metadata), `tsc` passes (the class exists), and pure-function unit tests pass (they never hit the DB) — so the gap only surfaces when a live request does a `getRepository(X).find/save`. There is exactly ONE `new DataSource(...)` in the backend; every service (product, order, etc.) shares `@mypickuae/database`'s `AppDataSource`, so fixing the array fixes all services at once.

**How to apply:** whenever you add an entity, update both `entities/index.ts` AND `data-source.ts` (import + array), then verify with a live request, not just tsc/migrate. See [[reference-local-dev-stack]] for booting a service to test.
