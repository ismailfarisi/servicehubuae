import { test, expect } from "@playwright/test";

/**
 * Reels feed scroll E2E skeleton. (Product tags and the product drawer were
 * removed with the products domain.)
 *
 * Requires a live stack:
 *   - docker compose up (postgres, redis, all backend services)
 *   - apps/web dev server on http://localhost:3000
 *   - Seeded cohort with at least 2 approved reels for the test user's language/country
 *
 * Run locally with: REELS_E2E_STACK_UP=1 bun run test:e2e feed-scroll-and-tap
 */
test.describe("Reels feed scroll", () => {
  test.skip(
    !process.env.REELS_E2E_STACK_UP,
    "Requires REELS_E2E_STACK_UP=1 and a running dev stack",
  );

  test("scrolls from the first reel to the next", async ({ page }) => {
    await page.goto("/en/reels");

    const first = page.locator("section[data-index='0']");
    await expect(first).toBeVisible();

    // Scroll to next reel via keyboard
    await first.press("PageDown");
    await expect(page.locator("section[data-index='1']")).toBeVisible();
  });
});
