"use client";

import { MAISON_SANS, MAISON_SERIF } from "@/components/ui/maison-primitives";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/**
 * Maison styling for the creator dashboard.
 *
 * The rest of /account is styled inline, page by page (see settings, wallet,
 * orders). The creator dashboard is a dozen files deep with the same handful of
 * controls repeated throughout, so the tokens live here instead of being copied
 * into each tab. Values are the storefront's, not new ones: rounded corners,
 * blue primary with white text, light navy borders, MAISON_SANS for labels and
 * body copy and MAISON_SERIF (the display sans) for titles and figures.
 */

/** Panel / row surface — the rounded white card used by wallet and orders rows. */
export const BOX = {
  border: "1px solid hsl(var(--nl-cacao) / 0.10)",
  background: "hsl(var(--nl-linen))",
  borderRadius: 16,
  boxShadow: "0 1px 2px hsl(var(--nl-cacao) / 0.05)",
} as const;

export const INPUT_CLASS =
  "w-full px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-nl-amber focus:ring-2 focus:ring-nl-amber/20";

export const INPUT_STYLE = {
  border: "1px solid hsl(var(--nl-cacao) / 0.15)",
  background: "hsl(var(--nl-linen))",
  color: "hsl(var(--nl-cacao))",
  borderRadius: "var(--radius)",
  fontFamily: MAISON_SANS,
} as const;

export const BUTTON_CLASS =
  "inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

const BUTTON_BASE = {
  fontFamily: MAISON_SANS,
  fontSize: 14,
  fontWeight: 600,
  padding: "10px 20px",
  borderRadius: "var(--radius)",
} as const;

export const PRIMARY_BUTTON = {
  ...BUTTON_BASE,
  background: "hsl(var(--nl-amber))",
  color: "white",
  border: "1px solid hsl(var(--nl-amber))",
  boxShadow: "0 1px 2px hsl(var(--nl-cacao) / 0.08)",
} as const;

export const SECONDARY_BUTTON = {
  ...BUTTON_BASE,
  background: "hsl(var(--nl-linen))",
  color: "hsl(var(--nl-cacao))",
  border: "1px solid hsl(var(--nl-cacao) / 0.15)",
} as const;

export const SECONDARY_BUTTON_CLASS = `${BUTTON_CLASS} hover:!bg-nl-pearl`;

/** Text-only action — withdraw, delete, "view history". */
export const QUIET_BUTTON = {
  ...BUTTON_BASE,
  background: "transparent",
  color: "hsl(var(--nl-amber-text))",
  border: "1px solid transparent",
} as const;

/** Compact variants for controls sitting inside a card row. */
export const SMALL_PRIMARY = { ...PRIMARY_BUTTON, padding: "7px 14px", fontSize: 13 } as const;
export const SMALL_SECONDARY = { ...SECONDARY_BUTTON, padding: "7px 14px", fontSize: 13 } as const;
export const SMALL_QUIET = { ...QUIET_BUTTON, padding: "7px 12px", fontSize: 13 } as const;

export type Tone = "amber" | "success" | "danger" | "muted";

/** Same tinted-outline treatment the order status chips use. */
const TONE: Record<Tone, { border: string; background: string; color: string }> = {
  amber: {
    border: "hsl(var(--nl-amber) / 0.3)",
    background: "hsl(var(--nl-amber) / 0.08)",
    color: "hsl(var(--nl-amber-text))",
  },
  success: {
    border: "hsl(142 60% 35% / 0.3)",
    background: "hsl(142 60% 35% / 0.08)",
    color: "hsl(142 64% 26%)",
  },
  danger: {
    border: "hsl(var(--destructive) / 0.3)",
    background: "hsl(var(--destructive) / 0.06)",
    color: "hsl(var(--destructive))",
  },
  muted: {
    border: "hsl(var(--nl-cacao) / 0.12)",
    background: "hsl(var(--nl-pearl))",
    color: "hsl(var(--nl-russet))",
  },
};

export function Pill({ tone = "muted", children }: { tone?: Tone; children: ReactNode }) {
  const t = TONE[tone];
  return (
    <span
      className="inline-block whitespace-nowrap capitalize"
      style={{
        fontFamily: MAISON_SANS,
        fontSize: 12,
        fontWeight: 500,
        padding: "2px 10px",
        borderRadius: 999,
        border: `1px solid ${t.border}`,
        background: t.background,
        color: t.color,
      }}
    >
      {children}
    </span>
  );
}

