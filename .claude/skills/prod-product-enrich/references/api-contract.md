# MyPickUAE admin product API — the parts that bite

Source of truth: `backend/apps/product-service/src/routes/admin-product.routes.ts` and
`backend/apps/product-service/src/domain/product/product.service.ts`. If behaviour here
disagrees with the code, the code wins — re-read it and update this file.

Prod base: `https://api.mypickuae.com` (Caddy → api-gateway → product-service).
All admin routes require an `admin` or `super_admin` JWT (`requireRole` at
`admin-product.routes.ts:28`) and are audited via `auditPlugin`.

## Endpoints used

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login` | → `data.tokens.accessToken`. May return `data.requires_2fa` instead. |
| POST | `/auth/2fa/login-verify` | `{ user_id, code }` → same token shape. |
| GET | `/admin/products` | Paginated list. **Does not include translations or attributeValues** — id source only. Filters: `status`, `vendor_id`, `category_id`, `search`, `page`, `limit` (max 100). **No brand filter** — `adminList` only builds WHERE clauses for those four, so `audit.mjs --brand` matches client-side on the `brand` relation each row already carries. `search` hits `p.name` and `p.sku` only, so it is not a brand shortcut either. |
| GET | `/admin/products/:id` | Full detail *with* `translations` and `attributeValues` (+ `attribute`, `attributeValue`). This is the only view that shows the gaps. |
| GET | `/categories/by-id/:id/attributes` | `category_attributes` rows with `attribute` and `attribute.values`. Note the `by-id` segment — `/categories/:id/attributes` is a different (slug) route. |
| PATCH | `/admin/products/:id` | The write. Triggers `reindexProduct` on success. |

## PATCH body — accepted fields

Server-side whitelist (`product.service.ts` `adminUpdate` → `allowed`):
`name`, `description`, `short_description`, `rich_description`, `ingredients`,
`usage_instructions`, `editorial`, `category_id`, `brand_id`, `price`,
`compare_at_price`, `cost_price`, `sku`, `barcode`, `weight_grams`,
`dimensions_cm`, `country_of_origin`, `requires_shipping`, `tags`,
`meta_title`, `meta_description`, `is_featured`, `is_digital`, `is_customizable`.

Plus two nested collections handled separately: `attributes` and `translations`.
`meta_keywords` is accepted as `string[]` and collapsed to a comma-joined string.

Anything outside the whitelist is dropped silently — which is why `apply.mjs`
re-reads the product and verifies each field actually landed.

## Trap 1 — `attributes` is replace-all

```ts
// product.service.ts — replaceProductAttributes
await manager.softDelete(ProductAttributeValue, { product_id, variant_id: IsNull() });
for (const attr of attributes) { /* re-insert */ }
```

Sending `attributes: [{ attribute_id: X, value_id: Y }]` does not add X — it
makes X the *only* product-level attribute on the product. Every previously
mapped attribute is soft-deleted.

**Always send `existing ∪ additions`.** `apply.mjs` builds that union from a
fresh `GET /admin/products/:id` at write time (not from the audit snapshot,
which may be minutes stale) and refuses to send a set smaller than what's
already there.

Variant-level rows (`variant_id` set) are untouched by this — the soft-delete
filters on `variant_id IS NULL`. Do not attempt to write variant axes through
this endpoint; they belong to the variant.

## Trap 2 — `translations` overwrites the row, and blank name deletes it

```ts
// product.service.ts — upsertProductTranslations
const name = this.normalizeTranslationText(entry.name);
if (!name) { if (existing) await translationRepo.remove(existing); continue; }
const patch = { ...every field, nulls included... };
```

Two consequences:
- Sending `{ locale: "ar", name: "..." }` with no `description` **nulls out** an
  existing Arabic description. Always rebuild the full row from the live one.
- Sending an empty/whitespace `name` **hard-removes** the Arabic listing.
  `apply.mjs` refuses to send a translation whose merged name is blank.

`locale` is a free varchar(10); the codebase uses `"ar"` for Arabic.

## Trap 3 — the storefront reads Typesense, not Postgres

Product listing is 100% Typesense-backed. `adminUpdate` calls
`reindexProduct(saved.id)` so an API write self-heals the index — this is the
main reason to write through the API rather than SQL. Only `status='published'`
products are indexed, so enriching a `draft` product will not change anything a
customer sees until it's published.

If a batch of writes succeeded but the storefront still shows stale data, the
reindex is the suspect: enqueue the BullMQ `search-reindex` queue (job name
`reindex`) from inside `mypickuae-product-service-1`.

## Why the audit may read SQL but writes never do

`audit-sql.mjs` reads the catalogue directly (one `SELECT`, `sql/audit.sql`).
That's a strict win: the admin list endpoint can't filter by brand and doesn't
return translations or attribute values, so an API audit costs a full scan plus
a detail fetch per product.

Writing the same way is a different proposition, because the service layer is
enforcing invariants the schema does not:

- **`product_attribute_values` has no unique constraint** — no `@Unique`, no
  index. Nothing at the database level stops a second identical row. The only
  reason the table stays clean is that `replaceProductAttributes` soft-deletes
  and re-inserts inside a transaction. A hand-written `INSERT` backfill that
  gets run twice silently doubles every row.
- **`product_translations` has a plain `UNIQUE (product_id, locale)`** — *not*
  partial on `deleted_at`. A soft-deleted Arabic row still occupies the slot, so
  a naive `INSERT … ON CONFLICT DO NOTHING` does nothing at all and reports
  success. Resurrecting means clearing `deleted_at` on the existing row.
- **No reindex.** The storefront reads Typesense exclusively. A SQL write leaves
  the new Arabic name invisible to customers until someone enqueues a reindex.
- **No audit-log row.** `auditPlugin` records who changed what; SQL bypasses it.

At a few hundred products per run, `PATCH` per product costs a couple of minutes
and buys all four of those for free. Direct SQL writes only start to pay off in
the thousands, and then they need every guard above written out by hand.

## Attribute shapes

`AttributeType`: `text | number | boolean | select | multi_select | color | date`.

- `select` / `color` / `multi_select` → set `value_id` to an id from the
  category attribute's `allowed_values`. Never invent a UUID; never put the
  label in `text_value` when a matching option id exists, because facets and
  filters key off the value id.
- `text` / `number` / `date` / `boolean` → set `text_value` (a string; the
  column is `varchar(500)`).
- `is_variant: true` attributes are variant axes (shade, size). Exclude them
  from product-level mapping — `audit.mjs` already filters them out.
- `is_required: true` on the `category_attributes` row means the category
  expects it. These are the highest-value gaps to close: they drive faceted
  search and filtering on the PLP.

## Rate limits and load

Gateway limits are 1000 req/min per authenticated user, so throughput is not
the constraint. Product-service runs memory-capped on a single prod box and
each admin GET pulls a wide relation graph, so keep concurrency at 2–3 (the
scripts do). A reindex fires per write.
