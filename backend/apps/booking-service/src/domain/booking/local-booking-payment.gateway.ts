// local-booking-payment.gateway.ts
import { ServiceUnavailableError } from "@servicehubuae/plugins";
import { maxCommissionForNet } from "@servicehubuae/utils";
import type {
  BookingPaymentAuthorizeResult,
  BookingPaymentCaptureResult,
  BookingPaymentCompleteInput,
  BookingPaymentCompleteResult,
  BookingPaymentGateway,
  BookingPaymentIntentResult,
  BookingPaymentRefundResult,
  BookingPaymentSetupResult,
  BookingPaymentVoidInput,
  BookingPaymentVoidResult,
} from "./booking-payment.gateway.ts";

/** Wire message for every card operation until the MyFatoorah adapter (M2) ships. */
export const ONLINE_PAYMENT_UNAVAILABLE = "online_payment_unavailable";

export const DEFAULT_SETTLEMENT_WINDOW_DAYS = 7;
const SETTLEMENT_WINDOW_KEY = "payout_settlement_window_days";
// Same 5%-VAT-on-commission convention as the booking-time snapshot and the
// shared commission ceiling (maxCommissionForNet).
const COMMISSION_VAT_RATE = 0.05;

/** `AppDataSource.query` (or an EntityManager's), injected so tests can fake it. */
export type RawQuery = (sql: string, params?: unknown[]) => Promise<any[]>;

function validWindow(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

/**
 * Vendor override -> global `payout_settlement_window_days` site setting ->
 * hard default. A vendor window of 0 is meaningful (payable immediately) and
 * must survive, so this tests validity rather than truthiness.
 */
export function resolveSettlementWindowDays(
  vendorWindow: number | null | undefined,
  globalWindow: number | null | undefined,
): number {
  if (validWindow(vendorWindow)) return vendorWindow;
  if (validWindow(globalWindow)) return globalWindow;
  return DEFAULT_SETTLEMENT_WINDOW_DAYS;
}

/**
 * Booking payments before online payments exist (pre-M2).
 *
 * Only pay_at_venue bookings can be created while
 * `config.payments.onlineEnabled` is false (BookingService rejects the other
 * modes with 422 before writing anything), so the only money effect left is
 * the commission accrual on completion. That runs locally against the shared
 * `commissions` ledger. Every card operation (setup / authorize / intent /
 * capture / refund) answers 503 `online_payment_unavailable`; `void()` is a
 * no-op because no authorization can exist to cancel, and its callers
 * (reaper, cancel, no-show, auth follow-up) treat it as best-effort.
 */
export class LocalBookingPaymentGateway implements BookingPaymentGateway {
  constructor(
    private readonly query: RawQuery,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async setup(): Promise<BookingPaymentSetupResult> {
    throw new ServiceUnavailableError(ONLINE_PAYMENT_UNAVAILABLE);
  }

  async authorize(): Promise<BookingPaymentAuthorizeResult> {
    throw new ServiceUnavailableError(ONLINE_PAYMENT_UNAVAILABLE);
  }

  async intent(): Promise<BookingPaymentIntentResult> {
    throw new ServiceUnavailableError(ONLINE_PAYMENT_UNAVAILABLE);
  }

  async capture(): Promise<BookingPaymentCaptureResult> {
    throw new ServiceUnavailableError(ONLINE_PAYMENT_UNAVAILABLE);
  }

  async void(input: BookingPaymentVoidInput): Promise<BookingPaymentVoidResult> {
    return { paymentIntentId: input.paymentIntentId, status: "canceled" };
  }

  async refund(): Promise<BookingPaymentRefundResult> {
    throw new ServiceUnavailableError(ONLINE_PAYMENT_UNAVAILABLE);
  }

  /**
   * Accrues the booking's commission into `commissions`, from the booking's
   * SNAPSHOTTED rate/amount (a later vendor/category rate change must not
   * alter an existing deal), subject only to the shared commission ceiling,
   * which can lower an amount that would store a negative vendor earning but
   * never raise one.
   *
   * Idempotent on `booking_id`: completion is deliberately re-firable (retry
   * after a failure, admin click racing the auto-complete job), so two calls
   * can race. The INSERT uses `ON CONFLICT ... DO NOTHING` against the
   * partial unique index `uq_commissions_booking`, repeating its predicate as
   * the conflict target (Postgres will not match a partial index without
   * it). A duplicate is a silent no-op, and the follow-up SELECT returns the
   * winner's row.
   *
   * Settlement clock: a booking has no delivery event, so completion (this
   * call) starts it — `settle_after` = now + the vendor's settlement window,
   * inserted `held` so the row follows the same held -> pending -> payable
   * path the settlement job applies to every commission.
   */
  async complete(input: BookingPaymentCompleteInput): Promise<BookingPaymentCompleteResult> {
    if (input.paymentIntentId) {
      // A prepay authorization to capture: needs the online payment adapter.
      throw new ServiceUnavailableError(ONLINE_PAYMENT_UNAVAILABLE);
    }

    const netExVatFils = input.priceFils - input.vatFils;
    const commissionAmountFils = Math.max(
      0,
      Math.min(input.commissionFils, maxCommissionForNet(netExVatFils)),
    );
    const taxOnCommission = Math.round(commissionAmountFils * COMMISSION_VAT_RATE);
    const vendorEarning = netExVatFils - commissionAmountFils - taxOnCommission;
    const commissionType = input.commissionType || "percentage";
    const windowDays = await this.settlementWindowDays(input.vendorId);
    const settleAfter = new Date(this.now().getTime() + windowDays * 86_400_000);

    const inserted = await this.query(
      `INSERT INTO "commissions"
         ("vendor_id", "booking_id", "commission_type", "commission_rate",
          "item_total", "commission_amount", "tax_on_commission", "vendor_earning",
          "currency", "status", "settle_after")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'AED', 'held', $9)
       ON CONFLICT ("booking_id") WHERE "booking_id" IS NOT NULL DO NOTHING
       RETURNING "id"`,
      [
        input.vendorId,
        input.bookingId,
        commissionType,
        input.commissionRate,
        input.priceFils,
        commissionAmountFils,
        taxOnCommission,
        vendorEarning,
        settleAfter,
      ],
    );

    let commissionId: string | undefined = inserted[0]?.id;
    const commissionCreated = commissionId !== undefined;
    if (!commissionId) {
      const existing = await this.query(
        `SELECT "id" FROM "commissions" WHERE "booking_id" = $1 LIMIT 1`,
        [input.bookingId],
      );
      commissionId = existing[0]?.id;
    }
    if (!commissionId) {
      // ON CONFLICT DO NOTHING fired yet no row exists for this booking —
      // should be unreachable; surface it instead of returning garbage.
      throw new Error(
        `commission accrual for booking ${input.bookingId} inserted nothing and found no existing row`,
      );
    }

    return {
      captured: false,
      paymentIntentId: null,
      paymentStatus: null,
      commissionId,
      commissionCreated,
    };
  }

  private async settlementWindowDays(vendorId: string): Promise<number> {
    const rows = await this.query(
      `SELECT
         (SELECT "settlement_window_days" FROM "vendors" WHERE "id" = $1) AS "vendor_window",
         (SELECT "value" FROM "site_settings" WHERE "key" = $2) AS "global_window"`,
      [vendorId, SETTLEMENT_WINDOW_KEY],
    );
    const row = rows[0] ?? {};
    const vendorWindow = row.vendor_window == null ? null : Number(row.vendor_window);
    const globalWindow = row.global_window == null ? null : Number(row.global_window);
    return resolveSettlementWindowDays(vendorWindow, globalWindow);
  }
}
