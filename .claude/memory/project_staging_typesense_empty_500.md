---
name: project_staging_typesense_empty_500
description: "Staging /products + /products/suggest returning 500 on EVERY query usually means Typesense has no `products` collection (empty volume after container recreate) — fix with a reindex"
metadata: 
  node_type: memory
  type: project
  originSessionId: d47e4472-d4ba-4f0b-979e-5fd0f4de706e
---

On Netcup staging, when `GET /products` (search, category, browse-all) AND `GET /products/suggest` all return a generic `500 {"error":"UNKNOWN"}`, the cause is almost always Typesense having **zero collections** — the `products` collection doesn't exist, so every search throws `ObjectNotFound: HTTP 404 | Not found` (visible in `docker logs mypickuae-product-service-1`). DB is fine in this state (e.g. `/categories/:slug` returns 200), which isolates it to Typesense.

Why it happens: the typesense container comes up with a fresh/empty data volume (recreate, `--force-recreate`, volume reset) and `ensureCollection()` at product-service startup didn't (re)create it — so the index is just gone. An *empty* collection returns 0 results, not 500; a *missing* collection 404s → 500.

**Fix (no admin JWT needed):** run the self-contained reindex directly inside the product-service container — `SearchReindexService.reindexAll()` drops+recreates the collection and indexes all `status=published` products:
```
ssh mypickuae-staging  # 89.58.29.111, key netcup_staging
# base64 a tiny script that imports /app/apps/product-service/src/domain/search/search-reindex.service.ts
docker exec mypickuae-product-service-1 sh -c 'echo <b64> | base64 -d > /tmp/reindex.ts && cd /app && bun /tmp/reindex.ts'
```
Container runs source TS via bun (`bun run apps/product-service/src/index.ts`), so importing the .ts service works. The HTTP path `POST /admin/search/reindex` (BullMQ) also exists but needs an admin/super_admin token. `.env` on the box is root-only (chmod 600) — pull `TYPESENSE_API_KEY` from `docker exec ... printenv` instead. Staging dataset is small (~96 published products).

Diagnose vs prod: prod's equivalent is a *stale* index (see [[project_prod_infra_and_listing_diag]]); staging's is a *missing* collection. Related: [[project_netcup_staging_live]], [[reference_prod_rds_ssm_debug]].
