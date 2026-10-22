"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/lib/queries/account";
import { AddressForm } from "@/components/account/address-form";
import { MapPin, Trash2, Edit2, Plus } from "lucide-react";
import { Eyebrow } from "@/components/ui/maison-primitives";

export default function AddressesPage() {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading)
    return (
      <div className="py-12 text-center text-sm text-nl-russet">
        {tCommon("loading")}
      </div>
    );

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <Eyebrow>Addresses</Eyebrow>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
            {t("addresses")}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-nl-amber px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          {tCommon("addAddress")}
        </button>
      </div>

      {showForm && !editingId && (
        <div className="mb-4">
          <AddressForm
            onSubmit={async (data) => {
              await createAddress.mutateAsync(data);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
            isLoading={createAddress.isPending}
          />
        </div>
      )}

      <div className="space-y-3">
        {(addresses || []).map((addr: any) => (
          <div
            key={addr.id}
            className="rounded-2xl border border-nl-cacao/10 bg-nl-linen p-4 md:p-5 shadow-sm"
          >
            {editingId === addr.id ? (
              <AddressForm
                initial={addr}
                onSubmit={async (data) => {
                  await updateAddress.mutateAsync({ id: addr.id, ...data });
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
                isLoading={updateAddress.isPending}
              />
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0 flex-1">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nl-pearl text-nl-amber">
                    <MapPin className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="flex flex-wrap items-center gap-2 text-sm font-semibold text-nl-cacao"
                    >
                      <span className="break-words">{addr.full_name}</span>
                      {addr.is_default && (
                        <span className="inline-flex items-center whitespace-nowrap rounded-full bg-nl-pearl px-2.5 py-0.5 text-xs font-medium text-nl-amber-text">
                          {t("defaultAddress")}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-nl-russet break-words mt-0.5">
                      {[
                        addr.building_name,
                        addr.apartment,
                        addr.floor,
                        addr.street,
                        addr.area,
                        addr.city,
                        addr.emirate,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-sm text-nl-russet break-words">
                      {addr.phone}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingId(addr.id)}
                    className="rounded-lg p-2 text-nl-russet hover:bg-nl-pearl hover:text-nl-amber-text transition-colors"
                    aria-label={tCommon("edit")}
                  >
                    <Edit2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(tCommon("deleteConfirm"))) {
                        deleteAddress.mutate(addr.id);
                      }
                    }}
                    className="rounded-lg p-2 text-nl-russet transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label={tCommon("delete")}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
