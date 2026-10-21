-- Sizing query: how much enrichment work exists, grouped by brand.
--
-- Read-only. Returns counts only, so the result is a few KB regardless of
-- catalogue size — unlike audit.sql, which extracts full product records and
-- becomes impractical to haul back over SSM past a few hundred products.
--
-- Run this FIRST on a large catalogue to decide what to scope a batch to, then
-- run audit.sql against the brand you picked.
--
-- The gap definitions must stay in step with analyzeProduct() in lib.mjs:
--   missing ar        : no live ar translation row, or its name is blank
--   missing req attrs : a required, non-variant category attribute with no
--                       live product-level row carrying a value
--   missing seo/tags  : the product column is null/blank/empty
--
-- Parameters (pass '' for "no filter"):
--   psql -v brand='' -v status='' -v lim='40' -f summary.sql

\set ON_ERROR_STOP on

WITH filt AS (
  SELECT
    NULLIF(:'brand', '')                   AS brand,
    NULLIF(:'status', '')                  AS status,
    COALESCE(NULLIF(:'lim', '')::int, 40)  AS lim
),
scoped AS (
  SELECT p.id, p.category_id, p.meta_title, p.meta_description, p.tags,
         p.description, p.ingredients, p.usage_instructions,
         COALESCE(b.name, '(no brand)') AS brand_name
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  CROSS JOIN filt f
  WHERE p.deleted_at IS NULL
    AND (f.status IS NULL OR p.status::text = f.status)
    AND (
      f.brand IS NULL
      OR b.id::text = f.brand
      OR lower(b.slug) = lower(f.brand)
      OR lower(b.name) LIKE '%' || lower(f.brand) || '%'
    )
),
flagged AS (
  SELECT
    s.brand_name,
    -- Arabic listing absent entirely (or present but unnamed, which renders
    -- as nothing on the storefront).
    NOT EXISTS (
      SELECT 1 FROM product_translations t
      WHERE t.product_id = s.id AND t.locale = 'ar'
        AND t.deleted_at IS NULL AND COALESCE(btrim(t.name), '') <> ''
    ) AS no_ar,
    -- No product-level attribute mapping at all. Variant-level rows don't
    -- count: those belong to the variant, not the product.
    NOT EXISTS (
      SELECT 1 FROM product_attribute_values pav
      WHERE pav.product_id = s.id AND pav.deleted_at IS NULL
        AND pav.variant_id IS NULL
        AND (pav.attribute_value_id IS NOT NULL OR COALESCE(btrim(pav.text_value), '') <> '')
    ) AS no_attrs,
    -- At least one REQUIRED category attribute left unmapped. These are the
    -- ones the category was configured to filter on, so they matter most.
    EXISTS (
      SELECT 1
      FROM category_attributes ca
      JOIN attributes a ON a.id = ca.attribute_id
      WHERE ca.category_id = s.category_id
        AND ca.deleted_at IS NULL
        AND ca.is_required
        AND NOT a.is_variant
        AND NOT EXISTS (
          SELECT 1 FROM product_attribute_values pav
          WHERE pav.product_id = s.id AND pav.attribute_id = ca.attribute_id
            AND pav.deleted_at IS NULL AND pav.variant_id IS NULL
            AND (pav.attribute_value_id IS NOT NULL OR COALESCE(btrim(pav.text_value), '') <> '')
        )
    ) AS missing_req_attr,
    (COALESCE(btrim(s.meta_title), '') = '' OR COALESCE(btrim(s.meta_description), '') = '') AS no_seo,
    (s.tags IS NULL OR cardinality(s.tags) = 0) AS no_tags,
    (COALESCE(btrim(s.description), '') = '') AS no_description
  FROM scoped s
)
SELECT
  brand_name,
  count(*)                                        AS products,
  count(*) FILTER (WHERE no_ar)                   AS no_arabic,
  count(*) FILTER (WHERE no_attrs)                AS no_attributes,
  count(*) FILTER (WHERE missing_req_attr)        AS missing_required,
  count(*) FILTER (WHERE no_seo)                  AS no_seo,
  count(*) FILTER (WHERE no_tags)                 AS no_tags,
  count(*) FILTER (WHERE no_description)          AS no_description
FROM flagged
GROUP BY ROLLUP (brand_name)
ORDER BY (brand_name IS NULL) DESC, products DESC
LIMIT (SELECT lim FROM filt);
