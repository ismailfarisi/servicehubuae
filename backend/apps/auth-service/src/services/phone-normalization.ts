import { HttpError } from "@mypickuae/plugins";
import { normalizePhoneE164 } from "@mypickuae/utils";

export function normalizePhoneForOtp(input: string): string {
  const normalized = normalizePhoneE164(input);
  if (!normalized) {
    throw new HttpError(400, "Invalid phone number", "INVALID_PHONE");
  }
  return normalized;
}
