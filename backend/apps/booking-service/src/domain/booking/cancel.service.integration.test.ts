// cancel.service.integration.test.ts
//
// Live Postgres (BOOKING_LIVE_DB=1). Mirrors
// booking-completion.service.integration.test.ts's live-gate + cleanup
// patterns. Exercises the REAL CancelService -> LocalBookingPaymentGateway
// (void / refund) flow (Phase 5 Task 4, spec §5.3) for the two money cases:
//   (a) in-window prepay  -> the authorization is voided (a no-op on the
//       local gateway), booking cancelled, slot freed.
//   (b) out-of-window deposit (percent policy) -> the penalty/remainder split
//       is recorded in the status-history reason; the refund itself answers
//       503 online_payment_unavailable and is swallowed as best-effort.
//
// Kept lean (2 live tests) per the bun shared-pg-pool guidance; awaits are
// plain (never `expect(promise).resolves`, which hangs live suites).
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  AppDataSource,
  Booking,
  BookingStatus,
  BookingStatusHistory,
  CancellationRefundPolicy,
  DepositType,
  EngagementKind,
  EngagementStatus,
  Payment,
  ServiceOffering,
  ServiceOfferingStatus,
  ServicePaymentMode,
  StaffEngagement,
  StaffMember,
  User,
  UserRole,
  UserStatus,
  Vendor,
  VendorStatus,
  ensureDatabase,
} from "@mypickuae/database";
import { AvailabilityCache } from "../availability/availability-cache.ts";
import { EngagementService } from "../engagement/engagement.service.ts";
import { BookingStatusService } from "./booking-status.service.ts";
import { CancelService } from "./cancel.service.ts";
import { LocalBookingPaymentGateway } from "./local-booking-payment.gateway.ts";

const LIVE_DB = process.env.BOOKING_LIVE_DB === "1";
const describeLive = LIVE_DB ? describe : describe.skip;

const unique = Date.now();

function fakeNotificationQueue() {
  const events: Array<{ name: string; data: any }> = [];
  return {
    events,
    add: async (name: string, data: any) => {
      events.push({ name, data });
      return { id: "job-1" };
    },
  };
}

