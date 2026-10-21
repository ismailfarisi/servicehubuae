---
name: reference_new_dep_dual_typeorm_ci
description: "Adding a new npm dep to a backend service that uses typeorm can duplicate typeorm on CI's fresh install → typecheck fails though it passes locally; use node-redis `redis` (not `ioredis`) for Redis"
metadata: 
  node_type: memory
  type: reference
  originSessionId: a653443c-1852-4a13-a76c-1e12ecae9386
---

**Symptom:** After `bun add <pkg>` to a backend service (e.g. cms-service) that depends on typeorm, CI's "Lint, Test & Build" **Typecheck** step fails with dozens of `TS2322 FindOptionsWhere<X> not assignable` and `TS2345 EntityManager not assignable` errors in PRE-EXISTING service code (banner/bid/header-nav/layout services) — NOT in the files you changed. Root cause: two `typeorm@0.3.28` copies with different bun sub-hashes (`+cd199d49e4cfb5e3` vs `+707c61c0b4628ca8`) → their `EntityManager`/`FindOptionsWhere` types are treated as incompatible. Check with `ls node_modules/.bun/ | grep typeorm@` (want ONE line). It passes LOCALLY when your install happens to resolve a single copy, then breaks on CI's fresh install.

**Trigger seen (PR #339):** `bun add ioredis` in cms-service. ioredis' dep tree perturbed bun's hoisting and split typeorm into two copies. `bun run typecheck` in the package looked clean locally; `bunx turbo run typecheck --force` (CI-equivalent) reproduced it.

**Fix:** Don't add `ioredis`. The repo's standard Redis client is **node-redis `redis`** (`import { createClient, type RedisClientType } from "redis"`, `redis: "^5.11.0"`) — see `libs/plugins/src/rate-limiter.ts`, `libs/guards/src/token-version.ts`. It's already in every service's tree via `@mypickuae/guards`/`@mypickuae/plugins`, so declaring it as a direct dep does NOT duplicate typeorm. node-redis pub/sub: publisher `await client.connect(); await client.publish(ch, msg)`; subscriber needs a DEDICATED connection `const sub = createClient(...); await sub.connect(); await sub.subscribe(ch, (m)=>...)`; cleanup `await sub.unsubscribe(ch); await sub.quit()`. Config via `config.redis.{host,port,password}` + `socket:{host,port}` (NOT `config.bullmq.redisUrl`, which is bullmq-only).

Note: tsc needs the dep DECLARED (transitive-only import → `TS2307 Cannot find module` even though bun runtime resolves it). Related: [[feedback_typecheck_before_push_backend]] (run per-package `bun run typecheck`; CI gate is `bunx turbo run typecheck`), [[project_support_chat_slice1]].
