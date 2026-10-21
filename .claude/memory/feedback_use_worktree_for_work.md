---
name: feedback_use_worktree_for_work
description: "User wants implementation work done in a git worktree, not directly on the main checkout"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8193b0c7-558d-47a8-8132-f21903bb7eac
---

When doing actual implementation work (features, fixes), do it in a git worktree to keep it isolated from the main D:\ecom checkout.

**Why:** Keeps the working tree clean and lets work proceed without disturbing the primary checkout.

**How to apply:** Invoke the `superpowers:using-git-worktrees` skill (or create a worktree via native tools) at the start of feature work, before editing code.
