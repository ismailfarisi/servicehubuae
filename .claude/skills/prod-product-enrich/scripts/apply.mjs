#!/usr/bin/env bun
/**
 * Apply a reviewed enrichment plan to prod products.
 *
 * Dry-run by default — it prints the exact PATCH payload for every product and
 * writes nothing. Pass --apply to actually send. That default exists because
 * the approval gate has to live in the tool, not only in the prose: a plan is
 * cheap to regenerate, an overwritten prod catalog is not.
 *
 *   bun scripts/apply.mjs plan.json                 # dry run
 *   bun scripts/apply.mjs plan.json --apply         # write
 *   bun scripts/apply.mjs plan.json --apply --force # also overwrite non-empty fields
 *
 * Two API semantics drive the whole merge strategy here, and both are
 * data-loss shaped if ignored (see references/api-contract.md):
 *
 *  1. `attributes` on PATCH is REPLACE-ALL. The service soft-deletes every
 *     product-level attribute row and re-inserts what you sent. Sending only
 *     the newly mapped attributes silently unmaps everything already there.
 *     So we always send existing ∪ additions, and we refuse to shrink the set.
 *
 *  2. `translations` is upsert-by-locale that overwrites the WHOLE row, and an
 *     empty `name` DELETES the row. So we rebuild the Arabic row from the
 *     live one field-by-field and never send it without a name.
 */

