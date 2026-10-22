import { describe, expect, test } from "vitest";
import {
  buildVendorInterestSummary,
  vendorInterestSchema,
} from "./vendor-interest";

describe("vendor interest form", () => {
  test("accepts a complete interest request and trims values", () => {
    const result = vendorInterestSchema.parse({
      brandName: "  Sparkle Home Services  ",
      contactName: "  Sara Vendor  ",
      email: "sara@example.com",
      category: "  Skincare  ",
      website: "  https://example.com  ",
      message: "  We sell curated clean beauty.  ",
    });

    expect(result).toEqual({
      brandName: "Sparkle Home Services",
      contactName: "Sara Vendor",
      email: "sara@example.com",
      category: "Skincare",
      website: "https://example.com",
      message: "We sell curated clean beauty.",
    });
  });

  test("rejects missing required fields and invalid email", () => {
    const result = vendorInterestSchema.safeParse({
      brandName: "",
      contactName: "",
      email: "not-email",
      category: "",
      website: "",
      message: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path.join("."));
      expect(fields).toContain("brandName");
      expect(fields).toContain("contactName");
      expect(fields).toContain("email");
      expect(fields).toContain("category");
    }
  });

  test("builds a readable received-state summary", () => {
    const summary = buildVendorInterestSummary({
      brandName: "Sparkle Home Services",
      contactName: "Sara Vendor",
      email: "sara@example.com",
      category: "Skincare",
      website: "",
      message: "",
    });

    expect(summary).toBe("Sparkle Home Services / Skincare / sara@example.com");
  });
});
