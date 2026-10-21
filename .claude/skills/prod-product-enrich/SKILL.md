---
name: prod-product-enrich
description: Fill in missing product data on the MyPickUAE production catalogue — unmapped category attributes, missing Arabic (ar) translations, empty SEO fields, tags, and descriptive copy — via the admin API with a mandatory dry-run and approval gate. Use this whenever the user mentions backfilling, enriching, completing, or fixing product metadata, attributes, attribute mapping, facets, Arabic translations, localization, or SEO on prod or live products, and also when they describe the symptom rather than the fix ("products aren't showing up in filters", "the Arabic site is showing English names", "our listings have no meta descriptions", "vendor X's products are missing data"). Prefer this over hand-writing SQL or ad-hoc PATCH scripts against prod, because the admin API has two replace-all footguns that silently destroy existing data.
---

# Enriching production product data

Fill gaps in the live catalogue: category attributes that were never mapped,
products with no Arabic translation, empty SEO fields, tags, and descriptive
copy. Writes go through the admin API so every change is validated, audited,
and reindexed into Typesense.

**This touches production data that customers see.** The flow below is
audit → draft → *the user approves* → apply → verify. The apply script is
dry-run by default and needs `--apply` to write anything. Don't route around
that, and don't apply a plan the user hasn't actually looked at.

## Before anything else: read the API contract

Read `references/api-contract.md` now, before writing any plan. Two behaviours
in `product.service.ts` are data-loss shaped and are not guessable from the
endpoint names:

- **`attributes` on PATCH is replace-all.** It soft-deletes every product-level
  attribute row, then inserts what you sent. Sending just the newly mapped
  attribute unmaps everything else on that product.
- **`translations` overwrites the whole locale row, and a blank `name` deletes
  it.** A partial Arabic patch nulls the fields you omitted.

`scripts/apply.mjs` handles both correctly (union-merge from a freshly fetched
copy of the product, refuses to shrink the attribute set, refuses to send a
nameless translation). That's why plans list *additions only* and the script
does the merging — never hand-assemble a PATCH body yourself.

## Setup

The scripts need an admin token. Ask the user to export credentials rather than
putting them in a file or on a command line:

```bash
export MYPICKUAE_ADMIN_TOKEN='<token from an authenticated admin-panel session>'
# or
export MYPICKUAE_ADMIN_EMAIL='...' MYPICKUAE_ADMIN_PASSWORD='...'
```

If the account has 2FA, login returns `requires_2fa` and the scripts need
`--otp <code>`. Ask for the code right before running — it expires in 30
seconds. The auth service locks an account after 5 failed attempts, so if a
credential is rejected, stop and ask; never retry in a loop.

Default base URL is `https://api.mypickuae.com` (prod). Override with `--base`
to rehearse against staging (`https://api.stage.mypickuae.com`) — worth doing for
a first run with a new operator.

Run the scripts from the skill directory with `bun` (or `node` ≥ 18). Work in a
scratch directory so the JSON files don't land in the repo.

## Step 1 — Scope it with the user

Ask what to cover before running anything. A full-catalogue crawl is rarely
what someone means, and every product costs a detail fetch plus a reindex.

Good scoping questions: one vendor, one category, only `published` products, or
a specific list of ids? How many in this batch? The audit defaults to 25 for
exactly this reason.

## Step 2 — Audit

There are two audit scripts. They produce **the same `audit.json`** and share the
same gap logic (`analyzeProduct` in `lib.mjs`), so they can't drift — only the
data source differs. Pick by how you're scoping the batch:

| | `audit-sql.mjs` | `audit.mjs` |
|---|---|---|
| Source | one read-only SQL query | admin API |
| Brand filter | server-side, exact | client-side scan |
| Cost for one brand | 1 query | 1 request per product, plus the scan |
| Reports | true total matching | only what it scanned |
| Needs | SSH key (staging) or AWS SSM (prod) | just an admin token |

**Default to `audit-sql.mjs` when scoping by brand, vendor, or category** — the
API path needs a paginated scan to find a brand (one small brand in a
223-product catalogue cost 223 requests) and can only report what it looked at.
Use `audit.mjs` for a handful of known ids, or when you don't have box access.

```bash
# SQL (preferred for a brand)
bun scripts/audit-sql.mjs --env staging --brand "Beauty of Joseon" --out audit.json
bun scripts/audit-sql.mjs --env prod --brand teatro --status published --out audit.json
bun scripts/audit-sql.mjs --env prod --print-sql      # show the query, run nothing

# API
bun scripts/audit.mjs --status published --limit 25 --out audit.json
bun scripts/audit.mjs --brand "Beauty of Joseon" --out audit.json
bun scripts/audit.mjs --ids <uuid>,<uuid> --out audit.json
```

