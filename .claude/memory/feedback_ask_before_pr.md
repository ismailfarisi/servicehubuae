---
name: Ask before opening PRs
description: Don't auto-create PRs. Commit and push are usually fine, but always pause before `gh pr create` so the user can adjust scope or ask for splits.
type: feedback
originSessionId: de94d6d8-d33b-48ed-978b-304106a8e5bf
---
Always pause and ask before running `gh pr create`. Commits and pushes to feature branches are fine without prompting (the user has the auto ship-and-verify memory for fixes), but PR creation is the visible-to-others handoff and the user wants explicit say on:

- Whether to bundle vs split fixes into separate PRs
- Final wording of title and body
- Timing (sometimes they'd rather review the diff locally first)

**Why:** User explicitly corrected this on 2026-05-08 after I'd combined three different fixes into one branch and was about to call `gh pr create` without checking. They interrupted to say "ask me before creating pr".

**How to apply:** When ready to open a PR, state what's on the branch (diff summary, files touched), and ask whether to open it as one PR, split it, or hold for review. Do not run `gh pr create` until the user gives the green light.