import {
  api,
  arabicTranslation,
  baseUrl,
  isBlank,
  login,
  mapLimit,
  parseArgs,
  productLevelAttributes,
  readJson,
  writeJson,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const planPath = args._[0];
if (!planPath) {
  console.error("Usage: bun scripts/apply.mjs <plan.json> [--apply] [--force]");
  process.exit(1);
}

const plan = readJson(planPath);
const base = baseUrl({ base: args.base ?? plan.base });
const live = Boolean(args.apply);
const force = Boolean(args.force);
const token = await login(base, args);

const PRODUCT_FIELDS = [
  "name",
  "short_description",
  "description",
  "ingredients",
  "usage_instructions",
  "meta_title",
  "meta_description",
  "tags",
];

const TRANSLATION_FIELDS = [
  "name",
  "short_description",
  "description",
  "ingredients",
  "usage_instructions",
  "meta_title",
  "meta_description",
];

function buildPayload(current, entry) {
  const payload = {};
  const changes = [];
  const warnings = [];

  // ── Product-level English fields ────────────────────────────────────────
  for (const field of PRODUCT_FIELDS) {
    const proposed = entry.product?.[field];
    if (proposed === undefined || proposed === null) continue;
    if (field === "tags") {
      if (!Array.isArray(proposed) || !proposed.length) continue;
      if (current.tags?.length && !force) continue;
      payload.tags = proposed;
      changes.push("tags");
      continue;
    }
    if (isBlank(proposed)) continue;
    // "Fill what's missing" is the whole point — an existing value is a human
    // decision until the operator explicitly opts into --force.
    if (!isBlank(current[field]) && !force) continue;
    payload[field] = proposed;
    changes.push(field);
  }

  // ── Attributes: union, never replace ────────────────────────────────────
  const existingRows = productLevelAttributes(current);
  const existing = existingRows.map((row) => ({
    attribute_id: row.attribute_id,
    value_id: row.attribute_value_id ?? null,
    text_value: row.text_value ?? null,
  }));
  const alreadyMapped = new Set(existing.map((row) => row.attribute_id));

  const additions = (entry.attributes ?? []).filter((row) => {
    if (!row?.attribute_id) return false;
    if (alreadyMapped.has(row.attribute_id)) return false; // never restate a human's choice
    return Boolean(row.value_id) || Boolean(row.text_value?.trim?.());
  });

  if (additions.length) {
    const union = [
      ...existing,
      ...additions.map((row) => ({
        attribute_id: row.attribute_id,
        value_id: row.value_id ?? null,
        text_value: row.text_value?.trim?.() || null,
      })),
    ];
    if (union.length < existing.length) {
      warnings.push("attribute union smaller than existing set — refusing to send attributes");
    } else {
      payload.attributes = union;
      changes.push(`attributes(+${additions.length}, keeping ${existing.length})`);
    }
  }

  // ── Arabic translation: rebuild the full row ────────────────────────────
  const ar = arabicTranslation(current);
  const proposedAr = entry.translations_ar ?? entry.translations?.find?.((t) => t.locale === "ar");
  if (proposedAr) {
    const row = { locale: "ar" };
    const arChanges = [];
    for (const field of TRANSLATION_FIELDS) {
      const currentValue = ar?.[field] ?? null;
      const proposed = proposedAr[field];
      if (!isBlank(currentValue) && !force) {
        row[field] = currentValue;
        continue;
      }
      if (!isBlank(proposed)) {
        row[field] = proposed;
        arChanges.push(field);
      } else {
        row[field] = currentValue;
      }
    }
    // An empty name deletes the translation row outright. Refuse rather than
    // risk removing an Arabic listing that already exists.
    if (isBlank(row.name)) {
      warnings.push("skipped ar translation — resulting name would be empty (that DELETES the row)");
    } else if (arChanges.length) {
      payload.translations = [row];
      changes.push(`ar(${arChanges.join(",")})`);
    }
  }

  return { payload, changes, warnings };
}

/** Re-read the product and confirm the fields we sent actually landed. The
 *  admin update whitelists fields server-side, so a silently-dropped key is a
 *  real failure mode worth catching rather than assuming success. */
function verify(after, payload) {
  const failures = [];
  for (const [key, value] of Object.entries(payload)) {
    if (key === "attributes") {
      const now = productLevelAttributes(after).length;
      if (now < value.length) failures.push(`attributes: expected ${value.length}, found ${now}`);
      continue;
    }
    if (key === "translations") {
      const ar = arabicTranslation(after);
      if (!ar || isBlank(ar.name)) failures.push("translations: no ar row after write");
      continue;
    }
    if (key === "tags") {
      if (!after.tags?.length) failures.push("tags: still empty");
      continue;
    }
    if (isBlank(after[key])) failures.push(`${key}: still empty`);
  }
  return failures;
}

const results = await mapLimit(plan.products ?? [], 2, async (entry) => {
  const record = { id: entry.id, name: entry.name ?? null };
  try {
    const current = await api(base, token, `/admin/products/${entry.id}`);
    record.name = current.name;
    const { payload, changes, warnings } = buildPayload(current, entry);
    record.changes = changes;
    record.warnings = warnings;
    record.payload = payload;

    if (!Object.keys(payload).length) {
      record.status = "skipped";
      record.reason = warnings.length ? warnings.join("; ") : "nothing to fill";
      return record;
    }
    if (!live) {
      record.status = "dry-run";
      return record;
    }

    await api(base, token, `/admin/products/${entry.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    const after = await api(base, token, `/admin/products/${entry.id}`);
    const failures = verify(after, payload);
    record.status = failures.length ? "verify-failed" : "applied";
    if (failures.length) record.failures = failures;
  } catch (error) {
    record.status = "error";
    record.error = error.message;
  }
  return record;
});

const counts = results.reduce((acc, row) => {
  acc[row.status] = (acc[row.status] ?? 0) + 1;
  return acc;
}, {});

console.log(`\n${live ? "APPLIED" : "DRY RUN"} against ${base}\n`);
for (const row of results) {
  const marker = { applied: "✓", "dry-run": "·", skipped: "–", "verify-failed": "!", error: "✗" }[row.status];
  console.log(`${marker} ${row.name ?? row.id}`);
  if (row.changes?.length) console.log(`    ${row.changes.join(" | ")}`);
  if (row.reason) console.log(`    ${row.reason}`);
  for (const warning of row.warnings ?? []) console.log(`    WARN ${warning}`);
  for (const failure of row.failures ?? []) console.log(`    FAIL ${failure}`);
  if (row.error) console.log(`    ERROR ${row.error}`);
}
console.log(`\n${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join("  ")}`);

const logPath = String(args.log ?? (live ? "apply-log.json" : "dry-run-log.json"));
writeJson(logPath, { base, live, force, ran_at: new Date().toISOString(), counts, results });
console.log(`Wrote ${logPath}`);

if (!live) console.log("\nNothing was written. Re-run with --apply once the plan is approved.");