`audit-sql.mjs` is SELECT-only and never writes. **Writes still go through
`apply.mjs` and the admin API** even when the audit came from SQL — that's what
keeps the Typesense reindex and the audit-log row happening. See the reference
for why direct SQL writes are a trap here.

Read-only. It enumerates products, fetches each one's full detail (the list
endpoint doesn't return translations or attribute values), pulls the category's
attribute definitions with their allowed value ids, and reports per product:

- `missing_attributes` — category attributes with no product-level row, each
  with `type`, `is_required`, and `allowed_values` (real UUIDs to choose from).
  Variant axes are excluded; they belong to variants, not the product.
- `missing_ar_fields` — Arabic fields that are empty. A field is only flagged
  when the English side has something to translate.
- `missing_en_fields` — empty English copy, SEO fields, and tags.

Show the user the printed summary table and the counts before moving on.

**About `--brand`.** The admin list endpoint has no brand filter, so this one is
matched client-side while paginating. Two consequences worth passing on to the
user rather than hiding:

- It matches a brand **id or slug exactly, or a substring of the name** — so
  `--brand dior` also catches "Christian Dior". The audit prints every distinct
  brand name it matched and warns when there's more than one; if that wasn't
  intended, re-run with the exact slug or uuid.
- Finding a small brand in a large catalogue means scanning. The scan total is
  always printed, and the run stops at `--max-scan` (default 2000). When the
  output says it stopped early, say so plainly — "the first 25 of this brand",
  not "this brand". Combine with `--status published` to cut the scan down.

## Step 3 — Draft a plan

Read `references/content-guidance.md`, then write `plan.json` from `audit.json`.

```json
{
  "base": "https://api.mypickuae.com",
  "products": [
    {
      "id": "<product uuid>",
      "product": { "short_description": "…", "meta_title": "…", "tags": ["…"] },
      "translations_ar": { "name": "…", "short_description": "…", "meta_title": "…" },
      "attributes": [{ "attribute_id": "<uuid>", "value_id": "<uuid from allowed_values>" }],
      "needs_human": ["Fragrance Family — not stated in the source"]
    }
  ]
}
```

Rules that matter more than completeness:

- **Additions only.** Omit any field the audit shows as already filled. The
  script skips non-empty fields anyway (unless `--force`), but a plan that
  restates existing values makes the diff unreadable for the reviewer.
- **Never invent facts.** Ingredient lists, claims ("dermatologist tested",
  "SPF 50"), concentrations, and certifications are legal assertions on beauty
  products. If the source doesn't state it, put it in `needs_human` and move
  on. A remaining gap is a fine outcome; a confident fabrication in prod is not.
- **Attribute values come from `allowed_values`.** Never synthesise a UUID.
  Match on meaning, not string similarity. Skip an attribute the source can't
  support — a wrong facet value puts the product in filter results where it
  doesn't belong, which is worse than being absent from them.
- **Arabic names are fully Arabic, brand included** — `… من تياترو`, not
  `… من Teatro`. Transliterate invented names, translate descriptive ones. See
  the content guidance for how to tell them apart.

Products where everything worth doing lands in `needs_human` should simply be
left out of `plan.json`, with a note to the user.

## Step 4 — Dry run, then get approval

```bash
bun scripts/apply.mjs plan.json
```

This writes nothing. It re-fetches each product, builds the exact PATCH payload
it would send (including the merged attribute union and the rebuilt Arabic
row), prints a per-product change summary, and saves `dry-run-log.json`.

Show the user the dry-run output and any `needs_human` items, then **wait for
an explicit go-ahead**. If the output shows `WARN` lines — a refused attribute
union or a skipped nameless translation — explain them rather than working
around them; they mean the plan and the live data disagree.

## Step 5 — Apply

```bash
bun scripts/apply.mjs plan.json --apply
```

Sequential-ish (concurrency 2) with retry on 429/5xx. After each PATCH it
re-reads the product and verifies the fields actually landed — the server
whitelists update fields, so a silently-dropped key is a real failure mode.
Results land in `apply-log.json` with per-product status: `applied`,
`skipped`, `verify-failed`, or `error`.

`--force` also overwrites fields that already have content. Only use it when
the user explicitly asks to replace existing values, and say plainly that it
does so.

## Step 6 — Verify

`adminUpdate` reindexes each product into Typesense automatically, so the
storefront should reflect changes within seconds. Confirm:

- Every product in `apply-log.json` shows `applied`. Investigate anything else
  rather than re-running blindly — a `verify-failed` usually means a field
  isn't in the server's update whitelist.
- Spot-check one product on the live storefront, including the Arabic locale.
- Only `status='published'` products are indexed. Enriching a `draft` product
  changes nothing customer-visible until it's published — mention this if the
  batch included drafts.

Report what changed, what was skipped and why, and the `needs_human` list, so
the gaps that need catalogue authority land with a person who has it.
