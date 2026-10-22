"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PhoneVerifyField, saveAddressErrorMessage } from "@/components/account/phone-verify-field";
import { UAE_EMIRATES } from "@/lib/emirates";

interface AddressFormData {
  full_name: string;
  phone: string;
  building_name: string;
  floor: string;
  apartment: string;
  street: string;
  area: string;
  city: string;
  emirate: string;
  is_default?: boolean;
}

// Ordered field config. `labelKey` resolves under the "account" namespace.
const FIELDS: {
  key: keyof Omit<AddressFormData, "is_default">;
  labelKey: string;
  required: boolean;
  type?: "text" | "phone" | "emirate";
}[] = [
  { key: "full_name", labelKey: "fullName", required: true },
  { key: "phone", labelKey: "phoneNumber", required: true, type: "phone" },
  { key: "building_name", labelKey: "buildingName", required: true },
  { key: "floor", labelKey: "floor", required: false },
  { key: "apartment", labelKey: "apartment", required: false },
  { key: "street", labelKey: "streetAddress", required: true },
  { key: "area", labelKey: "areaDistrict", required: false },
  { key: "city", labelKey: "cityLabel", required: true },
  { key: "emirate", labelKey: "emirateLabel", required: true, type: "emirate" },
];

const FIELD_CLASS =
  "w-full rounded-lg border border-nl-cacao/15 bg-nl-linen px-3.5 py-2.5 text-sm text-nl-cacao outline-none transition-colors focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20";

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initial?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const tEmirates = useTranslations("emirates");
  const [form, setForm] = useState<AddressFormData>({
    full_name: initial?.full_name || "",
    phone: initial?.phone || "",
    building_name: initial?.building_name || "",
    floor: initial?.floor || "",
    apartment: initial?.apartment || "",
    street: initial?.street || "",
    area: initial?.area || "",
    city: initial?.city || "",
    emirate: initial?.emirate || "",
    is_default: initial?.is_default || false,
  });
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);


  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaveError(null);
        try {
          await onSubmit(form);
        } catch (err) {
          setSaveError(saveAddressErrorMessage(err) ?? "Failed to save this address. Please try again.");
        }
      }}
      className="space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELDS.map(({ key, labelKey, required, type }) => {
          const label = t(labelKey);
          if (type === "phone") {
            return (
              <PhoneVerifyField
                key={key}
                value={form[key]}
                onChange={(phone) => setForm({ ...form, [key]: phone })}
                onVerifiedChange={setPhoneVerified}
                originalPhone={initial?.phone}
                required={required}
                className="flex w-full items-center rounded-lg border border-nl-cacao/15 bg-nl-linen px-3.5 py-2.5 text-sm text-nl-cacao transition-colors focus-within:border-nl-amber focus-within:ring-2 focus-within:ring-nl-amber/20"
                prefixClassName="me-2 text-nl-russet"
                inputClassName="w-full bg-transparent outline-none"
                inputStyle={{ border: "none" }}
              />
            );
          }
          if (type === "emirate") {
            return (
              <select
                key={key}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required={required}
                className={FIELD_CLASS}
              >
                <option value="" disabled>
                  {label}
                </option>
                {UAE_EMIRATES.map((em) => (
                  <option key={em.value} value={em.value}>
                    {tEmirates(em.labelKey)}
                  </option>
                ))}
              </select>
            );
          }
          return (
            <input
              key={key}
              type="text"
              placeholder={label}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              required={required}
              className={FIELD_CLASS}
            />
          );
        })}
      </div>
      <label className="flex items-center gap-2 text-sm text-nl-cacao">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
          className="h-4 w-4 rounded accent-nl-amber"
        />
        {t("setAsDefault")}
      </label>
      {saveError && (
        <p className="text-red-600 text-xs" role="alert">
          {saveError}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isLoading || !phoneVerified}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? tCommon("loading") : tCommon("save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-nl-cacao/15 bg-nl-linen px-5 py-2.5 text-sm font-semibold text-nl-cacao hover:bg-nl-pearl transition-colors"
        >
          {tCommon("cancel")}
        </button>
      </div>
    </form>
  );
}
