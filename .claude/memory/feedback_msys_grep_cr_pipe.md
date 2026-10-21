---
name: feedback_msys_grep_cr_pipe
description: "On Windows, never detect line endings by piping git output to grep/od — MSYS mangles it"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 626fa87d-516f-4d55-9bf7-1d3c0df5f8f6
---

On Windows Git-bash, checking line endings with `git show|cat-file ... | grep -c $'\r'` or `| od -c` gives **false CR counts** — the MSYS text-mode pipe injects `\r` at the git(native)→grep/od(MSYS) boundary, inconsistently per file.

**Why:** burned a long detour believing committed `.ts` blobs were CRLF; they were pure LF all along.

**How to apply:** verify blob line endings with Node reading raw buffers — `execSync("git cat-file -p HEAD:path", { encoding: "buffer" })` then count bytes `=== 13`. Or trust `git diff --cached` (git-internal, no pipe). The `git add` warning "LF will be replaced by CRLF the next time Git touches it" *confirms* the blob is LF. Related: [[feedback_msys_path_conversion]].