describeLive("CancelService (live DB + local payment gateway)", () => {
  let vendorId: string;
  let customerId: string;
  let staffId: string;
  let offeringPrepayId: string;
  let offeringDepositId: string;

  let cancelService: CancelService;
  let engagementService: EngagementService;
  let notificationQueue: ReturnType<typeof fakeNotificationQueue>;

  const bookingRepo = () => AppDataSource.getRepository(Booking);
  const paymentRepo = () => AppDataSource.getRepository(Payment);
  const engagementRepo = () => AppDataSource.getRepository(StaffEngagement);
  const historyRepo = () => AppDataSource.getRepository(BookingStatusHistory);

  const createdBookingIds: string[] = [];
  const createdEngagementIds: string[] = [];
  let slotCursor = 0;

  async function seedBooking(opts: {
    startsAt: Date;
    offeringId: string;
    paymentMode: ServicePaymentMode;
    priceFils: number;
    depositFils?: number;
    refundPolicy?: CancellationRefundPolicy;
    penaltyPercent?: number;
  }): Promise<Booking> {
    slotCursor += 1;
    const startsAt = opts.startsAt;
    const endsAt = new Date(startsAt.getTime() + 30 * 60_000);

    const engagement = await engagementService.reserve({
      staffMemberId: staffId,
      vendorId,
      startsAt,
      endsAt,
      kind: EngagementKind.marketplace_booking,
      status: EngagementStatus.confirmed,
      createdBy: customerId,
    });
    createdEngagementIds.push(engagement.id);

    const booking = await bookingRepo().save(
      bookingRepo().create({
        booking_number: `BCX${unique}${slotCursor}`,
        customer_user_id: customerId,
        vendor_id: vendorId,
        location_id: null,
        staff_member_id: staffId,
        engagement_id: engagement.id,
        service_offering_id: opts.offeringId,
        service_name: "Booking Cancel Test Service",
        duration_minutes: 30,
        price_fils: opts.priceFils,
        vat_fils: 0,
        deposit_fils: opts.depositFils ?? 0,
        deposit_type: opts.depositFils ? DepositType.fixed : DepositType.none,
        cancellation_window_hours: 24,
        cancellation_refund_policy: opts.refundPolicy ?? CancellationRefundPolicy.full,
        cancellation_penalty_percent: opts.penaltyPercent ?? 100,
        reschedule_window_hours: 24,
        commission_rate: 10,
        commission_fils: 1000,
        starts_at: startsAt,
        ends_at: endsAt,
        status: BookingStatus.confirmed,
        source: "marketplace",
        payment_mode: opts.paymentMode,
      }),
    );
    createdBookingIds.push(booking.id);
    return booking;
  }

  beforeAll(async () => {
    await ensureDatabase();

    const userRepo = AppDataSource.getRepository(User);
    const vendorRepo = AppDataSource.getRepository(Vendor);
    const staffRepo = AppDataSource.getRepository(StaffMember);
    const offeringRepo = AppDataSource.getRepository(ServiceOffering);

    const customer = await userRepo.save(
      userRepo.create({
        first_name: "Cancel",
        last_name: "Customer",
        email: `booking-cancel-svc-${unique}@test.local`,
        password_hash: "x",
        role: UserRole.customer,
        status: UserStatus.active,
      }),
    );
    customerId = customer.id;

    const vendor = await vendorRepo.save(
      vendorRepo.create({
        name: `Booking Cancel Test Vendor ${unique}`,
        slug: `booking-cancel-test-vendor-${unique}`,
        business_name: "Test Salon",
        business_type: "salon",
        contact_email: `booking-cancel-vendor-${unique}@test.local`,
        contact_phone: "+971500000004",
        status: VendorStatus.approved,
      }),
    );
    vendorId = vendor.id;

    const staff = await staffRepo.save(
      staffRepo.create({ vendor_id: vendorId, name: `Cancel Test Stylist ${unique}` }),
    );
    staffId = staff.id;

    const offeringPrepay = await offeringRepo.save(
      offeringRepo.create({
        vendor_id: vendorId,
        slug: `booking-cancel-test-prepay-${unique}`,
        name: "Cancel Test Prepay Offering",
        duration_minutes: 30,
        buffer_before_minutes: 0,
        buffer_after_minutes: 0,
        slot_step_minutes: 15,
        min_notice_minutes: 0,
        max_advance_days: 365,
        price_fils: 10_000,
        vat_rate: 5 as unknown as number,
        deposit_type: DepositType.none,
        deposit_value: 0,
        cancellation_window_hours: 24,
        reschedule_window_hours: 24,
        payment_mode: ServicePaymentMode.prepay,
        status: ServiceOfferingStatus.published,
      }),
    );
    offeringPrepayId = offeringPrepay.id;

    const offeringDeposit = await offeringRepo.save(
      offeringRepo.create({
        vendor_id: vendorId,
        slug: `booking-cancel-test-deposit-${unique}`,
        name: "Cancel Test Deposit Offering",
        duration_minutes: 30,
        buffer_before_minutes: 0,
        buffer_after_minutes: 0,
        slot_step_minutes: 15,
        min_notice_minutes: 0,
        max_advance_days: 365,
        price_fils: 20_000,
        vat_rate: 5 as unknown as number,
        deposit_type: DepositType.fixed,
        deposit_value: 5_000,
        cancellation_window_hours: 24,
        reschedule_window_hours: 24,
        payment_mode: ServicePaymentMode.deposit,
        status: ServiceOfferingStatus.published,
      }),
    );
    offeringDepositId = offeringDeposit.id;

    const availabilityCache = new AvailabilityCache();
    engagementService = new EngagementService(engagementRepo(), availabilityCache);
    const bookingPaymentClient = new LocalBookingPaymentGateway(
      AppDataSource.query.bind(AppDataSource),
    );
    const bookingStatusService = new BookingStatusService(bookingRepo(), availabilityCache);
    notificationQueue = fakeNotificationQueue();
    cancelService = new CancelService(
      bookingRepo(),
      paymentRepo(),
      bookingStatusService,
      bookingPaymentClient,
      notificationQueue as any,
    );
  }, 30_000);

  afterAll(async () => {
    async function step(label: string, fn: () => Promise<unknown>): Promise<void> {
      try {
        await fn();
      } catch (err) {
        console.error(`[cancel.service.integration.test] cleanup step "${label}" failed`, err);
      }
    }

    if (createdBookingIds.length) {
      await step("null out bookings.payment_id/escrow_hold_id", () =>
        bookingRepo()
          .createQueryBuilder()
          .update()
          .set({ payment_id: null, escrow_hold_id: null })
          .where("id IN (:...ids)", { ids: createdBookingIds })
          .execute(),
      );
      await step("delete payments (by booking_id)", () =>
        paymentRepo()
          .createQueryBuilder()
          .delete()
          .where("booking_id IN (:...ids)", { ids: createdBookingIds })
          .execute(),
      );
      await step("delete booking_status_history", () =>
        historyRepo()
          .createQueryBuilder()
          .delete()
          .where("booking_id IN (:...ids)", { ids: createdBookingIds })
          .execute(),
      );
      await step("delete bookings", () =>
        bookingRepo()
          .createQueryBuilder()
          .delete()
          .where("id IN (:...ids)", { ids: createdBookingIds })
          .execute(),
      );
    }
    if (createdEngagementIds.length) {
      await step("delete engagements", () =>
        engagementRepo()
          .createQueryBuilder()
          .delete()
          .where("id IN (:...ids)", { ids: createdEngagementIds })
          .execute(),
      );
    }
    if (staffId) {
      await step("delete staff", () =>
        AppDataSource.getRepository(StaffMember)
          .createQueryBuilder()
          .delete()
          .where("id = :id", { id: staffId })
          .execute(),
      );
    }
    if (offeringPrepayId || offeringDepositId) {
      await step("delete offerings", () =>
        AppDataSource.getRepository(ServiceOffering)
          .createQueryBuilder()
          .delete()
          .where("id IN (:...ids)", { ids: [offeringPrepayId, offeringDepositId].filter(Boolean) })
          .execute(),
      );
    }
    if (vendorId) {
      await step("delete vendor", () =>
        AppDataSource.getRepository(Vendor)
          .createQueryBuilder()
          .delete()
          .where("id = :id", { id: vendorId })
          .execute(),
      );
    }
    if (customerId) {
      await step("delete customer", () =>
        AppDataSource.getRepository(User)
          .createQueryBuilder()
          .delete()
          .where("id = :id", { id: customerId })
          .execute(),
      );
    }
  }, 30_000);

  it("(a) in-window PREPAY: cancel voids the authorization (local gateway no-op), booking cancelled, slot freed", async () => {
    // 15 days out -> comfortably in-window (24h cancellation window).
    const booking = await seedBooking({
      startsAt: new Date(Date.now() + 15 * 24 * 3_600_000),
      offeringId: offeringPrepayId,
      paymentMode: ServicePaymentMode.prepay,
      priceFils: 10_000,
    });

    // An authorization recorded on escrow_hold_id — what resolveAuthPi
    // reads to decide what to void.
    const authPayment = await paymentRepo().save(
      paymentRepo().create({
        booking_id: booking.id,
        user_id: customerId,
        status: "authorized" as any,
        payment_method: "credit_card" as any,
        amount: 10_000,
        currency: "AED",
        gateway: "myfatoorah",
        gateway_payment_id: `auth_cancel_${unique}`,
      }),
    );
    await bookingRepo().update({ id: booking.id }, { escrow_hold_id: authPayment.id });

    // ── The actual thing under test ──
    const result = await cancelService.cancel(booking.id, { id: customerId, role: "customer" });

    expect(result.withinWindow).toBe(true);
    expect(result.action).toBe("void");
    expect(result.forfeitFils).toBe(0);
    expect(result.refundFils).toBe(10_000);
    expect(result.booking.status).toBe(BookingStatus.cancelled);

    // Slot freed (engagement released).
    const dbEng = await engagementRepo().findOne({ where: { id: booking.engagement_id } });
    expect(dbEng!.status).toBe(EngagementStatus.released);

    // Customer notification emitted.
    const evt = notificationQueue.events.find((e) => e.data?.data?.bookingId === booking.id);
    expect(evt?.data.userId).toBe(customerId);
  }, 30_000);

  it("(b) out-of-window DEPOSIT (percent 40%): refund is unavailable (503, best-effort) but the booking still cancels and records forfeit/refund in history", async () => {
    // ~5h out -> out-of-window (24h cancellation window).
    const booking = await seedBooking({
      startsAt: new Date(Date.now() + 5 * 3_600_000),
      offeringId: offeringDepositId,
      paymentMode: ServicePaymentMode.deposit,
      priceFils: 20_000,
      depositFils: 5_000,
      refundPolicy: CancellationRefundPolicy.percent,
      penaltyPercent: 40,
    });

    await paymentRepo().save(
      paymentRepo().create({
        booking_id: booking.id,
        user_id: customerId,
        status: "captured" as any,
        payment_method: "credit_card" as any,
        amount: 5_000,
        currency: "AED",
        gateway: "myfatoorah",
        gateway_payment_id: `dep_cancel_${unique}`,
      }),
    );

    // ── The actual thing under test ──
    const result = await cancelService.cancel(booking.id, { id: customerId, role: "customer" });

    expect(result.withinWindow).toBe(false);
    expect(result.forfeitFils).toBe(2_000); // 40% of the 5_000 deposit
    expect(result.refundFils).toBe(3_000);
    expect(result.action).toBe("refund");
    expect(result.booking.status).toBe(BookingStatus.cancelled);

    // No refund happened (the local gateway answers 503) — the money leg is
    // best-effort and needs ops follow-up until M2.
    const payment = await paymentRepo().findOne({ where: { booking_id: booking.id } as any });
    expect((payment as any).refunded_amount ?? 0).toBe(0);

    // Forfeit/refund recorded in the single status-history row's reason.
    const history = await historyRepo().find({ where: { booking_id: booking.id } });
    expect(history).toHaveLength(1);
    expect(history[0]!.to_status).toBe(BookingStatus.cancelled);
    expect(history[0]!.reason).toContain("forfeit=2000 fils");
    expect(history[0]!.reason).toContain("refund=3000 fils");
    expect(history[0]!.reason).toContain("out-of-window");
  }, 30_000);
});
