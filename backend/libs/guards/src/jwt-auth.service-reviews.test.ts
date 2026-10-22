import { describe, expect, it } from "bun:test";
import { isPublicRoute } from "./jwt-auth.ts";

describe("isPublicRoute — /booking/services/:id/reviews", () => {
  it("allows the storefront read of an offering's reviews", () => {
    expect(
      isPublicRoute("/booking/services/829d1d72-f56f-43cc-b5e8-8ac1f8749409/reviews", "GET"),
    ).toBe(true);
  });

  it("does not make writes public", () => {
    expect(isPublicRoute("/booking/services/o1/reviews", "POST")).toBe(false);
  });

  it("does not open the rest of /booking/services or nested paths", () => {
    expect(isPublicRoute("/booking/services/o1", "GET")).toBe(false);
    expect(isPublicRoute("/booking/services/o1/reviews/r1", "GET")).toBe(false);
    expect(isPublicRoute("/booking/services/a/b/reviews", "GET")).toBe(false);
  });

  it("keeps customer and vendor review writes gated", () => {
    expect(isPublicRoute("/bookings/b1/review", "POST")).toBe(false);
    expect(isPublicRoute("/vendor/booking/reviews/r1/reply", "POST")).toBe(false);
  });
});
