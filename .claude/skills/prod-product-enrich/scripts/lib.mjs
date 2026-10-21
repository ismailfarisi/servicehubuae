/**
 * Shared helpers for the prod-product-enrich skill.
 *
 * Everything here talks to the MyPickUAE admin API through the gateway, because
 * writing through PATCH /admin/products/:id gives us validation, an audit-log
 * row, and — critically — an automatic Typesense reindex. The storefront
 * listing is 100% Typesense-backed, so a direct SQL write would leave the new
 * Arabic name invisible to customers until someone remembers to reindex.
 *
 * Run with bun (preferred) or node >= 18.
 */

import fs from "node:fs";

const DEFAULT_BASE = "https://api.mypickuae.com";

export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      args._.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

export function baseUrl(args) {
  return String(args.base || process.env.MYPICKUAE_API_BASE || DEFAULT_BASE).replace(/\/+$/, "");
}

/**
 * Obtain an admin access token.
 *
 * Prefers MYPICKUAE_ADMIN_TOKEN so an operator can paste a token copied from an
 * already-authenticated admin-panel session and never put a password on the
 * box. Falls back to email/password. Note the auth service locks an account
 * after 5 failed attempts — never retry a rejected credential in a loop.
 */
export async function login(base, args) {
  const existing = process.env.MYPICKUAE_ADMIN_TOKEN?.trim();
  if (existing) return existing;

  const email = process.env.MYPICKUAE_ADMIN_EMAIL?.trim();
  const password = process.env.MYPICKUAE_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "No credentials. Set MYPICKUAE_ADMIN_TOKEN, or MYPICKUAE_ADMIN_EMAIL + MYPICKUAE_ADMIN_PASSWORD.",
    );
  }

  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Login failed (${res.status}): ${body?.message ?? body?.error ?? "unknown"}`);
  }

  if (body?.data?.requires_2fa) {
    const otp = String(args.otp || process.env.MYPICKUAE_ADMIN_OTP || "").trim();
    if (!otp) {
      throw new Error(
        "Account has 2FA enabled. Re-run with --otp <6-digit code> (codes expire in 30s, so ask for it right before running).",
      );
    }
    const verify = await fetch(`${base}/auth/2fa/login-verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user_id: body.data.user_id, code: otp }),
    });
    const verified = await verify.json().catch(() => ({}));
    if (!verify.ok) {
      throw new Error(`2FA verification failed (${verify.status}): ${verified?.message ?? ""}`);
    }
    return verified?.data?.tokens?.accessToken;
  }

  const token = body?.data?.tokens?.accessToken;
  if (!token) throw new Error("Login succeeded but no access token in response");
  return token;
}

/** Fetch with retry on 429 / 5xx. The gateway allows 1000 req/min per user, so
 *  we are nowhere near the limit at our concurrency — this is for transient
 *  upstream blips (product-service is memory-capped and does get restarted). */
export async function api(base, token, path, init = {}, attempt = 0) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if ((res.status === 429 || res.status >= 500) && attempt < 3) {
    const wait = 500 * 2 ** attempt;
    await new Promise((r) => setTimeout(r, wait));
    return api(base, token, path, init, attempt + 1);
  }

  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(
      `${init.method ?? "GET"} ${path} → ${res.status}: ${body?.message ?? body?.error ?? text.slice(0, 200)}`,
    );
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body?.data !== undefined ? body.data : body;
}

/** Run tasks with bounded concurrency. Keep this low (2–3): product-service
 *  runs memory-capped on a single prod box and each admin GET pulls a wide
 *  relation graph. */
export async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

export const isBlank = (value) =>
  value === null || value === undefined || (typeof value === "string" && !value.trim());

/** Live (non-soft-deleted) product-level attribute rows that actually carry a
 *  value. Variant-level rows (variant_id set) are deliberately excluded — they
 *  are the variant axes and belong to the variant, not the product. */
export function productLevelAttributes(product) {
  return (product.attributeValues ?? []).filter(
    (row) =>
      !row.deleted_at &&
      !row.variant_id &&
      (row.attribute_value_id || (row.text_value && row.text_value.trim())),
  );
}

export function arabicTranslation(product) {
  return (product.translations ?? []).find((row) => row.locale === "ar" && !row.deleted_at) ?? null;
}

/** Category attributes that are eligible for product-level mapping. Variant
 *  axes (is_variant) are excluded: writing them at product level would model
 *  a size/shade as a property of the whole product. */
export function mappableCategoryAttributes(categoryAttributes) {
  return (categoryAttributes ?? []).filter((row) => row.attribute && !row.attribute.is_variant);
}

