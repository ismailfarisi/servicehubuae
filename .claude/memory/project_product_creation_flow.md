---
name: project-product-creation-flow
description: "Product wizard rework — is_variant attrs are variant axes only; variable product price is derived min(variant prices); explicit variants[] payload"
metadata: 
  node_type: memory
  type: project
  originSessionId: f546aa98-01e8-413d-9db6-821e19a3c475
---

Product creation flow rework (branch feat/product-creation-flow, 2026-06-10): category attributes with `is_variant=true` are variant axes ONLY (shown in the Variants step via shared `VariantMatrixEditor` in packages/ui), never in the descriptive attribute editor — use `splitCategoryAttributes()`. A variable product's `product.price` is DERIVED: the backend recomputes `min(active variant prices)` + `has_variants` after every variant create/update/delete (`syncProductAfterVariantChange` in product-variant.service.ts) — clients must not treat product-level price as an input for variable products. Variant creation endpoints accept both legacy `{options:[{attribute_id,values}]}` and explicit `{variants:[{option_values, price, sku?, quantity_on_hand?}]}`; `option_values` keys are attribute ids for catalog axes / slugs for custom axes, and `quantity_on_hand` creates `inventory` rows with `variant_id` in the vendor's default warehouse.

**Why:** the wizard asked for Size twice (attribute editor + variants step) and demanded a base price that variants immediately overrode; also the vendor variants route passed the raw body into the service so vendor variant generation had always been broken.

**How to apply:** when touching product create/edit UIs or variant APIs, keep price/stock per-variant for variable products and route any new variant axis through the category's is_variant attributes (custom axes are the escape hatch, stored only in option_values JSONB).
