---
name: reference-staging-claude-code-mobile
description: Netcup staging box runs Claude Code (authed) + gh/git inside a persistent tmux session for mobile SSH access; ecom repo cloned at ~/ecom
metadata: 
  node_type: memory
  type: reference
  originSessionId: 2702f361-7b79-41cb-a394-69b94e98aae3
---

Claude Code is installed and **authenticated** on the Netcup staging box (`deploy@89.58.29.111`, host `mypickuae-staging`, aarch64 Ubuntu) for terminal access from mobile (Android SSH client → Termius/Termux).

- Claude Code native build at `~/.local/bin/claude` (PATH exported in `~/.bashrc`); logged in via `claude auth login --claudeai` as ismailfarisi@gmail.com (Max sub); creds persist at `~/.claude/.credentials.json` (600), survive reboots. Re-auth: it's the manual URL+code flow (headless, no localhost browser).
- tmux 3.6 with a mobile-friendly `~/.tmux.conf` (mouse on for touch scroll, 50k scrollback). Persistent session named **`main`**.
- `~/.bashrc` has an AUTO-TMUX-ATTACH block: interactive SSH shells auto-attach to `main` (guarded by `$SSH_CONNECTION`/`$TMUX`/`$-` so CI/scp non-interactive runs are unaffected).
- GitHub: `gh` v2.96.0 (no-sudo binary at `~/.local/bin/gh`, box is aarch64/no passwordless sudo), logged in as `ismailfarisi` (scopes repo/read:org/gist), token stored plaintext at `~/.config/gh/hosts.yml`; wired as git credential helper so HTTPS clone/push just work. git identity set (ismailfarisi / ismailfarisi@gmail.com). Repo `ismailfarisi/ecom` (private) cloned at `~/ecom` on master, `bun install` done (deps resolve, tsc/biome/turbo verified). Mobile flow: SSH in → auto-tmux → `cd ~/ecom && claude`.
- Bun 1.3.14 at `~/.bun/bin` (BUN_INSTALL in .bashrc). Installer needed `unzip` (absent, no sudo) → extracted the `bun-linux-aarch64.zip` with `python3 -m zipfile -e` instead. Same python-zipfile trick works for any zip on this box.
- `~/ecom/backend/.env` is a COPY of the local dev `D:\ecom\backend\.env` (points at localhost DB funkysouq) — so migrations/live tests from `~/ecom` won't reach a DB unless repointed at staging or a local docker stack is run on the box. Pass `--env-file=.env` explicitly per [[reference_worktree_db_test_invocation]].
- fail2ban bans the IP after a few failed auths (see [[project_netcup_staging_live]]); key-only, SSH via `deploy@89.58.29.111 -i ~/.ssh/netcup_deploy_ci`.
