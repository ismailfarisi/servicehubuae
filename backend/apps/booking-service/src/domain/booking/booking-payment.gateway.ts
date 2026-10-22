// booking-payment.gateway.ts
//
// The money boundary of booking-service. Every flow that moves money for a
// booking (create's deposit/prepay setup, the prepay off-session auth job,
// completion's capture + commission accrual, cancel/no-show voids, captures
// and refunds, the pending-booking reaper's void) depends on this interface,
// never on a concrete payment provider.
//
// Implementations:
//   - LocalBookingPaymentGateway (local-booking-payment.gateway.ts): the
//     pre-M2 implementation. Accrues commissions locally; every card
//     operation answers 503 `online_payment_unavailable`.
//   - M2 adds the MyFatoorah adapter (hosted checkout, callback + webhook,
//     refunds) behind the same interface.
//
// The input/result shapes below are carried over from the earlier HTTP
// boundary unchanged so the consumers did not have to move. Some field names
// (`stripeCustomerId`, `paymentMethodId`, `paymentIntentId`) still describe a
// saved-card + manual-capture model; M2 renames them once the MyFatoorah
// adapter settles the vocabulary.

export interface BookingPaymentAddress {
  line1?: string;
  city?: string;
  country?: string;
}

export interface BookingPaymentSetupInput {
  bookingId: string;
  userId: string;
  email: string;
  stripeCustomerId?: string | null;
  name?: string | null;
  address?: BookingPaymentAddress | null;
}
export interface BookingPaymentSetupResult {
  paymentId: string;
  clientSecret: string;
  setupIntentId: string;
  stripeCustomerId: string;
}

export interface BookingPaymentAuthorizeInput {
  bookingId: string;
  userId: string;
  stripeCustomerId: string;
  paymentMethodId: string;
  amountFils: number;
  currency?: string;
}
export interface BookingPaymentAuthorizeResult {
  paymentId: string;
  paymentIntentId: string;
  status: string;
  failureReason: string | null;
}

export interface BookingPaymentIntentInput {
  bookingId: string;
  userId: string;
  amountFils: number;
  currency?: string;
  name?: string | null;
  address?: BookingPaymentAddress | null;
}
export interface BookingPaymentIntentResult {
  paymentId: string;
  clientSecret: string;
  paymentIntentId: string;
}

export interface BookingPaymentCaptureInput {
  bookingId: string;
  paymentIntentId: string;
  amountFils?: number;
}
export interface BookingPaymentCaptureResult {
  paymentIntentId: string;
  status: string;
}

export interface BookingPaymentVoidInput {
  bookingId: string;
  paymentIntentId: string;
  reason?: string | null;
}
export interface BookingPaymentVoidResult {
  paymentIntentId: string;
  status: string;
}

export interface BookingPaymentRefundInput {
  bookingId: string;
  amountFils: number;
  referenceType: "cancellation" | "no_show_reversal" | "admin_adjustment";
  referenceId: string;
  reason?: string | null;
}
export interface BookingPaymentRefundResult {
  gateway: string;
  gatewayRefundId: string;
  amountFils: number;
}

export interface BookingPaymentCompleteInput {
  bookingId: string;
  // null for deposit/pay_at_venue (nothing to capture — a deposit was
  // captured at booking time, pay_at_venue is paid in person); set for
  // prepay (the authorized payment to capture).
  paymentIntentId: string | null;
  vendorId: string;
  commissionRate: number;
  commissionFils: number;
  // The booking's snapshotted commission TYPE ("percentage" | "fixed" |
  // "tiered", from `booking.commission_type`), stored on the accrued
  // commission row so a fixed-rate vendor's row is not mislabeled.
  commissionType: string;
  priceFils: number;
  vatFils: number;
}
export interface BookingPaymentCompleteResult {
  captured: boolean;
  paymentIntentId: string | null;
  paymentStatus: string | null;
  commissionId: string;
  commissionCreated: boolean;
}

export interface BookingPaymentGateway {
  /** Save a card off-session for a prepay booking (no money moves). */
  setup(input: BookingPaymentSetupInput): Promise<BookingPaymentSetupResult>;
  /** Off-session manual-capture authorization on the saved card (prepay). */
  authorize(input: BookingPaymentAuthorizeInput): Promise<BookingPaymentAuthorizeResult>;
  /** Capture-now payment for a deposit. */
  intent(input: BookingPaymentIntentInput): Promise<BookingPaymentIntentResult>;
  /** Capture an authorized payment (full or partial). */
  capture(input: BookingPaymentCaptureInput): Promise<BookingPaymentCaptureResult>;
  /** Cancel an un-captured authorization. Callers treat this as best-effort. */
  void(input: BookingPaymentVoidInput): Promise<BookingPaymentVoidResult>;
  /** Refund a captured booking payment. */
  refund(input: BookingPaymentRefundInput): Promise<BookingPaymentRefundResult>;
  /**
   * Booking completion: capture the prepay authorization (when
   * `paymentIntentId` is set) and accrue the commission from the booking's
   * snapshotted rate/amount. Must be idempotent per booking — completion is
   * deliberately re-firable (retries, admin-vs-auto-complete races).
   */
  complete(input: BookingPaymentCompleteInput): Promise<BookingPaymentCompleteResult>;
}
