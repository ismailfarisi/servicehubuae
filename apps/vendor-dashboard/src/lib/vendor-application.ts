import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);

export const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

export const LICENCE_CONTENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const LICENCE_MAX_BYTES = 10 * 1024 * 1024;

const businessFields = {
  businessName: z.string().trim().min(2, "Business name is required").max(200),
  category: requiredText("Choose your main service category"),
  emirate: z.enum(EMIRATES, { message: "Choose an emirate" }),
  address: requiredText("Business address is required").max(255),
  businessPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number, e.g. +971 50 123 4567"),
  tradeLicenseNumber: requiredText("Trade licence number is required").max(100),
  website: z.string().trim().max(512),
  message: z.string().trim().max(2000),
};

const accountFields = {
  firstName: requiredText("First name is required").max(100),
  lastName: requiredText("Last name is required").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").max(128),
};

/** Signed-out visitors create (or reuse) their account in the same step. */
export const vendorApplicationSchema = z.object({ ...accountFields, ...businessFields });

/** Already signed in (e.g. re-applying after a rejection): business details only. */
export const vendorReapplicationSchema = z.object(businessFields);

export type VendorApplicationFormValues = z.infer<typeof vendorApplicationSchema>;
export type VendorBusinessFormValues = z.infer<typeof vendorReapplicationSchema>;

export const emptyApplication: VendorApplicationFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  businessName: "",
  category: "",
  emirate: "" as VendorApplicationFormValues["emirate"],
  address: "",
  businessPhone: "",
  tradeLicenseNumber: "",
  website: "",
  message: "",
};

/** Returns an error message for an unusable licence file, or null if it is fine. */
export function validateLicenceFile(file: File | null): string | null {
  if (!file) return "Upload a copy of your trade licence";
  if (!LICENCE_CONTENT_TYPES.includes(file.type)) return "Upload a PDF, JPG or PNG file";
  if (file.size > LICENCE_MAX_BYTES) return "The file must be 10 MB or smaller";
  return null;
}

/** Body for POST /vendors/apply. */
export function buildApplyPayload(
  values: VendorBusinessFormValues,
  contactEmail: string,
  licenceKey: string,
) {
  return {
    business_name: values.businessName,
    business_email: contactEmail,
    business_phone: values.businessPhone.replace(/[ ()-]/g, ""),
    business_address: {
      street: values.address,
      city: values.emirate,
      country: "AE",
    },
    trade_license_number: values.tradeLicenseNumber,
    business_type: values.category,
    ...(values.website ? { website_url: values.website } : {}),
    ...(values.message ? { description: values.message } : {}),
    documents: [{ type: "trade_license", s3_key: licenceKey }],
  };
}

export interface VendorApplication {
  id: string;
  name: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "suspended" | "deactivated";
  rejection_reason: string | null;
  business_type: string;
  trade_license_number: string | null;
  contact_phone: string;
  address: { street?: string; city?: string } | null;
  website_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

/** Form values to start a re-application from the previous one. */
export function applicationDefaults(previous?: VendorApplication | null): VendorApplicationFormValues {
  if (!previous) return emptyApplication;
  const emirate = EMIRATES.find((e) => e === previous.address?.city);
  return {
    ...emptyApplication,
    businessName: previous.name,
    category: previous.business_type === "general" ? "" : previous.business_type,
    emirate: emirate ?? emptyApplication.emirate,
    address: previous.address?.street ?? "",
    businessPhone: previous.contact_phone ?? "",
    tradeLicenseNumber: previous.trade_license_number ?? "",
    website: previous.website_url ?? "",
    message: previous.description ?? "",
  };
}