export function summarizeAttribute(row) {
  const attribute = row.attribute ?? {};
  return {
    attribute_id: row.attribute_id ?? attribute.id,
    name: attribute.name,
    slug: attribute.slug,
    type: attribute.type,
    is_required: row.is_required ?? false,
    allowed_values: (attribute.values ?? []).map((value) => ({
      id: value.id,
      value: value.value,
      display_value: value.display_value,
    })),
  };
}

/**
 * Compute the gap report for one product. Shared by both audit paths — the API
 * audit and the SQL audit — so the definition of "missing" can never drift
 * between them. The SQL query is written to hand back the same shape the admin
 * detail endpoint returns, precisely so this function doesn't have to care
 * where the data came from.
 */
export function analyzeProduct(product, categoryAttributes) {
  const mappable = mappableCategoryAttributes(categoryAttributes);
  const existingRows = productLevelAttributes(product);
  const mappedIds = new Set(existingRows.map((row) => row.attribute_id));

  const missingAttributes = mappable
    .filter((row) => !mappedIds.has(row.attribute_id ?? row.attribute?.id))
    .map(summarizeAttribute);

  const ar = arabicTranslation(product);
  const arGaps = [];
  if (!ar || isBlank(ar.name)) arGaps.push("name");
  for (const field of ["description", "ingredients", "usage_instructions"]) {
    // Only flag an Arabic field when the English side actually has content to
    // translate — an empty Arabic ingredients list is correct for a product
    // that has no ingredients recorded at all.
    if (!isBlank(product[field]) && (!ar || isBlank(ar[field]))) arGaps.push(field);
  }
  for (const field of ["meta_title", "meta_description"]) {
    if (!ar || isBlank(ar[field])) arGaps.push(field);
  }

  const englishGaps = [];
  for (const field of [
    "description",
    "short_description",
    "ingredients",
    "usage_instructions",
    "meta_title",
    "meta_description",
  ]) {
    if (isBlank(product[field])) englishGaps.push(field);
  }
  if (!product.tags?.length) englishGaps.push("tags");

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    status: product.status,
    has_variants: product.has_variants,
    vendor: product.vendor
      ? { id: product.vendor.id, name: product.vendor.business_name ?? product.vendor.name }
      : null,
    brand: product.brand ? { id: product.brand.id, name: product.brand.name } : null,
    category_id: product.category_id,

    // Everything the drafting step needs as source material. Arabic copy and
    // attribute choices must be derived from these facts — not invented.
    source: {
      name: product.name,
      short_description: product.short_description,
      description: product.description,
      ingredients: product.ingredients,
      usage_instructions: product.usage_instructions,
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      tags: product.tags ?? [],
      country_of_origin: product.country_of_origin,
      image_alt_texts: (product.images ?? [])
        .slice(0, 5)
        .map((image) => image.alt_text)
        .filter(Boolean),
    },

    existing_attributes: existingRows.map((row) => ({
      attribute_id: row.attribute_id,
      name: row.attribute?.name,
      value_id: row.attribute_value_id,
      value: row.attributeValue?.display_value ?? row.attributeValue?.value ?? null,
      text_value: row.text_value,
    })),
    existing_ar: ar
      ? {
          name: ar.name,
          description: ar.description,
          short_description: ar.short_description,
          ingredients: ar.ingredients,
          usage_instructions: ar.usage_instructions,
          meta_title: ar.meta_title,
          meta_description: ar.meta_description,
        }
      : null,

    gaps: {
      missing_attributes: missingAttributes,
      missing_required_attributes: missingAttributes.filter((a) => a.is_required).map((a) => a.name),
      missing_ar_fields: arGaps,
      missing_en_fields: englishGaps,
    },
  };
}

/** Shared summary table for both audit paths. */
export function printAuditTable(needsWork) {
  const pad = (value, width) => String(value ?? "").slice(0, width).padEnd(width);
  console.log(`${pad("PRODUCT", 42)} ${pad("ATTRS", 7)} ${pad("AR", 26)} EN`);
  console.log("-".repeat(100));
  for (const row of needsWork) {
    const attrs = row.gaps.missing_attributes.length
      ? `${row.gaps.missing_attributes.length}${row.gaps.missing_required_attributes.length ? `(${row.gaps.missing_required_attributes.length}req)` : ""}`
      : "-";
    console.log(
      `${pad(row.name, 42)} ${pad(attrs, 7)} ${pad(row.gaps.missing_ar_fields.join(",") || "-", 26)} ${row.gaps.missing_en_fields.join(",") || "-"}`,
    );
  }
}

export function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

export function writeJson(path, value) {
  fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
