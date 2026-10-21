---
name: project_tailwind_ui_content_glob
description: "@mypickuae/ui components render unstyled in an app unless that app's tailwind content globs scan packages/ui"
metadata: 
  node_type: memory
  type: project
  originSessionId: 6a5614a7-0259-489d-97f0-83dae13445ec
---

A Next app's `tailwind.config` `content` globs must include `../../packages/ui/src/**/*.{ts,tsx}`, or Tailwind purges any utility class used **only** inside `@mypickuae/ui` and not elsewhere in that app — so those `@mypickuae/ui` components render unstyled.

**Why:** `apps/web/tailwind.config.ts` only scanned `./src/**`. The auth modal's `DialogContent` carried `left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-w-md`, but the **arbitrary-value** ones (`left-[50%]`, `top-[50%]`, `translate-*-[-50%]`) appear nowhere in `apps/web/src`, so they were never generated → the dialog pinned to the top-left instead of centering. Plain utilities (`max-w-md`, `fixed`) still worked because they also occur in app source. Fixed in #253 by adding the UI package to the content globs.

**How to apply:** When a `@mypickuae/ui` component looks unstyled/mispositioned in an app (esp. positioning/arbitrary-value classes), check that app's tailwind `content` includes `packages/ui` before debugging the component. Diagnose by reading the live element's computed style (e.g. `left/top/transform` resolving to `0`/`none` while the class string contains `left-[50%]`). The class string being correct but the computed CSS missing = a content-scan/purge problem, not a component bug. See [[project_ci_backend_only]] — CI won't catch this (frontend isn't built in the backend-only gate; it only surfaced via a live Playwright check).