/** Muted placeholder used for every loading/empty state under /account. */
export function Quiet({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={className}
      style={{
        fontFamily: MAISON_SANS,
        fontSize: 14,
        color: "hsl(var(--nl-russet))",
      }}
    >
      {children}
    </p>
  );
}

/** Running text — intros, hints, secondary detail. */
export function Body({
  children,
  className,
  size = 13,
}: {
  children: ReactNode;
  className?: string;
  size?: number;
}) {
  return (
    <p
      className={className}
      style={{
        fontFamily: MAISON_SANS,
        fontSize: size,
        lineHeight: 1.5,
        color: "hsl(var(--nl-russet))",
      }}
    >
      {children}
    </p>
  );
}

export function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block"
      style={{
        fontFamily: MAISON_SANS,
        fontSize: 13,
        fontWeight: 500,
        color: "hsl(var(--nl-cacao))",
      }}
    >
      {children}
    </label>
  );
}

/** Bordered banner for a failure the creator has to read before retrying. */
export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-4 py-3"
      style={{
        fontFamily: MAISON_SANS,
        fontSize: 13,
        borderRadius: "var(--radius)",
        border: `1px solid ${TONE.danger.border}`,
        background: TONE.danger.background,
        color: TONE.danger.color,
      }}
    >
      {children}
    </div>
  );
}

/** One-line result of an action — saved, sent, declined. */
export function StatusLine({ kind, children }: { kind: "ok" | "err"; children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: MAISON_SANS,
        fontSize: 13,
        color: kind === "ok" ? "hsl(142 64% 26%)" : "hsl(var(--destructive))",
      }}
    >
      {children}
    </p>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition-colors"
      style={{
        fontFamily: MAISON_SANS,
        fontSize: 13,
        fontWeight: 500,
        padding: "6px 14px",
        borderRadius: 999,
        border: `1px solid ${active ? "hsl(var(--nl-amber))" : "hsl(var(--nl-cacao) / 0.15)"}`,
        background: active ? "hsl(var(--nl-amber))" : "hsl(var(--nl-linen))",
        color: active ? "white" : "hsl(var(--nl-russet))",
      }}
    >
      {children}
    </button>
  );
}

/**
 * Centred modal on a white card, matching the checkout address drawer:
 * navy-tinted scrim, rounded panel, eyebrow + display title, X to dismiss.
 */
export function MaisonDialog({
  eyebrow,
  title,
  onClose,
  closeLabel,
  children,
}: {
  eyebrow: string;
  title: string;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-label={closeLabel}
        className="fixed inset-0 z-40 cursor-default"
        style={{ background: "hsl(var(--nl-espresso) / 0.5)" }}
        onClick={onClose}
      />
      {/* biome-ignore lint/a11y/useSemanticElements: a native <dialog> brings its own backdrop and centring, which fight this scrim + panel layout */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl pointer-events-auto"
          style={{
            background: "hsl(var(--nl-linen))",
            color: "hsl(var(--nl-cacao))",
            fontFamily: MAISON_SANS,
            boxShadow: "0 24px 60px hsl(var(--nl-espresso) / 0.25)",
          }}
        >
          <div
            className="flex items-start justify-between gap-4"
            style={{
              padding: "20px 22px 16px",
              borderBottom: "1px solid hsl(var(--nl-cacao) / 0.1)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "hsl(var(--nl-amber-text))",
                }}
              >
                {eyebrow}
              </div>
              <h2
                style={{
                  fontFamily: MAISON_SERIF,
                  fontSize: 22,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  marginTop: 4,
                  fontWeight: 700,
                }}
              >
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="grid place-items-center rounded-full transition-colors hover:bg-nl-pearl shrink-0"
              style={{ width: 34, height: 34, color: "hsl(var(--nl-russet))" }}
            >
              <X className="h-4 w-4" strokeWidth={1.25} />
            </button>
          </div>
          <div style={{ padding: "18px 22px 22px" }}>{children}</div>
        </div>
      </div>
    </>
  );
}
