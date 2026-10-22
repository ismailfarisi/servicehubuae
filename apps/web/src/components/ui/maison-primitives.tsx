"use client";

import type { ReactNode } from "react";

// Shared storefront primitives. The `Maison*` / `Serif*` names predate the
// blue & white redesign; the look is now modern sans with rounded surfaces.
export const MAISON_SERIF =
  "var(--font-jakarta), var(--font-arabic), system-ui, sans-serif";
export const MAISON_SANS =
  "var(--font-inter), var(--font-arabic), system-ui, sans-serif";

const BORDER = "hsl(var(--nl-cacao) / 0.12)";
const BORDER_STRONG = "hsl(var(--nl-cacao) / 0.25)";

export function Eyebrow({
  children,
  className,
  amber = true,
}: {
  children: ReactNode;
  className?: string;
  amber?: boolean;
}) {
  return (
    <div
      className={`text-xs font-semibold ${className ?? ""}`}
      style={{
        color: amber ? "hsl(var(--nl-amber-text))" : "hsl(var(--nl-russet))",
        fontFamily: MAISON_SANS,
      }}
    >
      {children}
    </div>
  );
}

export function SerifTitle({
  children,
  size = 22,
  className,
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        fontFamily: MAISON_SERIF,
        fontSize: size,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
        fontWeight: 700,
        color: "hsl(var(--nl-cacao))",
      }}
    >
      {children}
    </div>
  );
}

export function MaisonCard({
  title,
  badge,
  cta,
  eyebrowHint,
  children,
}: {
  title: string;
  badge?: ReactNode;
  cta?: ReactNode;
  eyebrowHint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-2.5">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-nl-cacao">{title}</h3>
          {badge && <span className="text-sm text-nl-russet">· {badge}</span>}
        </div>
        {cta}
      </div>
      {eyebrowHint && <div className="mb-2.5 text-xs text-nl-amber-text">{eyebrowHint}</div>}
      <div
        className="rounded-xl bg-nl-linen shadow-sm"
        style={{ border: `1px solid ${BORDER}`, padding: 18 }}
      >
        {children}
      </div>
    </div>
  );
}

export function MaisonRadio({ selected }: { selected: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: `${selected ? 5 : 1.5}px solid ${selected ? "hsl(var(--nl-amber))" : BORDER_STRONG}`,
        background: "hsl(var(--nl-linen))",
        marginTop: 2,
        flexShrink: 0,
        transition: "border-width 120ms ease",
      }}
    />
  );
}

export function MaisonCheck({ checked }: { checked: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        border: `1.5px solid ${checked ? "hsl(var(--nl-amber))" : BORDER_STRONG}`,
        background: checked ? "hsl(var(--nl-amber))" : "hsl(var(--nl-linen))",
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg
          width="11"
          height="11"
          viewBox="0 0 12 12"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <title>Selected</title>
          <path d="M2 6.5 L5 9 L10 3" />
        </svg>
      )}
    </span>
  );
}

export function MaisonTile({
  selected,
  onClick,
  disabled,
  children,
  className,
}: {
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-start rounded-xl transition-all w-full hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${className ?? ""}`}
      style={{
        border: `1px solid ${selected ? "hsl(var(--nl-amber))" : BORDER}`,
        background: selected ? "hsl(var(--nl-pearl))" : "hsl(var(--nl-linen))",
        boxShadow: selected ? "0 0 0 3px hsl(var(--nl-amber) / 0.15)" : undefined,
      }}
    >
      {children}
    </button>
  );
}

export function MaisonMark({
  size = 11,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      style={{ width: size, height: size, color: "hsl(var(--nl-amber))" }}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <title>ServiceHubUAE mark</title>
      <path d="M 15 4 A 8 8 0 1 0 15 20 A 6 6 0 1 1 15 4 Z" fill="currentColor" />
      <circle cx="20.5" cy="6" r="1.3" fill="currentColor" />
    </svg>
  );
}

export function MaisonStepper({
  steps,
  active,
}: {
  steps: string[];
  active: number;
}) {
  return (
    <div
      className="hidden md:flex items-center text-sm font-medium"
      style={{ gap: 14, fontFamily: MAISON_SANS }}
    >
      {steps.map((s, i) => (
        <div key={s} className="flex items-center" style={{ gap: 14 }}>
          <span
            className="flex items-center"
            style={{
              gap: 8,
              color:
                i === active
                  ? "hsl(var(--nl-cacao))"
                  : i < active
                    ? "hsl(var(--nl-russet))"
                    : "hsl(var(--nl-cacao) / 0.4)",
            }}
          >
            <span
              className="inline-flex items-center justify-center"
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: i <= active ? "none" : `1.5px solid ${BORDER_STRONG}`,
                background: i <= active ? "hsl(var(--nl-amber))" : "transparent",
                color: i <= active ? "#fff" : "inherit",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {i < active ? (
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <title>Completed</title>
                  <path d="M2 6.5 L5 9 L10 3" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            {s}
          </span>
          {i < steps.length - 1 && (
            <span
              style={{
                width: 32,
                height: 2,
                borderRadius: 2,
                background: i < active ? "hsl(var(--nl-amber))" : BORDER,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
