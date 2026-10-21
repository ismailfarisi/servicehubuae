---
name: reference-bun-install-root-frozen-lockfile
description: "Run `bun install` at the repo ROOT with --frozen-lockfile; installing inside backend/ re-resolves and duplicates typeorm"
metadata: 
  node_type: memory
  type: reference
  originSessionId: dfafe8f8-ae44-4ce0-a093-b048cc7a33b1
---

**Only `bun.lock` at the repo ROOT is tracked** ("bun.lock is tracked for reproducible CI builds" — see `.gitignore`). `backend/bun.lock` is generated and ignored. Root `package.json` workspaces already cover the backend: `["apps/*","packages/*","backend/apps/*","backend/libs/*"]`.

So in a fresh worktree, install from the **repo root**:

```bash
bun install --frozen-lockfile   # at repo root, NOT backend/
```

Running `bun install` inside `backend/` bypasses the tracked root lockfile and re-resolves the floating `"typeorm": "^0.3.0"` / `"^0.3.20"` ranges in the service package.jsons. That pulls a **second typeorm copy** (e.g. 0.3.28 + 0.3.31), which is the known CI-typecheck breaker in [[reference-new-dep-dual-typeorm-ci]]. It also leaves a stray `backend/node_modules` shadowing the root one.

Verify after installing (want exactly one line):
```bash
ls node_modules/.bun | grep "^typeorm@"
```
If there are two, `rm -rf backend/node_modules backend/bun.lock` and reinstall from the root.

Note the split: **install** from the root, but **`bun test` must run from `backend/`** — from the root, importing the `@mypickuae/database` barrel crashes in TypeORM's `PrimaryGeneratedColumn` decorator (`undefined is not an object (evaluating 'object.constructor')`). Even pre-existing passing tests fail that way from the root, so it's the cwd, not your test. Related: [[reference-ci-bun-barrel-flake]], [[reference-worktree-db-test-invocation]].
