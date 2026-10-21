---
name: project_inventory_panel_zero_out_of_stock
description: "Per-warehouse inventory panel is delta-based; vendors couldn't set stock to 0; fix + Mark out of stock (PR"
metadata: 
  node_type: memory
  type: project
  originSessionId: bc48a795-3a23-4805-98bb-960d978441d6
---

The vendor **Inventory tab** (product edit → `InventoryPanel.tsx`) and the admin
`catalog/products/[id]/components/PricingTab.tsx` are the per-warehouse stock UI from
PR #315 + #316 (both merged to master; NOT the old single "Quantity on hand" field on
ProductForm — that's a separate/older flow). The panel is **delta-based**: Restock *adds*,
Adjust applies a *signed change* (negative reduces). There is no "set absolute level" action.

Bug (reported 2026-07-14): both action buttons shared one `amount !== 0` guard, so typing
`0` in Quantity disabled the whole panel → vendors couldn't reach out-of-stock by typing the
target `0`. Also latent: a negative in the box enabled **Restock**, which `Math.abs`es it and
silently ADDED stock.

Fix (PR #327, branch `fix/inventory-zero-out-of-stock`):
- Split the guard per button. Restock needs `amount > 0` (API rejects `<1`). Adjust allows
  negatives; both stay disabled at exactly `0` (0 restock rejected, 0 adjust no-op) — user
  wanted them consistent.
- Added **"Mark out of stock"** to both panels — one click adjusts the target warehouse down
  by exactly its on-hand (`onHandForWarehouse` / `buildMarkOutOfStockAdjustments`). This is
  the intended way to zero out.
- Logic extracted into tested helpers (vendor: `inventoryButtonState`; admin:
  `isProductInventorySubmitDisabled`). Frontend NOT in CI — verified via bun/vitest unit
  tests + `tsc`; no live click-through (browser ext wasn't connected).

Gotcha that cost time: local `master` was 19 commits stale, so `InventoryPanel.tsx` looked
missing — always `git fetch` + check `origin/master` before concluding a file isn't on master.
See [[project_ci_backend_only]], [[feedback_use_worktree_for_work]].
