import { describe, expect, it } from "bun:test";
import type { BookingPaymentCompleteInput } from "./booking-payment.gateway.ts";
import {
  DEFAULT_SETTLEMENT_WINDOW_DAYS,
  LocalBookingPaymentGateway,
  ONLINE_PAYMENT_UNAVAILABLE,
  resolveSettlementWindowDays,
} from "./local-booking-payment.gateway.ts";

const NOW = new Date("2026-10-22T08:00:00.000Z");
const DAY_MS = 86_400_000;

interface Call {
  sql: string;
  params: unknown[];
}

// A fake `AppDataSource.query`: answers the settlement-window lookup, the
// INSERT ... RETURNING and the fallback SELECT from the scripted values.
function fakeQuery(opts: {
  vendorWindow?: number | null;
  globalWindow?: string | null;
  inserted?: Array<{ id: string }>;
  existing?: Array<{ id: string }>;
}) {
  const calls: Call[] = [];
  const query = async (sql: string, params: unknown[] = []) => {
    calls.push({ sql, params });
    if (sql.includes('"settlement_window_days"')) {
      return [
        { vendor_window: opts.vendorWindow ?? null, global_window: opts.globalWindow ?? null },
      ];
    }
    if (sql.includes('INSERT INTO "commissions"')) return opts.inserted ?? [];
    if (sql.includes('SELECT "id" FROM "commissions"')) return opts.existing ?? [];
    throw new Error(`unexpected SQL: ${sql}`);
  };
  return { query, calls };
}

function completeInput(overrides: Partial<BookingPaymentCompleteInput> = {}) {
  return {
    bookingId: "b-1",
    paymentIntentId: null,
    vendorId: "v-1",
    commissionRate: 10,
    commissionFils: 1_000,
    commissionType: "percentage",
    priceFils: 10_500,
    vatFils: 500,
    ...overrides,
  } satisfies BookingPaymentCompleteInput;
}

async function expect503(promise: Promise<unknown>) {
  let caught: unknown;
  try {
    await promise;
  } catch (err) {
    caught = err;
  }
  expect((caught as { statusCode?: number })?.statusCode).toBe(503);
  expect((caught as Error)?.message).toBe(ONLINE_PAYMENT_UNAVAILABLE);
}

describe("resolveSettlementWindowDays", () => {
  it("prefers the vendor override, keeping a meaningful 0", () => {
    expect(resolveSettlementWindowDays(0, 14)).toBe(0);
    expect(resolveSettlementWindowDays(3, 14)).toBe(3);
  });

  it("falls back to the global setting, then the default", () => {
    expect(resolveSettlementWindowDays(null, 14)).toBe(14);
    expect(resolveSettlementWindowDays(null, null)).toBe(DEFAULT_SETTLEMENT_WINDOW_DAYS);
    expect(resolveSettlementWindowDays(Number.NaN, -1)).toBe(DEFAULT_SETTLEMENT_WINDOW_DAYS);
  });
});

describe("LocalBookingPaymentGateway card operations", () => {
  const gateway = new LocalBookingPaymentGateway(fakeQuery({}).query);

  it("setup / authorize / intent / capture / refund answer 503 online_payment_unavailable", async () => {
    await expect503(gateway.setup());
    await expect503(gateway.authorize());
    await expect503(gateway.intent());
    await expect503(gateway.capture());
    await expect503(gateway.refund());
  });

  it("void() is a no-op that reports the authorization as canceled", async () => {
    const res = await gateway.void({ bookingId: "b-1", paymentIntentId: "auth_1" });
    expect(res).toEqual({ paymentIntentId: "auth_1", status: "canceled" });
  });
});

describe("LocalBookingPaymentGateway.complete", () => {
  it("accrues a held commission with the settlement clock started now", async () => {
    const { query, calls } = fakeQuery({
      vendorWindow: null,
      globalWindow: "10",
      inserted: [{ id: "c-1" }],
    });
    const gateway = new LocalBookingPaymentGateway(query, () => NOW);

    const res = await gateway.complete(completeInput());

    expect(res).toEqual({
      captured: false,
      paymentIntentId: null,
      paymentStatus: null,
      commissionId: "c-1",
      commissionCreated: true,
    });
    const insert = calls.find((c) => c.sql.includes('INSERT INTO "commissions"'))!;
    expect(insert.sql).toContain(
      'ON CONFLICT ("booking_id") WHERE "booking_id" IS NOT NULL DO NOTHING',
    );
    expect(insert.sql).toContain("'held'");
    const [vendorId, bookingId, type, rate, itemTotal, amount, tax, earning, settleAfter] =
      insert.params as [string, string, string, number, number, number, number, number, Date];
    expect(vendorId).toBe("v-1");
    expect(bookingId).toBe("b-1");
    expect(type).toBe("percentage");
    expect(rate).toBe(10);
    expect(itemTotal).toBe(10_500);
    expect(amount).toBe(1_000);
    expect(tax).toBe(50); // 5% VAT on the commission
    expect(earning).toBe(10_000 - 1_000 - 50); // net ex VAT - commission - its VAT
    expect(settleAfter.getTime()).toBe(NOW.getTime() + 10 * DAY_MS);
  });

  it("caps the commission at the shared ceiling so the vendor earning never goes negative", async () => {
    const { query, calls } = fakeQuery({ inserted: [{ id: "c-2" }] });
    const gateway = new LocalBookingPaymentGateway(query, () => NOW);

    await gateway.complete(completeInput({ commissionFils: 50_000, commissionType: "fixed" }));

    const insert = calls.find((c) => c.sql.includes('INSERT INTO "commissions"'))!;
    const amount = insert.params[5] as number;
    const earning = insert.params[7] as number;
    expect(insert.params[2]).toBe("fixed");
    expect(amount).toBe(Math.floor(10_000 / 1.05));
    expect(earning).toBeGreaterThanOrEqual(0);
    // Default window when neither the vendor nor the platform sets one.
    expect((insert.params[8] as Date).getTime()).toBe(
      NOW.getTime() + DEFAULT_SETTLEMENT_WINDOW_DAYS * DAY_MS,
    );
  });

  it("is idempotent: a conflicting insert returns the existing row with commissionCreated false", async () => {
    const { query } = fakeQuery({ inserted: [], existing: [{ id: "c-existing" }] });
    const gateway = new LocalBookingPaymentGateway(query, () => NOW);

    const res = await gateway.complete(completeInput());

    expect(res.commissionId).toBe("c-existing");
    expect(res.commissionCreated).toBe(false);
  });

  it("throws loudly when the insert conflicted but no row can be found", async () => {
    const { query } = fakeQuery({ inserted: [], existing: [] });
    const gateway = new LocalBookingPaymentGateway(query, () => NOW);

    let caught: unknown;
    try {
      await gateway.complete(completeInput());
    } catch (err) {
      caught = err;
    }
    expect((caught as Error)?.message).toContain("b-1");
  });

  it("refuses a prepay capture with 503 and writes nothing", async () => {
    const { query, calls } = fakeQuery({ inserted: [{ id: "c-3" }] });
    const gateway = new LocalBookingPaymentGateway(query, () => NOW);

    await expect503(gateway.complete(completeInput({ paymentIntentId: "auth_1" })));
    expect(calls).toHaveLength(0);
  });
});
