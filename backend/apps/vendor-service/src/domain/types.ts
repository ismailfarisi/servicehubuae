export const VENDOR_TRANSITIONS: Record<string, string[]> = {
  pending: ["under_review"],
  under_review: ["approved", "rejected"],
  rejected: ["pending"],
  approved: ["suspended", "deactivated"],
  suspended: ["approved"],
  deactivated: [],
};

export function isValidTransition(from: string, to: string): boolean {
  return VENDOR_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface VendorApplyData {
  userId: string;
  businessName: string;
  businessNameAr?: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
  };
  taxRegistrationNumber?: string;
  tradeLicenseNumber?: string;
  /** Primary service category slug; stored on vendors.business_type. */
  businessType?: string;
  websiteUrl?: string;
  description?: string;
  documents: Array<{
    type: string;
    s3Key: string;
  }>;
  bankAccount?: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    iban: string;
    swiftCode?: string;
    currency?: string;
  };
}
