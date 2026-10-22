"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCreateTicket } from "@/lib/queries/support";
import { Eyebrow } from "@/components/ui/maison-primitives";

const CATEGORIES = ["order", "payment", "product", "account"] as const;

const FIELD_CLASS =
  "w-full rounded-lg border border-nl-cacao/15 bg-nl-linen px-3.5 py-2.5 text-sm text-nl-cacao outline-none transition-colors focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20";

export default function NewTicketPage() {
  const t = useTranslations("support");
  const router = useRouter();
  const locale = useLocale();
  const create = useCreateTicket();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number] | "">("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const ticket = await create.mutateAsync({
        subject,
        category: category || null,
        message,
      });
      router.push(`/${locale}/account/support/${ticket.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? t("errors.submitFailed"));
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <Eyebrow>Support</Eyebrow>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
          {t("list.new")}
        </h1>
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border border-nl-cacao/10 bg-nl-linen p-5 md:p-6 shadow-sm">
        <input className={FIELD_CLASS} placeholder={t("form.subject")}
          value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <select className={FIELD_CLASS} value={category}
          onChange={(e) => setCategory(e.target.value as any)}>
          <option value="">{t("form.category")}</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <textarea className={FIELD_CLASS} rows={5} placeholder={t("form.message")}
          value={message} onChange={(e) => setMessage(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={create.isPending}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors disabled:opacity-50"
        >
          {create.isPending ? t("form.submitting") : t("form.submit")}
        </button>
      </div>
    </form>
  );
}
