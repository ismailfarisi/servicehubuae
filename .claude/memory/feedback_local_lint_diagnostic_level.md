---
name: Match CI lint flags locally on Windows
description: Windows CRLF noise hides true biome errors; mirror the CI --diagnostic-level=error flag before pushing
type: feedback
originSessionId: f94a9b74-568b-4e61-bb7b-df17b06c76c0
---
CI runs `cd backend && biome check --diagnostic-level=error .` — **check = lint rules AND the formatter** (frontend isn't gated; see [[project_ci_backend_only]]). The Windows trap: `core.autocrlf=true` gives a CRLF working tree but commits LF blobs, so locally `biome check` flags CRLF on ~every file (saw 1006 "errors", whole-file reprints incl. `package.json`) — and `--diagnostic-level=error` does NOT suppress that (format failures are error-severity). CI (Linux, LF) only ever sees the LF blobs, where exactly the *real* issues remain.

**Do NOT just run `biome lint`.** `lint` skips the formatter, so it gives clean output while a genuine format error (e.g. a line >100 chars that biome would wrap) still fails CI's `check`. This bit PR #237: a test had long single-line calls; `biome lint` passed locally, CI's `check` failed with one "Formatter would have printed…" error.

**Reliable recipe — reproduce CI by checking the LF blobs:** normalize the branch's changed files to their committed LF content in the working tree, then run `biome check` (lint+format) on them:
```bash
cd <worktree>
node -e "const{execSync}=require('child_process'),fs=require('fs');for(const f of execSync('git diff --name-only origin/master...HEAD').toString().split('\n').filter(x=>/\.(ts|tsx)$/.test(x)))fs.writeFileSync(f,execSync('git show HEAD:'+f));"
cd backend && <changed backend files> | xargs bunx --bun @biomejs/biome@1.9.4 check --diagnostic-level=error   # now only REAL errors
bunx --bun @biomejs/biome@1.9.4 format --write <offending file>   # auto-fix, commit, then: git checkout -- .  (revert EOL-only churn on the rest)
```
**Simplest per-file check (validated, no git juggling):** pipe the CRLF-stripped file through biome's formatter and compare — `OK` means CI's format gate will pass:
```bash
for f in <changed .ts files>; do tr -d '\r' < "$f" > /tmp/lf.ts; \
  [ "$(bunx --bun @biomejs/biome@1.9.4 format --stdin-file-path=/tmp/lf.ts < /tmp/lf.ts)" = "$(cat /tmp/lf.ts)" ] \
  && echo "OK   $f" || echo "DIFF $f"; done
```
This turn I skipped this and ran `biome check --diagnostic-level=error <files>` directly — CRLF reprints masked a REAL format error (a multiline array + ternary biome wanted single-lined), it slipped to CI, and the prod-bound PR's first run failed. Common real fixes: biome collapses short arrays/ternaries onto one line if they fit.

**Large multi-task subagent branches (PR #334, 56 changed backend files):** per-file spot-checks passed but CI's whole-repo `check .` failed on 8 files — subagent edits leave unwrapped long lines + unsorted imports that piecemeal checks miss. Pre-push recipe that worked: `biome check --write $(git diff --name-only <base> HEAD | grep '^backend/.*\.tsx\?$' | sed 's|^backend/||')` from `backend/` (fixed 16 files: format + import-sort), LF-normalize, then verify **scoped to the changed files** — NOT the whole tree. Running `biome check --diagnostic-level=error .` on the full working tree reported **1186 bogus errors** (CRLF on untouched files); scoping to just the changed (LF-normalized) files gave the true "0 errors". CI (Linux/LF) only judges the changed committed blobs, so scope the local check to match.

Note `noExplicitAny`/`noForEach`/`noUnusedVariables`/`noUnusedImports` are `"warn"` in this repo (allowed). After writing LF blobs, `git status` shows all changed files as modified (EOL-only, content-identical) — commit only the real format fix, then `git checkout -- .` to clear the rest. Don't grep git output for `\r` (MSYS injects false CRs — [[feedback_msys_grep_cr_pipe]]). Best of all: have implementers run this LF `check` before committing so it never reaches CI.
