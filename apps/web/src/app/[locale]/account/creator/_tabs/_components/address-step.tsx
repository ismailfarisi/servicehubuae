"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { MaisonRadio } from "@/components/ui/maison-primitives";
import {
  Body,
  BUTTON_CLASS,
  ErrorNote,
  MaisonDialog,
  Quiet,
  SECONDARY_BUTTON_CLASS,
  SMALL_PRIMARY,
  SMALL_SECONDARY,
} from "@/components/creator/maison-ui";
import { type CollabApplication, setCollabAddress } from "@/lib/api/collab";
import { useAddresses } from "@/lib/queries/account";

/**
 * Where a seeded product should ship.
 *
 * The copy leads with what happens to the address, because being asked for a
 * home address by a marketplace is reasonably something a creator hesitates
 * over. The brand sees only that an address exists — never the address itself —
 * and that is enforced server-side by the vendor serializer, not just here.
 */
export function AddressStep({
  application,
  onClose,
  onSaved,
}: {
  application: CollabApplication;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("account");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: addresses, isLoading } = useAddresses();
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!selected) return;
    setBusy(true);
    setError(null);
    try {
      await setCollabAddress(application.id, selected);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("collabActionFailed"));
    } finally {
      setBusy(false);
    }
  }

  const list = (addresses ?? []) as Array<{ id: string; line1?: string; city?: string }>;

  return (
    <MaisonDialog
      eyebrow={t("shipping")}
      title={t("collabChooseAddress")}
      onClose={onClose}
      closeLabel={tc("close")}
    >
      <Body>{t("collabAddressPrivacy")}</Body>

      {isLoading ? (
        <div className="mt-4">
          <Quiet>{tc("loading")}</Quiet>
        </div>
      ) : list.length === 0 ? (
        <div className="mt-4 space-y-3">
          <Body>{t("collabNoAddresses")}</Body>
          <Link href={`/${locale}/account/addresses`} className={BUTTON_CLASS} style={SMALL_PRIMARY}>
            {t("collabAddAddress")}
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="space-y-2">
            {list.map((a) => (
              <label
                key={a.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                  selected === a.id
                    ? "border-nl-amber bg-nl-pearl"
                    : "border-nl-cacao/15 bg-nl-linen hover:bg-nl-pearl"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  className="sr-only"
                  checked={selected === a.id}
                  onChange={() => setSelected(a.id)}
                />
                <MaisonRadio selected={selected === a.id} />
                <span className="text-sm text-nl-cacao">
                  <span className="block font-medium">{a.line1}</span>
                  <span className="block text-nl-russet">
                    {a.city}
                  </span>
                </span>
              </label>
            ))}
          </div>

          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={SECONDARY_BUTTON_CLASS}
              style={SMALL_SECONDARY}
            >
              {tc("cancel")}
            </button>
            <button
              type="button"
              disabled={!selected || busy}
              onClick={save}
              className={BUTTON_CLASS}
              style={SMALL_PRIMARY}
            >
              {busy ? tc("loading") : t("collabConfirmAddress")}
            </button>
          </div>
        </div>
      )}
    </MaisonDialog>
  );
}
