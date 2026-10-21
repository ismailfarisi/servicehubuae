#!/usr/bin/env bun
/**
 * Audit prod products for missing attribute mappings, Arabic translations,
 * SEO fields, tags, and descriptive copy.
 *
 * Read-only. Writes an audit JSON that is the sole input to the drafting step.
 *
 *   bun scripts/audit.mjs --status published --limit 50 --out audit.json
 *   bun scripts/audit.mjs --brand "Beauty of Joseon" --out audit.json
 *   bun scripts/audit.mjs --vendor <uuid> --out audit.json
 *   bun scripts/audit.mjs --ids <uuid>,<uuid> --out audit.json
 *
 * --status, --vendor, --category and --search map onto GET /admin/products
 * query params. --brand does NOT: that endpoint has no brand filter, so the
 * match happens client-side over the paginated list (which does carry each
 * product's brand). That means a brand with few products in a large catalogue
 * costs a scan — bounded by --max-scan, and the scan total is always reported
 * so a truncated result never reads as "that's the whole brand".
 *
 * --limit caps how many products are audited (default 25) so an exploratory
 * run can never turn into a full-catalogue crawl by accident.
 */

import {
  analyzeProduct,
  api,
  baseUrl,
  login,
  mapLimit,
  parseArgs,
  printAuditTable,
  writeJson,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const base = baseUrl(args);
const cap = Number(args.limit ?? 25);
const outPath = String(args.out ?? "audit.json");

const token = await login(base, args);

const brandFilter = args.brand ? String(args.brand).trim().toLowerCase() : null;
const maxScan = Number(args["max-scan"] ?? 2000);

/** Match a list item against --brand. Accepts a brand id or slug (exact) or a
 *  name (substring, case-insensitive) so "dior" finds "Christian Dior" without
 *  the operator having to look up a uuid. The distinct names actually matched
 *  are reported back, which is how you catch an over-broad substring. */
function matchesBrand(item) {
  if (!brandFilter) return true;
  const brand = item.brand;
  if (!brand) return false;
  const id = String(brand.id ?? "").toLowerCase();
  const slug = String(brand.slug ?? "").toLowerCase();
  const name = String(brand.name ?? "").toLowerCase();
  return id === brandFilter || slug === brandFilter || name.includes(brandFilter);
}

/** Enumerate candidate product ids. The admin list endpoint does NOT return
 *  translations or attribute values, so this is only a cheap id source — the
 *  real gap analysis needs the per-product detail fetch below. */
async function listProductIds() {
  if (args.ids) {
    return {
      ids: String(args.ids)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      scanned: 0,
      brandNames: [],
      truncated: false,
    };
  }

  const ids = [];
  const brandNames = new Set();
  let scanned = 0;
  let exhausted = false;
  const query = new URLSearchParams({ limit: "100" });
  if (args.status) query.set("status", String(args.status));
  if (args.vendor) query.set("vendor_id", String(args.vendor));
  if (args.category) query.set("category_id", String(args.category));
  if (args.search) query.set("search", String(args.search));

  for (let page = 1; ids.length < cap && scanned < maxScan; page++) {
    query.set("page", String(page));
    const data = await api(base, token, `/admin/products?${query}`);
    const items = data?.items ?? [];
    if (!items.length) {
      exhausted = true;
      break;
    }
    for (const item of items) {
      scanned++;
      if (!matchesBrand(item)) continue;
      if (item.brand?.name) brandNames.add(item.brand.name);
      ids.push(item.id);
      if (ids.length >= cap) break;
    }
    if (items.length < 100) {
      exhausted = true;
      break;
    }
  }

  // Truncated means "there may be more of this brand we never looked at" —
  // either we filled the --limit or we hit the scan bound mid-catalogue.
  return { ids, scanned, brandNames: [...brandNames], truncated: !exhausted };
}

const categoryAttributeCache = new Map();
async function getCategoryAttributes(categoryId) {
  if (!categoryId) return [];
  if (!categoryAttributeCache.has(categoryId)) {
    categoryAttributeCache.set(
      categoryId,
      api(base, token, `/categories/by-id/${categoryId}/attributes`).catch(() => []),
    );
  }
  return categoryAttributeCache.get(categoryId);
}


const { ids, scanned, brandNames, truncated } = await listProductIds();
if (!ids.length) {
  console.error(
    brandFilter
      ? `No products matched brand "${args.brand}" (scanned ${scanned}). Check the spelling, or pass the brand slug/uuid — the match is on id, slug, or a substring of the name.`
      : "No products matched the filters.",
  );
  process.exit(1);
}

const audited = await mapLimit(ids, 3, async (id) => {
  const product = await api(base, token, `/admin/products/${id}`);
  const categoryAttributes = await getCategoryAttributes(product.category_id);
  return analyzeProduct(product, categoryAttributes);
});

const needsWork = audited.filter(
  (row) =>
    row.gaps.missing_attributes.length ||
    row.gaps.missing_ar_fields.length ||
    row.gaps.missing_en_fields.length,
);

writeJson(outPath, {
  base,
  generated_at: new Date().toISOString(),
  filters: {
    status: args.status ?? null,
    brand: args.brand ?? null,
    vendor: args.vendor ?? null,
    category: args.category ?? null,
    ids: args.ids ?? null,
    limit: cap,
  },
  brand_names_matched: brandNames,
  scanned_count: scanned,
  truncated,
  audited_count: audited.length,
  needs_work_count: needsWork.length,
  products: audited,
});

console.log(`\nAudited ${audited.length} product(s) on ${base} — ${needsWork.length} need work\n`);
if (brandFilter) {
  console.log(
    `Brand "${args.brand}" matched: ${brandNames.join(", ") || "(none)"}  (scanned ${scanned} products)`,
  );
  if (brandNames.length > 1) {
    console.log(
      "  NOTE: the filter matched more than one brand — narrow it with the exact slug or uuid if that wasn't intended.",
    );
  }
}
if (truncated) {
  console.log(
    `  NOTE: stopped at --limit ${cap}${scanned >= maxScan ? ` / --max-scan ${maxScan}` : ""}; there may be more matching products beyond this batch.`,
  );
}
if (brandFilter || truncated) console.log("");
printAuditTable(needsWork);
console.log(`\nWrote ${outPath}`);
