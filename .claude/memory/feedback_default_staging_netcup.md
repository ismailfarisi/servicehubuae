---
name: feedback-default-staging-netcup
description: "When deploying to staging, default to the Netcup target — not AWS/EC2."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 6f1edd54-598b-4cc2-a1a9-e0aea0703ceb
---

For staging deploys, default to **Netcup** unless told otherwise.

**Why:** Staging has been cut over to the Netcup VPS (see [[project-netcup-staging-live]]); AWS is now only the prod target (see [[project-prod-infra-and-listing-diag]]). Defaulting to Netcup avoids asking each time.

**How to apply:** Trigger `.github/workflows/deploy-staging-netcup.yml` (workflow_dispatch, branch `netcup-staging-deploy`) as the staging deploy path. Don't deploy staging to AWS/EC2 unless the user explicitly asks.
