"use client";

import { PhoneInput } from "@/components/ui/phone-input";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import type { CSSProperties, FocusEventHandler } from "react";
import {
  useConfirmPhoneVerification,
  useStartPhoneVerification,
  useVerifiedPhones,
} from "@/lib/queries/account";

// Mirrors backend normalizePhoneForOtp so the "already verified" check compares
// like with like. Display only — the backend remains the source of truth.
function normalize(input: string): string {
  const trimmed = input.trim().replace(/[\s()-]/g, "");
  const uae = trimmed.match(/^0(5\d{8})$/);
  return uae ? `+971${uae[1]}` : trimmed;
}

// 429/503/401/400 read very differently to a customer — a cooldown is not a
// wrong code, and a degraded OTP provider is not something retyping fixes.
function messageFor(err: any): string {
  const status = err?.response?.status;
  const data = err?.response?.data;
  if (status === 429) {
    const wait = data?.details?.retry_after_seconds;
    return wait
      ? `Too many attempts. Try again in ${wait}s.`
      : "Too many attempts. Please wait a moment.";
  }
  if (status === 503) {
    return "Phone verification is unavailable right now. Please contact support.";
  }
  if (status === 400) return "That doesn't look like a valid phone number.";
  // Discriminate on the code, not the bare status: this helper serves the
  // `start` mutation too, which has no code to be wrong. An expired session
  // 401s from jwtAuth as UNAUTHORIZED, and telling that user to re-check a
  // code they never typed is advice that can never work.
  if (status === 401 && data?.error === "INVALID_OTP") {
    return "That code is incorrect. Check it and try again.";
  }
  if (status === 401) return "Your session has expired. Please log in again.";
  return "Something went wrong. Please try again.";
}

// The address-save endpoints reject an unverified phone with 403
// PHONE_NOT_VERIFIED. The client-side gate (below) can drift from the
// server's, so both address surfaces surface this as a readable message
// rather than a generic save failure.
export function saveAddressErrorMessage(err: any): string | null {
  const status = err?.response?.status;
  const code = err?.response?.data?.error;
  if (status === 403 && code === "PHONE_NOT_VERIFIED") {
    return "This phone number hasn't been verified yet. Verify it above, then save again.";
  }
  // A changed phone that fails backend normalization (e.g. malformed input)
  // comes back as 400 INVALID_PHONE. Without this, it fell through to the
  // generic "Failed to save this address" message, which is advice that can
  // never work — reuse messageFor's wording instead of inventing a new string.
  if (status === 400 && code === "INVALID_PHONE") return messageFor(err);
  return null;
}

const ACTION_CLASS =
  "text-xs font-semibold text-nl-amber-text hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline";

export function PhoneVerifyField({
  value,
  onChange,
  onVerifiedChange,
  id,
  required,
  className,
  style,
  prefixClassName,
  prefixStyle,
  inputClassName,
  inputStyle,
  onFocus,
  onBlur,
  originalPhone,
}: {
  value: string;
  onChange: (phone: string) => void;
  onVerifiedChange: (verified: boolean) => void;
  id?: string;
  required?: boolean;
  className?: string;
  style?: CSSProperties;
  prefixClassName?: string;
  prefixStyle?: CSSProperties;
  inputClassName?: string;
  inputStyle?: CSSProperties;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  // The address's stored phone when EDITING an existing address; omit/undefined
  // when CREATING a new one. Mirrors the backend's own gate: a save is only
  // blocked on verification when the phone actually CHANGES, so an untouched
  // legacy/third-party number (grandfathered) must not dead-end the form.
  originalPhone?: string;
}) {
  const { data: verifiedPhones } = useVerifiedPhones();
  const start = useStartPhoneVerification();
  const confirm = useConfirmPhoneVerification();

  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalized = normalize(value);
  const isVerified = !!verifiedPhones?.some((p) => p.phone === normalized);
  // Format-insensitive: "0509999999" and "+971509999999" are the same number.
  const unchanged = !!originalPhone && normalize(originalPhone) === normalized;

  useEffect(() => {
    onVerifiedChange(isVerified || unchanged);
    if (isVerified) setCodeSent(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerified, unchanged, onVerifiedChange]);

  return (
    <div className="space-y-1.5">
      <PhoneInput
        id={id}
        value={value}
        onChange={(phone) => {
          onChange(phone);
          setCodeSent(false);
          setCode("");
          setError(null);
        }}
        required={required}
        className={className}
        style={style}
        prefixClassName={prefixClassName}
        prefixStyle={prefixStyle}
        inputClassName={inputClassName}
        inputStyle={inputStyle}
        onFocus={onFocus}
        onBlur={onBlur}
      />

      {isVerified && (
        <p className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <Check className="h-3 w-3" strokeWidth={2} />
          Verified
        </p>
      )}

      {!isVerified && unchanged && (
        <p className="text-xs text-nl-russet">Unchanged — no verification needed</p>
      )}

      {!isVerified && !unchanged && !codeSent && (
        <button
          type="button"
          disabled={!value || start.isPending}
          onClick={() => {
            setError(null);
            start.mutate(value, {
              onSuccess: () => setCodeSent(true),
              onError: (err) => setError(messageFor(err)),
            });
          }}
          className={ACTION_CLASS}
        >
          {start.isPending ? "Sending…" : "Verify this number"}
        </button>
      )}

      {!isVerified && !unchanged && codeSent && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            className="w-[110px] rounded-lg border border-nl-cacao/15 bg-nl-linen px-2.5 py-1.5 text-sm text-nl-cacao outline-none transition-colors focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
          />
          <button
            type="button"
            disabled={code.length < 4 || confirm.isPending}
            onClick={() => {
              setError(null);
              confirm.mutate(
                { phone: value, code },
                {
                  onSuccess: () => {
                    setCode("");
                    setCodeSent(false);
                  },
                  onError: (err) => setError(messageFor(err)),
                },
              );
            }}
            className="inline-flex items-center justify-center rounded-lg bg-nl-amber px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {confirm.isPending ? "Checking…" : "Confirm"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
