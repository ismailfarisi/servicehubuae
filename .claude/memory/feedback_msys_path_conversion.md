---
name: disable-msys-path-conversion-for-aws-cli-path-args-on-windows
description: Git Bash rewrites /leading/slash CLI arguments into Windows paths; set MSYS_NO_PATHCONV=1 for aws ssm and similar
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0743eca3-316f-42c7-a21d-fc9f7f49baa8
---

On this Windows machine the Bash tool runs under Git Bash (MSYS), which rewrites any argument that looks like a Unix path (e.g. `/mypickuae/staging/cloudflare/api-token`) into a Windows path before handing it to a native executable. This silently corrupts AWS CLI calls that take leading-slash arguments — `aws ssm get-parameter --name /path/...`, `aws ssm get-parameters-by-path --path /path/...` — so they look up a mangled name and return empty / ParameterNotFound instead of the real value, or throw a confusing `ValidationException` about invalid parameter-name characters.

**Why:** a staging-SSM read returned a false "all placeholder/empty" result purely because the `/mypickuae/staging/...` paths were mangled; the parameters actually existed with real values, which inverted a decision.

**How to apply:** when invoking the AWS CLI (or any native CLI) with leading-slash path arguments via the Bash tool, set `MSYS_NO_PATHCONV=1` — `export MSYS_NO_PATHCONV=1` at the top of the script, or prefix the command. Resource names without leading slashes (S3 bucket names, `--role-name`, instance IDs) are unaffected. Related Windows-tooling gotcha: [[feedback_local_lint_diagnostic_level]].
