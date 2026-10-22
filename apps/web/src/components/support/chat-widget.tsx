"use client";

import { MAISON_SANS } from "@/components/ui/maison-primitives";
import { MessageThread } from "@/components/support/message-thread";
import { useCreateTicket, useSendMessage, useTicket, useTicketStream } from "@/lib/queries/support";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import { MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function ChatWidget() {
  const t = useTranslations("support");
  const { isOpen, open, close, activeTicketId, setActiveTicket } = useChatStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: ticket } = useTicket(activeTicketId ?? undefined);
  useTicketStream(activeTicketId ?? undefined, isOpen && !!activeTicketId);

  // Escape to close + scroll-lock while open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={open}
        aria-label={t("chat.open")}
        // Sits above the mobile tab bar (h-14 + safe area), which is lg:hidden —
        // at lg+ the bar is gone and the launcher drops back to the corner.
        // Same offset the filter pill uses, so the two stack consistently.
        className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] lg:bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-nl-amber text-white shadow-lg transition-colors hover:bg-nl-amber/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nl-amber"
      >
        <MessageCircle size={24} />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label={t("chat.close")}
            onClick={close}
            className="fixed inset-0 z-40"
            style={{ background: "hsl(var(--nl-espresso) / 0.35)" }}
          />
          {/* biome-ignore lint/a11y/useSemanticElements: native <dialog> brings its own positioning/backdrop semantics that conflict with this slide-over layout */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t("chat.title")}
            className="fixed bottom-0 end-0 z-50 flex h-[70vh] w-full max-w-sm flex-col overflow-hidden rounded-t-2xl border border-nl-cacao/10 bg-nl-linen text-nl-cacao shadow-2xl sm:bottom-5 sm:end-5 sm:h-[520px] sm:rounded-2xl"
            style={{ fontFamily: MAISON_SANS }}
          >
            <header className="flex items-center justify-between bg-nl-amber px-4 py-3 text-white">
              <span className="font-display text-base font-semibold">{t("chat.title")}</span>
              <button
                type="button"
                onClick={close}
                aria-label={t("chat.close")}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/15"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTicketId && ticket ? (
                <MessageThread messages={ticket.messages ?? []} />
              ) : activeTicketId ? (
                <p className="text-sm text-nl-russet" style={{ fontFamily: MAISON_SANS }}>
                  …
                </p>
              ) : (
                <StartConversation
                  isGuest={!isAuthenticated}
                  onCreated={(id) => setActiveTicket(id)}
                />
              )}
            </div>

            {activeTicketId && ticket && <Composer ticketId={activeTicketId} />}
          </aside>
        </>
      )}
    </>
  );
}

function StartConversation({
  isGuest,
  onCreated,
}: {
  isGuest: boolean;
  onCreated: (id: string) => void;
}) {
  const t = useTranslations("support");
  const create = useCreateTicket();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const ticket = await create.mutateAsync({
        subject: subject || message.slice(0, 60),
        category: null,
        message,
        ...(isGuest ? { guest_name: name, guest_email: email } : {}),
      });
      onCreated(ticket.id);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? t("errors.submitFailed"));
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <p className="text-sm text-nl-russet">{t("chat.intro")}</p>
      {isGuest && (
        <>
          <input
            className="rounded-lg border border-nl-cacao/15 bg-nl-linen px-3 py-2 text-sm text-nl-cacao outline-none placeholder:text-nl-russet/60 focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
            placeholder={t("chat.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="rounded-lg border border-nl-cacao/15 bg-nl-linen px-3 py-2 text-sm text-nl-cacao outline-none placeholder:text-nl-russet/60 focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
            placeholder={t("chat.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </>
      )}
      <textarea
        className="rounded-lg border border-nl-cacao/15 bg-nl-linen px-3 py-2 text-sm text-nl-cacao outline-none placeholder:text-nl-russet/60 focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
        placeholder={t("chat.messagePlaceholder")}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={3}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={create.isPending}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-nl-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nl-amber/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {create.isPending ? t("chat.sending") : t("chat.start")}
      </button>
    </form>
  );
}

function Composer({ ticketId }: { ticketId: string }) {
  const t = useTranslations("support");
  const send = useSendMessage(ticketId);
  const [text, setText] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const value = text;
    setText("");
    try {
      await send.mutateAsync(value);
    } catch {
      setText(value); // restore on failure
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 border-t border-nl-cacao/10 p-3">
      <input
        className="flex-1 rounded-lg border border-nl-cacao/15 bg-nl-linen px-3 py-2 text-sm text-nl-cacao outline-none placeholder:text-nl-russet/60 focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20"
        placeholder={t("chat.replyPlaceholder")}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        disabled={send.isPending}
        className="inline-flex items-center justify-center rounded-lg bg-nl-amber px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nl-amber/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("chat.send")}
      </button>
    </form>
  );
}
