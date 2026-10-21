---
name: feedback_bash_commit_msg_quoting
description: "In the Bash tool, never use PowerShell @'...'@ heredoc for git commit -m; apostrophes break it"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 169a269c-3055-41c3-b72b-1b06dca68bc6
---

When committing via the **Bash** tool (not the PowerShell tool), do NOT pass the
message with PowerShell-style `@'...'@` quoting. Bash treats `@` as a literal
char and the first apostrophe inside the body (e.g. "prototype's") closes the
single quote early — the message gets truncated, a stray `@` line is prepended,
and leftover words run as commands (creating junk files).

**Why:** The CLAUDE.md commit examples show `@'...'@` but those are for the
PowerShell tool. The Bash tool uses /usr/bin/bash where that syntax is wrong.

**How to apply:** For multi-line commit messages in the Bash tool, write the
message to a file (use the Write tool to dodge all shell quoting) and run
`git commit -F /d/tmp/cmsg.txt`. A quoted heredoc `<<'EOF'` also works but the
Write+`-F` path is the most reliable on this Windows/git-bash setup. Related:
[[feedback_msys_path_conversion]], [[feedback_msys_grep_cr_pipe]].
