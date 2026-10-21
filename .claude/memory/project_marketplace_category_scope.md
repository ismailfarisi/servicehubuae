---
name: MyPickUAE is a beauty + fragrance marketplace
description: Marketplace covers Skincare, Makeup, Fragrance, Hair, Body, Wellness, Tools — design and schema must not assume fragrance-only
type: project
originSessionId: de94d6d8-d33b-48ed-978b-304106a8e5bf
---
MyPickUAE is a **beauty and fragrance** marketplace, not a fragrance-only one. The marketplace nav surfaces seven categories: **Skincare, Makeup, Fragrance, Hair, Body, Wellness, Tools.**

**Why:** User explicitly corrected this on 2026-05-07 after seeing a PDP spec that had drifted into fragrance-only vocabulary (e.g., "perfumer letter", note role typed as `'top' | 'heart' | 'base'` which is fragrance-only, "ingredient_origins" framed around perfumery). The "Golden Hour" example in the design handoff is fragrance, but it's just one product in a multi-category marketplace.

**How to apply:**

- **Field names must be category-agnostic.** Prefer "creator letter" / "maker letter" over "perfumer letter". Prefer "ingredient origins" (already generic) over "scent notes" or "perfume composition".
- **Enums and typed roles must accommodate all categories.** Don't hard-code fragrance terms (top/heart/base notes) in column types. Use free-form `role` strings with category-aware examples in the dashboard form.
- **Product attributes JSONB schemas should be category-shaped, not perfume-shaped.** A skincare product needs actives/concentrations/skin-type tags; a makeup product needs shade/finish; a hair product needs hair-type tags. The `editorial` JSONB on products should hold cross-category sections (short film, maker letter, lookbook, ingredient origins) and the `attributes` JSONB carries category-specific structured data.
- **Editorial copy in mocks is fragrance-flavoured because the example product is fragrance.** Don't generalise from any one example mock — the same component renders for a moisturiser or a lipstick with category-appropriate copy.
