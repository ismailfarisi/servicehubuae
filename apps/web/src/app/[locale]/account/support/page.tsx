"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, LifeBuoy, Plus } from "lucide-react";
import { useMyTickets } from "@/lib/queries/support";
import { Eyebrow } from "@/components/ui/maison-primitives";

export default function SupportListPage() {
  const t = useTranslations("support");
  const locale = useLocale();
  const [page] = useState(1);
  const { data, isLoading } = useMyTickets({ page });
  const tickets = data?.data ?? [];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Eyebrow>Support</Eyebrow>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
            {t("list.title")}
          </h1>
        </div>
        <Link
          href={`/${locale}/account/support/new`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-nl-amber px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
          {t("list.new")}
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-nl-russet">…</p>
      ) : tickets.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-nl-cacao/10 bg-nl-linen px-6 py-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-nl-pearl text-nl-amber">
            <LifeBuoy className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <p className="text-sm text-nl-russet">{t("list.empty")}</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-nl-cacao/10 overflow-hidden rounded-2xl border border-nl-cacao/10 bg-nl-linen shadow-sm">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/${locale}/account/support/${ticket.id}`}
                className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-nl-pearl"
              >
                <span className="min-w-0 truncate text-sm font-medium text-nl-cacao">
                  {ticket.subject}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-nl-pearl px-2.5 py-0.5 text-xs font-medium text-nl-amber-text">
                    {t(`statuses.${ticket.status}`)}
                  </span>
                  <ChevronRight
                    className="h-4 w-4 text-nl-russet rtl:rotate-180"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
