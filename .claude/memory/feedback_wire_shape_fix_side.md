---
name: Fix wire-shape mismatches on the cheaper-to-deploy side
description: When frontend and backend disagree on response shape, prefer fixing whichever side requires the smaller redeploy — usually the frontend when the backend is already on staging
type: feedback
originSessionId: 4c5e8947-00c1-4a87-aa91-2b3eecc90234
---
When a frontend/backend response-shape mismatch is the bug, prefer fixing whichever side ships fastest rather than picking the "semantically cleaner" side by default.

**Why:** User pushed back on a backend rename (`data` → `bids` in `BidService.listAll`) because staging already had the working API up; redeploying cms-service to fix a single admin page was unnecessary churn when a one-line frontend change does the same job.

**How to apply:** When proposing a fix for a wire-shape mismatch, lead with the side that doesn't require a redeploy. Only touch the backend if (a) multiple frontends consume the same shape, (b) the backend shape is genuinely wrong/inconsistent with conventions, or (c) the user asks. If unsure, ask which side they'd rather change before editing.
