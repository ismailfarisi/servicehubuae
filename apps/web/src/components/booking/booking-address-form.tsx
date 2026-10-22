"use client";

import { useTranslations } from "next-intl";
import { Eyebrow, MaisonRadio, MaisonTile } from "@/components/ui/maison-primitives";

export interface HomeVisitAddressState {
  full_name: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  emirate: string;
}

export const EMPTY_HOME_VISIT_ADDRESS: HomeVisitAddressState = {
  full_name: "",
  phone: "",
  street: "",
  area: "",
  city: "",
  emirate: "",
};

const ADDRESS_FIELDS: {
  key: keyof HomeVisitAddressState;
  labelKey: string;
  required: boolean;
}[] = [
  { key: "full_name", labelKey: "addressFullName", required: true },
  { key: "phone", labelKey: "addressPhone", required: true },
  { key: "street", labelKey: "addressStreet", required: true },
  { key: "area", labelKey: "addressArea", required: false },
  { key: "city", labelKey: "addressCity", required: true },
  { key: "emirate", labelKey: "addressEmirate", required: true },
];

/**
 * Home-visit address collection for booking checkout — reuses the
 * checkout AddressDrawer's field set (full_name/phone/street/area/city/
 * emirate) and the account's saved addresses, but is NOT wired to
 * useCreateAddress/useUpdateAddress: `customer_address` on POST /bookings
 * is a plain snapshot object, not an account address record, so a
 * freehand entry here is never persisted to the account — only selecting
 * an existing saved address reuses account data.
 */
export function BookingAddressForm({
  areaName,
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  useNewAddress,
  onToggleNewAddress,
  newAddress,
  onChangeNewAddress,
}: {
  areaName: string | null;
  savedAddresses: any[] | undefined;
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
  useNewAddress: boolean;
  onToggleNewAddress: () => void;
  newAddress: HomeVisitAddressState;
  onChangeNewAddress: (field: keyof HomeVisitAddressState, value: string) => void;
}) {
  const t = useTranslations("booking.checkout");
  const hasSaved = !!savedAddresses && savedAddresses.length > 0;
  const showNewForm = useNewAddress || !hasSaved;

  return (
    <div className="mt-6">
      <Eyebrow className="mb-2.5 text-sm">{t("addressTitle")}</Eyebrow>
      {areaName && <p className="mb-3 text-sm text-nl-russet">{areaName}</p>}

      {hasSaved && !useNewAddress && (
        <div className="space-y-2">
          {savedAddresses!.map((addr) => (
            <MaisonTile
              key={addr.id}
              selected={selectedAddressId === addr.id}
              onClick={() => onSelectAddress(addr.id)}
              className="p-3"
            >
              <div className="flex items-start gap-2.5">
                <MaisonRadio selected={selectedAddressId === addr.id} />
                <div className="text-sm text-nl-cacao">
                  <div className="font-medium">{addr.full_name}</div>
                  <div className="text-nl-russet">
                    {[addr.street, addr.area, addr.city, addr.emirate].filter(Boolean).join(", ")}
                  </div>
                </div>
              </div>
            </MaisonTile>
          ))}
        </div>
      )}

      {hasSaved && (
        <button
          type="button"
          onClick={onToggleNewAddress}
          className="mt-3 text-sm font-semibold text-nl-amber-text hover:underline"
        >
          {useNewAddress ? t("addressUseSaved") : t("addressAddNew")}
        </button>
      )}

      {showNewForm && (
        <div className="mt-3 space-y-3">
          {ADDRESS_FIELDS.map(({ key, labelKey, required }) => {
            const id = `home-visit-${key}`;
            return (
              <div key={key}>
                <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-nl-russet">
                  {t(labelKey as any)}
                  {required && <span className="ms-1 text-nl-amber-text">*</span>}
                </label>
                <input
                  id={id}
                  type="text"
                  value={newAddress[key]}
                  onChange={(e) => onChangeNewAddress(key, e.target.value)}
                  required={required}
                  className="w-full rounded-lg border border-nl-cacao/15 bg-nl-linen px-3.5 py-2.5 text-sm text-nl-cacao outline-none transition focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
