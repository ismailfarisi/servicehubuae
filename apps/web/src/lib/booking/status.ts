import type { BookingStatus } from "./types";

/**
 * Badge tone for each of the 7 BookingStatus values — semantic traffic-light
 * convention: blue for confirmed/upcoming, green for a terminal-success
 * state, amber for in-flight (awaiting payment), red for terminal-failure,
 * neutral slate for inert states.
 */
export type BookingStatusTone = "blue" | "amber" | "green" | "red" | "neutral";

const TONES: Record<BookingStatus, BookingStatusTone> = {
  pending_payment: "amber",
  confirmed: "blue",
  rescheduled: "blue",
  cancelled: "red",
  completed: "green",
  no_show: "red",
  expired: "neutral",
};

export function bookingStatusTone(status: BookingStatus): BookingStatusTone {
  return TONES[status] ?? "neutral";
}

/**
 * Tailwind classes for a rounded-full status pill. Preferred for new code;
 * pair with e.g. `inline-flex items-center px-2.5 py-0.5 text-xs font-medium`.
 */
export const BOOKING_STATUS_BADGE_CLASS: Record<BookingStatusTone, string> = {
  blue: "rounded-full bg-nl-pearl text-nl-amber-text",
  green: "rounded-full bg-emerald-50 text-emerald-700",
  amber: "rounded-full bg-amber-50 text-amber-700",
  red: "rounded-full bg-red-50 text-red-700",
  neutral: "rounded-full bg-slate-100 text-slate-600",
};

/**
 * Inline-style equivalent of BOOKING_STATUS_BADGE_CLASS, kept for callers
 * that style badges via the `style` prop. Values mirror Tailwind's
 * emerald/amber/red/slate palettes and the blue theme tokens.
 */
export const BOOKING_STATUS_BADGE_STYLE: Record<
  BookingStatusTone,
  { border: string; background: string; color: string; borderRadius: string }
> = {
  blue: {
    border: "1px solid hsl(var(--nl-amber) / 0.2)",
    background: "hsl(var(--nl-pearl))",
    color: "hsl(var(--nl-amber-text))",
    borderRadius: "9999px",
  },
  green: {
    border: "1px solid rgb(167 243 208)", // emerald-200
    background: "rgb(236 253 245)", // emerald-50
    color: "rgb(4 120 87)", // emerald-700
    borderRadius: "9999px",
  },
  red: {
    border: "1px solid rgb(254 202 202)", // red-200
    background: "rgb(254 242 242)", // red-50
    color: "rgb(185 28 28)", // red-700
    borderRadius: "9999px",
  },
  amber: {
    border: "1px solid rgb(253 230 138)", // amber-200
    background: "rgb(255 251 235)", // amber-50
    color: "rgb(180 83 9)", // amber-700
    borderRadius: "9999px",
  },
  neutral: {
    border: "1px solid rgb(226 232 240)", // slate-200
    background: "rgb(241 245 249)", // slate-100
    color: "rgb(71 85 105)", // slate-600
    borderRadius: "9999px",
  },
};
