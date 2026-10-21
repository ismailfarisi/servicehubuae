-- Read-only catalogue gap query for the prod-product-enrich skill.
--
-- Returns ONE json object shaped so that the JS side can feed it straight into
-- analyzeProduct() — the same function the API audit uses. That is deliberate:
-- the definition of "missing" lives in exactly one place, so the SQL path and
-- the API path can never disagree about what needs work.
--
-- Every product sub-object mirrors GET /admin/products/:id, including the
-- attributeValues / translations relation names (camelCase on purpose).
--
-- Parameters are psql variables; pass every one, using '' for "no filter":
--   psql -v brand='teatro' -v status='published' -v vendor='' -v category='' \
--        -v ids='' -v lim='200' -f audit.sql
--
-- SELECT-only. It reads products, brands, vendors, product_images,
-- product_attribute_values, attributes, attribute_values, product_translations
-- and category_attributes. It writes nothing.

\set ON_ERROR_STOP on

WITH filt AS (
  SELECT
    NULLIF(:'brand', '')                     AS brand,
    NULLIF(:'status', '')                    AS status,
    NULLIF(:'vendor', '')                    AS vendor,
    NULLIF(:'category', '')                  AS category,
    NULLIF(:'ids', '')                       AS ids,
    COALESCE(NULLIF(:'lim', '')::int, 200)   AS lim
),
target AS (
  SELECT p.id, p.category_id
  FROM products p
  LEFT JOIN brands b ON b.id = p.brand_id
  CROSS JOIN filt f
  WHERE p.deleted_at IS NULL
    AND (f.status   IS NULL OR p.status::text  = f.status)
    AND (f.vendor   IS NULL OR p.vendor_id::text   = f.vendor)
    AND (f.category IS NULL OR p.category_id::text = f.category)
    AND (f.ids      IS NULL OR p.id::text = ANY (string_to_array(f.ids, ',')))
    -- Brand matches an id or slug exactly, or a substring of the name, so
    -- 'dior' finds 'Christian Dior' without anyone looking up a uuid.
    AND (
      f.brand IS NULL
      OR b.id::text = f.brand
      OR lower(b.slug) = lower(f.brand)
      OR lower(b.name) LIKE '%' || lower(f.brand) || '%'
    )
  ORDER BY p.created_at DESC
  LIMIT (SELECT lim FROM filt)
)
SELECT jsonb_build_object(
  'products', COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'id',                 p.id,
        'name',               p.name,
        'slug',               p.slug,
        'status',             p.status,
        'has_variants',       p.has_variants,
        'category_id',        p.category_id,
        'short_description',  p.short_description,
        'description',        p.description,
        'ingredients',        p.ingredients,
        'usage_instructions', p.usage_instructions,
        'meta_title',         p.meta_title,
        'meta_description',   p.meta_description,
        'country_of_origin',  p.country_of_origin,
        'tags',               to_jsonb(COALESCE(p.tags, ARRAY[]::text[])),
        'vendor', (
          SELECT jsonb_build_object('id', v.id, 'name', v.name, 'business_name', v.business_name)
          FROM vendors v WHERE v.id = p.vendor_id
        ),
        'brand', (
          SELECT jsonb_build_object('id', br.id, 'name', br.name, 'slug', br.slug)
          FROM brands br WHERE br.id = p.brand_id
        ),
        'images', COALESCE((
          SELECT jsonb_agg(jsonb_build_object('alt_text', i.alt_text, 'is_primary', i.is_primary)
                           ORDER BY i.is_primary DESC, i.sort_order)
          FROM product_images i
          WHERE i.product_id = p.id AND i.deleted_at IS NULL
        ), '[]'::jsonb),
        -- Soft-deleted rows are included and filtered JS-side, matching how
        -- productLevelAttributes()/arabicTranslation() already behave.
        'attributeValues', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'attribute_id',       pav.attribute_id,
            'attribute_value_id', pav.attribute_value_id,
            'text_value',         pav.text_value,
            'variant_id',         pav.variant_id,
            'deleted_at',         pav.deleted_at,
            'attribute',          jsonb_build_object('id', a.id, 'name', a.name, 'slug', a.slug,
                                                     'type', a.type, 'is_variant', a.is_variant),
            'attributeValue',     CASE WHEN av.id IS NULL THEN NULL ELSE
                                    jsonb_build_object('id', av.id, 'value', av.value,
                                                       'display_value', av.display_value) END
          ))
          FROM product_attribute_values pav
          JOIN attributes a ON a.id = pav.attribute_id
          LEFT JOIN attribute_values av ON av.id = pav.attribute_value_id
          WHERE pav.product_id = p.id
        ), '[]'::jsonb),
        'translations', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'locale',             t.locale,
            'name',               t.name,
            'short_description',  t.short_description,
            'description',        t.description,
            'ingredients',        t.ingredients,
            'usage_instructions', t.usage_instructions,
            'meta_title',         t.meta_title,
            'meta_description',   t.meta_description,
            'deleted_at',         t.deleted_at
          ))
          FROM product_translations t WHERE t.product_id = p.id
        ), '[]'::jsonb)
      )
    )
    FROM products p
    WHERE p.id IN (SELECT id FROM target)
  ), '[]'::jsonb),

  -- Category attribute definitions, keyed by category id, with the allowed
  -- value ids the drafting step must choose from. Fetched once per category
  -- rather than once per product.
  'category_attributes', COALESCE((
    SELECT jsonb_object_agg(cat_id, attrs)
    FROM (
      SELECT ca.category_id::text AS cat_id,
             jsonb_agg(
               jsonb_build_object(
                 'attribute_id', ca.attribute_id,
                 'is_required',  ca.is_required,
                 'attribute', jsonb_build_object(
                   'id',         a.id,
                   'name',       a.name,
                   'slug',       a.slug,
                   'type',       a.type,
                   'is_variant', a.is_variant,
                   'values', COALESCE((
                     SELECT jsonb_agg(jsonb_build_object('id', av.id, 'value', av.value,
                                                         'display_value', av.display_value)
                                      ORDER BY av.sort_order, av.value)
                     FROM attribute_values av
                     WHERE av.attribute_id = a.id AND av.deleted_at IS NULL
                   ), '[]'::jsonb)
                 )
               ) ORDER BY ca.sort_order
             ) AS attrs
      FROM category_attributes ca
      JOIN attributes a ON a.id = ca.attribute_id
      WHERE ca.deleted_at IS NULL
        AND ca.category_id IN (SELECT category_id FROM target)
      GROUP BY ca.category_id
    ) grouped
  ), '{}'::jsonb),

  -- Total matching the filters, ignoring the LIMIT — so a truncated batch can
  -- always say "25 of 140" instead of implying it saw everything.
  'total_matching', (
    SELECT count(*)
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    CROSS JOIN filt f
    WHERE p.deleted_at IS NULL
      AND (f.status   IS NULL OR p.status::text  = f.status)
      AND (f.vendor   IS NULL OR p.vendor_id::text   = f.vendor)
      AND (f.category IS NULL OR p.category_id::text = f.category)
      AND (f.ids      IS NULL OR p.id::text = ANY (string_to_array(f.ids, ',')))
      AND (
        f.brand IS NULL
        OR b.id::text = f.brand
        OR lower(b.slug) = lower(f.brand)
        OR lower(b.name) LIKE '%' || lower(f.brand) || '%'
      )
  ),

  'brand_names_matched', COALESCE((
    SELECT jsonb_agg(DISTINCT br.name)
    FROM products p
    JOIN brands br ON br.id = p.brand_id
    WHERE p.id IN (SELECT id FROM target)
  ), '[]'::jsonb)
) AS audit;
