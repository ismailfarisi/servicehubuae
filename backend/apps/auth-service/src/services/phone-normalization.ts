import { HttpError } from "@servicehubuae/plugins";
import { normalizePhoneE164 } from "@servicehubuae/utils";

export function normalizePhoneForOtp(input: string): string {
  const normalized = normalizePhoneE164(input);
  if (!normalized) {
    throw new HttpError(400, "Invalid phone number", "INVALID_PHONE");
  }
  return normalized;
}
