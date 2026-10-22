import { describe, expect, test } from "vitest";
import {
  applicationDefaults,
  buildApplyPayload,
  emptyApplication,
  validateLicenceFile,
  vendorApplicationSchema,
  vendorReapplicationSchema,
} from "./vendor-application";

const complete = {
  ...emptyApplication,
  firstName: "  Sara  ",
  lastName: "Vendor",
  email: "sara@sparkle.example",
  password: "correct-horse",
  businessName: "  Sparkle Home Services  ",
  category: "home-cleaning",
  emirate: "Dubai" as const,
  address: "Office 12, Al Quoz Industrial 3",
  businessPhone: "+971 50 123 4567",
  tradeLicenseNumber: "CN-1234567",
};

describe("vendor application form", () => {
  test("accepts a complete application and trims values", () => {
    const result = vendorApplicationSchema.parse(complete);
    expect(result.firstName).toBe("Sara");
    expect(result.businessName).toBe("Sparkle Home Services");
  });

  test("rejects missing required fields, bad email, short password and bad phone", () => {
    const result = vendorApplicationSchema.safeParse({
      ...emptyApplication,
      email: "not-email",
      password: "short",
      businessPhone: "call me",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path.join("."));
      for (const field of [
        "firstName",
        "lastName",
        "email",
        "password",
        "businessName",
        "category",
        "emirate",
        "address",
        "businessPhone",
        "tradeLicenseNumber",
      ]) {
        expect(fields).toContain(field);
      }
    }
  });

  test("signed-in re-application does not ask for account fields", () => {
    const { firstName, lastName, email, password, ...business } = complete;
    expect(vendorReapplicationSchema.safeParse(business).success).toBe(true);
  });

  test("builds the POST /vendors/apply body", () => {
    const values = vendorApplicationSchema.parse({
      ...complete,
      website: "https://sparkle.example",
    });
    expect(buildApplyPayload(values, "sara@sparkle.example", "private/kyc/applicants/u1/x/licence.pdf")).toEqual({
      business_name: "Sparkle Home Services",
      business_email: "sara@sparkle.example",
      business_phone: "+971501234567",
      business_address: {
        street: "Office 12, Al Quoz Industrial 3",
        city: "Dubai",
        country: "AE",
      },
      trade_license_number: "CN-1234567",
      business_type: "home-cleaning",
      website_url: "https://sparkle.example",
      documents: [{ type: "trade_license", s3_key: "private/kyc/applicants/u1/x/licence.pdf" }],
    });
  });

  test("validates the licence file", () => {
    expect(validateLicenceFile(null)).toMatch(/upload/i);
    expect(validateLicenceFile(new File(["x"], "a.docx", { type: "application/msword" }))).toMatch(/PDF/);
    expect(validateLicenceFile(new File(["x"], "licence.pdf", { type: "application/pdf" }))).toBeNull();
  });

  test("prefills a re-application from the rejected one", () => {
    const values = applicationDefaults({
      id: "v1",
      name: "Sparkle Home Services",
      status: "rejected",
      rejection_reason: "Licence expired",
      business_type: "home-cleaning",
      trade_license_number: "CN-1234567",
      contact_phone: "+971501234567",
      address: { street: "Al Quoz 3", city: "Dubai" },
      website_url: null,
      description: "Deep cleaning",
      created_at: "2026-10-22T00:00:00Z",
      updated_at: "2026-10-22T00:00:00Z",
    });
    expect(values).toMatchObject({
      businessName: "Sparkle Home Services",
      category: "home-cleaning",
      emirate: "Dubai",
      address: "Al Quoz 3",
      tradeLicenseNumber: "CN-1234567",
      website: "",
      message: "Deep cleaning",
    });
    expect(applicationDefaults(null).businessName).toBe("");
  });
});
