"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTicket, useSendMessage, useTicketStream } from "@/lib/queries/support";
import { MessageThread } from "@/components/support/message-thread";
import { TicketTimeline } from "@/components/support/ticket-timeline";
import { Eyebrow } from "@/components/ui/maison-primitives";

export default function SupportDetailPage() {
  const t = useTranslations("support");
  const { id } = useParams<{ id: string }>();
  const { data: ticket, isLoading } = useTicket(id);
  const send = useSendMessage(id);
  const [text, setText] = useState("");
  useTicketStream(id, true);

  if (isLoading || !ticket) return <p className="text-sm text-nl-russet">…</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const value = text;
    setText("");
    try {
      await send.mutateAsync(value);
    } catch {
      setText(value);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Eyebrow>{t("detail.ticketNumber")} {ticket.ticket_number}</Eyebrow>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight leading-tight text-nl-cacao">
          {ticket.subject}
        </h1>
      </div>
      <TicketTimeline currentStatus={ticket.status} />
      <div className="rounded-2xl border border-nl-cacao/10 bg-nl-linen p-4 shadow-sm">
        <MessageThread messages={ticket.messages ?? []} />
      </div>
      {ticket.status !== "closed" && (
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            className="flex-1 rounded-lg border border-nl-cacao/15 bg-nl-linen px-3.5 py-2.5 text-sm text-nl-cacao outline-none transition-colors focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("chat.replyPlaceholder")}
          />
          <button
            type="submit"
            disabled={send.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-nl-amber/90 transition-colors disabled:opacity-50"
          >
            {t("chat.send")}
          </button>
        </form>
      )}
    </div>
  );
}
