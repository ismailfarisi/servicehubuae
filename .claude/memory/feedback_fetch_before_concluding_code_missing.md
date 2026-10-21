---
name: feedback-fetch-before-concluding-code-missing
description: "git fetch and check origin/master before concluding a feature doesn't exist — the local master ref goes stale silently"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: dfafe8f8-ae44-4ce0-a093-b048cc7a33b1
---

Before concluding that a feature/file/page **doesn't exist**, run `git fetch origin` and check **`origin/master`**, not local `master`.

**Why:** the local `master` ref in `D:\ecom` is frequently many commits behind (it was **15 behind** on 2026-07-16). Feature work happens on branches, so local `master` can sit untouched for weeks. Searching the working tree or local `master` produced a confident, wrong "the admin user detail page does not exist" — the page was on `origin/master` all along (PR #326, `0d56168c`). `git merge-base --is-ancestor <sha> master` returns "no" against a stale ref just as convincingly as against a real absence.

**How to apply:** when a search comes up empty for something you have any reason to believe shipped (a memory note, a PR number, a user saying "the X page"), before reporting absence:
```bash
git fetch origin --quiet
git rev-list --left-right --count master...origin/master   # left=local ahead, right=BEHIND
git ls-tree -r --name-only origin/master -- <path>
gh pr view <N> --json state,mergedAt,mergeCommit           # ground truth
```
`gh pr view` is the tie-breaker: it said MERGED while local git said not-an-ancestor, which is exactly the signal that the local ref is stale rather than the code being gone. Also branch new work off `origin/master`, not local `master`. Related: [[feedback-use-worktree-for-work]].
