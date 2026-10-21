---
name: PDP reel feature scope decisions
description: Scope rules for the Product Detail Page reels feature (comments out, submission purchase-gated)
type: project
originSessionId: de94d6d8-d33b-48ed-978b-304106a8e5bf
---
For the Product Detail Page reels feature on MyPickUAE:

1. **No reel comments.** The "87 comments" affordance shown in the design mock is decorative only — do not add a `reel_comment` entity, comment count column, or comments UI. Reels remain like/save/share/view only.

2. **Submit-your-own reel is purchase-gated.** Only users who have actually ordered the product (or some product from that brand) can submit a reel for it. Eligibility check should hit `order` / `order-item` history, not just any logged-in user.

**Why:** User explicitly trimmed scope on 2026-05-07 while reviewing the PDP design handoff (Maison Aoun "Golden Hour"). They want reels to feel like trusted UGC from real buyers, not a generic comment thread.

**How to apply:** When implementing the PDP, the reels stack ships without a comments entity/endpoint. The "Submit your own" CTA must check purchase history before opening the upload flow — show a "Buy first to share your story" state for non-buyers.
