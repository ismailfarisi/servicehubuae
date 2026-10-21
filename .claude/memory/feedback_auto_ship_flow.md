---
name: Auto ship-and-verify flow for fixes
description: Default workflow for fixes — open PR, wait for CI, merge + delete branch on green, wait for staging deploy, re-verify; do not ask each time
type: feedback
originSessionId: 87c87c98-3b2f-4d7c-b1c5-03960c2e2c38
---
For QA-driven bug fixes in this repo, follow the full ship-and-verify flow without asking for confirmation at each step:

1. Implement + commit + push branch + open PR
2. Poll CI until "Lint, Test & Build" leaves pending
3. If required check is green (Vercel preview rate-limit failures are unrelated and OK to ignore), squash-merge with `--delete-branch`
4. Sync local master, find the new "Deploy to Staging" run, poll until completed
5. Re-verify the fix end-to-end (curl the API + browser via Playwright as appropriate)
6. Report the verification table, then ask whether to proceed with the next item

**Why:** User explicitly said "yes everytime" after manually approving each merge step three PRs in a row (#93, #95, #96, #97). The pattern was clearly the right default but the per-step confirmation was just friction.

**How to apply:** Apply for fix-style work where the user has accepted the implementation. Still pause for confirmation when (a) the required CI check fails for a code reason, (b) the deploy fails, (c) verification reveals a NEW bug that needs a follow-up PR (open the PR but ask before kicking off another full ship cycle), or (d) the user explicitly asks to slow down. Do not auto-ship feature work, refactors, or any change the user hasn't already greenlit.
