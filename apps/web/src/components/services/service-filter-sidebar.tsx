"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { ServiceFacetConfig, ServiceFilterDraft } from "./service-filter-state";

const VISIT_OPTIONS = [
  { value: "at_premises", labelKey: "visitAtPremises" },
  { value: "home_visit", labelKey: "visitHomeVisit" },
] as const;

function readDraft(searchParams: URLSearchParams): ServiceFilterDraft {
  const out: ServiceFilterDraft = {};
  for (const [k, v] of searchParams.entries()) {
    if (k === "page") continue;
    out[k] = v;
  }
  return out;
}

export function ServiceFilterSidebar({ config }: { config: ServiceFacetConfig }) {
  const t = useTranslations("service.listing");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<ServiceFilterDraft>(() =>
    readDraft(new URLSearchParams(searchParams.toString())),
  );

  useEffect(() => {
    if (isPending) return;
    setDraft(readDraft(new URLSearchParams(searchParams.toString())));
  }, [searchParams, isPending]);

  const commit = useCallback(
    (next: ServiceFilterDraft) => {
      setDraft(next);
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) {
        if (v) params.set(k, v);
      }
      // Any filter change invalidates the current page offset.
      params.delete("page");
      startTransition(() => {
        router.replace(`?${params.toString()}`, { scroll: false });
      });
    },
    [router],
  );

  const toggle = useCallback(
    (key: string, value: string) => {
      const next = { ...draft };
      if (next[key] === value) delete next[key];
      else next[key] = value;
      commit(next);
    },
    [draft, commit],
  );

  const clearAll = useCallback(() => {
    setDraft({});
    startTransition(() => {
      router.replace("?", { scroll: false });
    });
  }, [router]);

  return (
    <aside
      aria-label={t("filters")}
      data-pending={isPending ? "" : undefined}
      className="rounded-2xl border border-nl-cacao/10 bg-nl-linen p-4 shadow-sm sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between border-b border-nl-cacao/10 pb-3">
        <h2 className="font-display text-base font-semibold text-nl-cacao">
          {t("filters")}
        </h2>
        <button type="button" onClick={clearAll} className="text-sm font-semibold text-nl-amber-text hover:underline">
          {t("clearAll")}
        </button>
      </div>

      {/* Facets with no values are hidden, not rendered empty — the rating
          group in particular has no data until real reviews exist. */}
      {config.areas.length > 0 && (
        <fieldset className="mb-5 last:mb-0">
          <legend className="mb-2 text-sm font-semibold text-nl-cacao">
            {t("area")}
          </legend>
          {config.areas.map((area) => (
            <label key={area.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-nl-cacao transition-colors hover:bg-nl-pearl">
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 rounded border-nl-cacao/30 accent-nl-amber"
                aria-label={area.label}
                checked={draft.area === area.value}
                onChange={() => toggle("area", area.value)}
              />
              <span>{area.label}</span>
              {area.count != null && <span className="ms-auto text-xs text-nl-russet">({area.count})</span>}
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className="mb-5 last:mb-0">
        <legend className="mb-2 text-sm font-semibold text-nl-cacao">
          {t("visit")}
        </legend>
        {VISIT_OPTIONS.map((opt) => (
          <label key={opt.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-nl-cacao transition-colors hover:bg-nl-pearl">
            <input
              type="checkbox"
              className="h-4 w-4 shrink-0 rounded border-nl-cacao/30 accent-nl-amber"
              aria-label={t(opt.labelKey)}
              checked={draft.visit === opt.value}
              onChange={() => toggle("visit", opt.value)}
            />
            <span>{t(opt.labelKey)}</span>
          </label>
        ))}
      </fieldset>

      {config.categories.length > 0 && (
        <fieldset className="mb-5 last:mb-0">
          <legend className="mb-2 text-sm font-semibold text-nl-cacao">
            {t("category")}
          </legend>
          {config.categories.map((cat) => (
            <label key={cat.value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-nl-cacao transition-colors hover:bg-nl-pearl">
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 rounded border-nl-cacao/30 accent-nl-amber"
                aria-label={cat.label}
                checked={draft.category === cat.value}
                onChange={() => toggle("category", cat.value)}
              />
              <span>{cat.label}</span>
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className="mb-5 last:mb-0">
        <legend className="mb-2 text-sm font-semibold text-nl-cacao">
          {t("priceAed")}
        </legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            aria-label={t("minPrice")}
            value={draft.minPrice ?? ""}
            onChange={(e) => commit({ ...draft, minPrice: e.target.value })}
            className="w-full rounded-lg border border-nl-cacao/15 bg-nl-linen px-3 py-2 text-sm text-nl-cacao outline-none transition focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
          />
          <span className="text-nl-russet">–</span>
          <input
            type="number"
            min={0}
            aria-label={t("maxPrice")}
            value={draft.maxPrice ?? ""}
            onChange={(e) => commit({ ...draft, maxPrice: e.target.value })}
            className="w-full rounded-lg border border-nl-cacao/15 bg-nl-linen px-3 py-2 text-sm text-nl-cacao outline-none transition focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
          />
        </div>
      </fieldset>
    </aside>
  );
}
