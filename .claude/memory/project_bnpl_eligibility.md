---
name: BNPL eligibility — cart-total primary, category-deny as extension
description: Tabby/Tamara primary gate is cart total min/max; schema also supports category-scope deny pending product/legal decision O1
type: project
originSessionId: fa1d4020-3df5-4745-88ca-f5dc0beec804
---
**Primary gate:** Tabby/Tamara eligibility in MyPickUAE is driven by cart total value (`min_amount_fils` / `max_amount_fils`) plus provider customer-eligibility API check. No per-SKU / per-product restrictions.

**Category-scope deny is supported by schema** but not populated until open item O1 is resolved (see `docs/backend-requests/2026-04-17-dynamic-checkout-options-api.md` §10). Tabby/Tamara UAE merchant agreements can prohibit certain categories (regulated goods, gift cards/top-ups, digital wallets) — a disallowed SKU in a BNPL order can trigger chargeback + merchant-account suspension. Product + legal need to confirm whether MyPickUAE's catalog includes any restricted categories.

**Why:** Simpler rules engine for the common case. Category-scope reuses the general `payment_method_rules` table with `category_id` scope — no BNPL-specific table needed. Cart-total-only was the user's explicit decision 2026-04-17; category extension was added after review surfaced merchant-compliance risk.

**How to apply:**
- For product-scope BNPL rules: **don't add them.** SKU-level BNPL restriction is explicitly excluded.
- For category-scope BNPL denies: valid schema, but DO NOT seed rows until O1 is resolved by product/legal.
- COD and card use the full rule stack (product > vendor > category > zone > platform). BNPL skips product and vendor scope; only cart-total + optional category-deny + provider check.
- Multi-vendor cart BNPL availability = one decision based on summed cart total (not per-vendor).
- Provider eligibility API (Tabby/Tamara) is always still called for the customer-level check.
