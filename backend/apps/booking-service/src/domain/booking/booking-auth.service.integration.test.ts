// booking-auth.service.integration.test.ts
//
// Live Postgres + Redis (BOOKING_LIVE_DB=1). Mirrors
// booking.service.integration.test.ts's / booking-status.service
// .integration.test.ts's live-gate + cleanup patterns.
//
// Seeds a `confirmed` prepay booking directly (bypassing BookingService
// .create's hold->availability->pay flow, same shortcut
// booking-status.service.integration.test.ts takes) and a saved-card Payment
// row (gateway_response.{stripe_customer_id,payment_method_id}). The payment
// gateway is the pre-M2 LocalBookingPaymentGateway, whose authorize() answers
// 503 online_payment_unavailable — so these tests cover the job scheduling,
// the sync-failure -> follow-up-cancel path and the cleanup hooks.
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  AppDataSource,
  Booking,
  BookingStatus,
  BookingStatusHistory,
  DepositType,
  EngagementKind,
  EngagementStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
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
} from "@servicehubuae/database";
import { EngagementService } from "../engagement/engagement.service.ts";
import { getBookingAuthQueue } from "./booking-auth.job.ts";
import { AUTO_COMPLETE_DELAY_HOURS, BookingAuthService } from "./booking-auth.service.ts";
import type { BookingAuthHook } from "./booking-status.service.ts";
import { BookingStatusService } from "./booking-status.service.ts";
import { LocalBookingPaymentGateway } from "./local-booking-payment.gateway.ts";

const LIVE_DB = process.env.BOOKING_LIVE_DB === "1";
const describeLive = LIVE_DB ? describe : describe.skip;

const unique = Date.now();

describeLive("BookingAuthService (live DB + Redis + local payment gateway)", () => {
  let vendorId: string;
  let customerId: string;
  let staffId: string;
  let offeringPrepayId: string;

  let bookingAuthService: BookingAuthService;
  let bookingStatusService: BookingStatusService;
  let engagementService: EngagementService;

  const bookingRepo = () => AppDataSource.getRepository(Booking);
  const paymentRepo = () => AppDataSource.getRepository(Payment);
  const engagementRepo = () => AppDataSource.getRepository(StaffEngagement);
  const historyRepo = () => AppDataSource.getRepository(BookingStatusHistory);
  const authQueue = getBookingAuthQueue();

  const createdBookingIds: string[] = [];
  const createdEngagementIds: string[] = [];
  const createdPaymentIds: string[] = [];
  const jobIdsToClean: string[] = [];
  let slotCursor = 0;

  function nextSlotStartsAt(daysOut: number): Date {
    slotCursor += 1;
    const d = new Date(Date.now() + daysOut * 24 * 3_600_000);
    // Space slots 2h apart (well beyond the 30min engagement duration) so
    // repeated calls with the SAME daysOut (multiple scenarios booking the
    // same staff member "15 days out", say) never overlap and trip the GiST
    // EXCLUDE constraint (no_double_book).
    d.setUTCHours(d.getUTCHours() + slotCursor * 2);
    return d;
  }

  // Placeholder saved-card ids — the local gateway never reads them; the
  // booking-auth job only needs them present to attempt an authorization.
  function seedSavedCard(): { customerId: string; pmId: string } {
    return {
      customerId: `cus_local_${unique}_${slotCursor}`,
      pmId: `pm_local_${unique}_${slotCursor}`,
    };
  }

  async function seedPrepayBooking(opts: {
    daysOut: number;
    cancellationWindowHours?: number;
    status?: BookingStatus;
    savedCard?: { customerId: string; pmId: string } | null;
  }): Promise<Booking> {
    const startsAt = nextSlotStartsAt(opts.daysOut);
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

    // `chk_payments_order_or_booking` requires EXACTLY one of order_id/
    // booking_id to be set (num_nonnulls = 1) — so the Payment row can only
    // be inserted AFTER the booking row exists (booking.payment_id is
    // nullable and set in a follow-up update, same two-step order
    // BookingService.create()/BookingPaymentGateway.setup() itself uses).
    const booking = await bookingRepo().save(
      bookingRepo().create({
        booking_number: `BAU${unique}${slotCursor}`,
        customer_user_id: customerId,
        vendor_id: vendorId,
        location_id: null,
        staff_member_id: staffId,
        engagement_id: engagement.id,
        service_offering_id: offeringPrepayId,
        service_name: "Booking Auth Test Service",
        duration_minutes: 30,
        price_fils: 20_000,
        vat_fils: 952,
        deposit_fils: 0,
        deposit_type: DepositType.none,
        cancellation_window_hours: opts.cancellationWindowHours ?? 24,
        reschedule_window_hours: 24,
        commission_rate: 10,
        commission_fils: 1900,
        starts_at: startsAt,
        ends_at: endsAt,
        status: opts.status ?? BookingStatus.confirmed,
        source: "marketplace",
        payment_mode: ServicePaymentMode.prepay,
        payment_id: null,
      }),
    );
    createdBookingIds.push(booking.id);

    if (opts.savedCard) {
      const payment = await paymentRepo().save(
        paymentRepo().create({
          booking_id: booking.id,
          user_id: customerId,
          status: PaymentStatus.authorized,
          payment_method: PaymentMethod.stripe,
          amount: 0,
          currency: "AED",
          gateway: "stripe",
          gateway_payment_id: `seti_test_${unique}_${slotCursor}`,
          gateway_response: {
            kind: "setup_intent",
            stripe_customer_id: opts.savedCard.customerId,
            payment_method_id: opts.savedCard.pmId,
          },
        }),
      );
      createdPaymentIds.push(payment.id);
      await bookingRepo().update({ id: booking.id }, { payment_id: payment.id });
      booking.payment_id = payment.id;
    }

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
        first_name: "Auth",
        last_name: "Customer",
        email: `booking-auth-svc-${unique}@test.local`,
        password_hash: "x",
        role: UserRole.customer,
        status: UserStatus.active,
      }),
    );
    customerId = customer.id;

    const vendor = await vendorRepo.save(
      vendorRepo.create({
        name: `Booking Auth Test Vendor ${unique}`,
        slug: `booking-auth-test-vendor-${unique}`,
        business_name: "Test Salon",
        business_type: "salon",
        contact_email: `booking-auth-vendor-${unique}@test.local`,
        contact_phone: "+971500000002",
        status: VendorStatus.approved,
      }),
    );
    vendorId = vendor.id;

    const staff = await staffRepo.save(
      staffRepo.create({ vendor_id: vendorId, name: `Auth Test Stylist ${unique}` }),
    );
    staffId = staff.id;

    const offeringPrepay = await offeringRepo.save(
      offeringRepo.create({
        vendor_id: vendorId,
        slug: `booking-auth-test-prepay-${unique}`,
        name: "Auth Test Prepay Offering",
        duration_minutes: 30,
        buffer_before_minutes: 0,
        buffer_after_minutes: 0,
        slot_step_minutes: 15,
        min_notice_minutes: 0,
        max_advance_days: 365,
        price_fils: 20_000,
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

    engagementService = new EngagementService(engagementRepo());
    const bookingPaymentClient = new LocalBookingPaymentGateway(
      AppDataSource.query.bind(AppDataSource),
    );

    // Same late-binding hook technique as container.ts (see that file's
    // comment) — the closures below reference `bookingAuthService` (assigned
    // via the outer `let` a few lines down) only when actually called, well
    // after beforeAll finishes.
    const hook: BookingAuthHook = {
      scheduleForConfirm: (b) => bookingAuthService.scheduleForConfirm(b),
      handleAsyncAuthFailure: (b, r) => bookingAuthService.handleAsyncAuthFailure(b, r),
      removeBookingAuthJob: (id) => bookingAuthService.removeBookingAuthJob(id),
    };
    bookingStatusService = new BookingStatusService(bookingRepo(), undefined, hook);
    bookingAuthService = new BookingAuthService(
      bookingRepo(),
      paymentRepo(),
      bookingPaymentClient,
      bookingStatusService,
      authQueue,
    );
  }, 30_000);

  afterAll(async () => {
    async function step(label: string, fn: () => Promise<unknown>): Promise<void> {
      try {
        await fn();
      } catch (err) {
        console.error(
          `[booking-auth.service.integration.test] cleanup step "${label}" failed`,
          err,
        );
      }
    }

    for (const jobId of jobIdsToClean) {
      await step(`remove job ${jobId}`, () => authQueue.remove(jobId));
    }

    if (createdBookingIds.length) {
      // bookings.payment_id -> payments.id AND payments.booking_id ->
      // bookings.id is a mutual FK pair (mirrors
      // booking.service.integration.test.ts's cleanup comment) — null out
      // bookings.payment_id first, then delete payments (keyed by
      // booking_id, which also catches the escrow_hold_id authorize-Payment
      // row even though that id lives in a DIFFERENT column than
      // payment_id), THEN bookings, so neither delete trips the other's FK.
      await step("null out bookings.payment_id", () =>
        bookingRepo()
          .createQueryBuilder()
          .update()
          .set({ payment_id: null })
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
    if (createdPaymentIds.length) {
      // Any payment NOT already caught by booking_id above (there shouldn't
      // be any, but this is a harmless no-op belt-and-suspenders sweep).
      await step("delete any remaining tracked payments", () =>
        paymentRepo()
          .createQueryBuilder()
          .delete()
          .where("id IN (:...ids)", { ids: createdPaymentIds })
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
    if (offeringPrepayId) {
      await step("delete offering", () =>
        AppDataSource.getRepository(ServiceOffering)
          .createQueryBuilder()
          .delete()
          .where("id = :id", { id: offeringPrepayId })
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

  it("far-out booking: scheduleForConfirm enqueues the delayed auth:{id} job with the expected delay", async () => {
    const booking = await seedPrepayBooking({ daysOut: 20, savedCard: null });
    jobIdsToClean.push(`auth_${booking.id}`);

    await bookingAuthService.scheduleForConfirm(booking, new Date());

    const job = await authQueue.getJob(`auth_${booking.id}`);
    expect(job).toBeTruthy();
    expect(job?.name).toBe("authorize");
    const expectedFireAt = booking.starts_at.getTime() - 48 * 3_600_000; // window(24h)+24h
    const actualFireAt = job!.timestamp + (job!.opts.delay ?? 0);
    expect(Math.abs(actualFireAt - expectedFireAt)).toBeLessThan(10_000);
  });

  it("7-day clamp: an extreme cancellation_window_hours clamps the fire time instead of scheduling it >7 days before the TRUE capture deadline (ends_at + 24h auto-complete)", async () => {
    const booking = await seedPrepayBooking({
      daysOut: 60,
      cancellationWindowHours: 500, // lead would be 524h (~21.8 days) unclamped
      savedCard: null,
    });
    jobIdsToClean.push(`auth_${booking.id}`);

    await bookingAuthService.scheduleForConfirm(booking, new Date());

    const job = await authQueue.getJob(`auth_${booking.id}`);
    expect(job).toBeTruthy();
    const actualFireAt = job!.timestamp + (job!.opts.delay ?? 0);
    // TRUE capture deadline (spec §5.3 "Auto-complete"): capture happens at
    // `ends_at + 24h`, NOT at `ends_at` (`starts_at + duration`) itself —
    // asserting against the bare ends_at deadline here would have passed
    // against the pre-fix bug too (self-referential), so this deliberately
    // includes the +24h auto-complete tail.
    const captureDeadline =
      booking.starts_at.getTime() +
      booking.duration_minutes * 60_000 +
      AUTO_COMPLETE_DELAY_HOURS * 3_600_000;
    const naiveFireAt = booking.starts_at.getTime() - 524 * 3_600_000;
    const earliestSafeFireAt = captureDeadline - 144 * 3_600_000;

    expect(actualFireAt).toBeGreaterThan(naiveFireAt);
    expect(Math.abs(actualFireAt - earliestSafeFireAt)).toBeLessThan(10_000);

    // The real invariant: fire -> TRUE capture deadline must leave a genuine
    // 24h of headroom before Stripe's ~7-day (168h) raw ceiling, not zero.
    const spanHours = (captureDeadline - actualFireAt) / 3_600_000;
    expect(spanHours).toBeLessThanOrEqual(144);
    expect(168 - spanHours).toBeGreaterThanOrEqual(24 - 1); // -1h float/round slack
  });

  it("authorize fails (online payments unavailable): a follow-up-cancel job is scheduled, and running it cancels + frees the slot", async () => {
    const card = seedSavedCard();
    const booking = await seedPrepayBooking({ daysOut: 15, savedCard: card });
    jobIdsToClean.push(`auth-followup_${booking.id}`);

    await bookingAuthService.runAuthorizeJob(booking.id);

    const afterAuthorize = await bookingRepo().findOne({ where: { id: booking.id } });
    expect(afterAuthorize?.escrow_hold_id).toBeNull();
    expect(afterAuthorize?.status).toBe(BookingStatus.confirmed); // not transitioned yet

    const followUpJob = await authQueue.getJob(`auth-followup_${booking.id}`);
    expect(followUpJob).toBeTruthy();
    expect(followUpJob?.name).toBe("follow-up-cancel");

    // Run the follow-up job directly rather than waiting on its real delay.
    await bookingAuthService.runFollowUpCancelJob(booking.id);

    const cancelled = await bookingRepo().findOne({ where: { id: booking.id } });
    expect(cancelled?.status).toBe(BookingStatus.cancelled);

    const engagement = await engagementRepo().findOne({ where: { id: booking.engagement_id } });
    expect(engagement?.status).toBe(EngagementStatus.released);
  }, 20_000);

  it("async webhook path: handlePaymentFailed on a confirmed prepay booking schedules the same follow-up-cancel job", async () => {
    const booking = await seedPrepayBooking({ daysOut: 15, savedCard: null });
    jobIdsToClean.push(`auth-followup_${booking.id}`);

    await bookingStatusService.handlePaymentFailed(booking.id, "card_declined via webhook");

    const followUpJob = await authQueue.getJob(`auth-followup_${booking.id}`);
    expect(followUpJob).toBeTruthy();

    // Booking itself is NOT transitioned by handlePaymentFailed — only the
    // follow-up job (run later, or directly below) does that.
    const stillConfirmed = await bookingRepo().findOne({ where: { id: booking.id } });
    expect(stillConfirmed?.status).toBe(BookingStatus.confirmed);
  }, 20_000);

  it("near-term booking (inside the window): confirm() attempts the authorization INLINE — no delayed auth:{id} job; the failure schedules the follow-up cancel", async () => {
    const card = seedSavedCard();
    // cancellation_window_hours=24 -> lead=48h; booked only 2h before starts_at.
    const startsAt = new Date(Date.now() + 2 * 3_600_000);
    const endsAt = new Date(startsAt.getTime() + 30 * 60_000);

    const engagement = await engagementService.reserve({
      staffMemberId: staffId,
      vendorId,
      startsAt,
      endsAt,
      kind: EngagementKind.marketplace_booking,
      status: EngagementStatus.held,
      createdBy: customerId,
    });
    createdEngagementIds.push(engagement.id);

    // Same booking-before-payment ordering as seedPrepayBooking (
    // chk_payments_order_or_booking requires exactly one of order_id/
    // booking_id set, so the Payment row can't be inserted until the
    // booking row it points at already exists).
    const booking = await bookingRepo().save(
      bookingRepo().create({
        booking_number: `BAUI${unique}`,
        customer_user_id: customerId,
        vendor_id: vendorId,
        location_id: null,
        staff_member_id: staffId,
        engagement_id: engagement.id,
        service_offering_id: offeringPrepayId,
        service_name: "Inline Auth Test Service",
        duration_minutes: 30,
        price_fils: 20_000,
        vat_fils: 952,
        deposit_fils: 0,
        deposit_type: DepositType.none,
        cancellation_window_hours: 24,
        reschedule_window_hours: 24,
        commission_rate: 10,
        commission_fils: 1900,
        starts_at: startsAt,
        ends_at: endsAt,
        status: BookingStatus.pending_payment,
        source: "marketplace",
        payment_mode: ServicePaymentMode.prepay,
        payment_id: null,
      }),
    );
    createdBookingIds.push(booking.id);

    const payment = await paymentRepo().save(
      paymentRepo().create({
        booking_id: booking.id,
        user_id: customerId,
        status: PaymentStatus.authorized,
        payment_method: PaymentMethod.stripe,
        amount: 0,
        currency: "AED",
        gateway: "stripe",
        gateway_payment_id: `seti_inline_${unique}`,
        gateway_response: {
          kind: "setup_intent",
          stripe_customer_id: card.customerId,
          payment_method_id: card.pmId,
        },
      }),
    );
    createdPaymentIds.push(payment.id);
    await bookingRepo().update({ id: booking.id }, { payment_id: payment.id });

    const confirmed = await bookingStatusService.confirm(booking.id);
    expect(confirmed.status).toBe(BookingStatus.confirmed);

    jobIdsToClean.push(`auth-followup_${booking.id}`);

    // The inline authorize runs a step AFTER confirm()'s snapshot is
    // captured, so assert on a fresh re-read. The local gateway refuses the
    // authorization (503), so nothing is held and the follow-up cancel is
    // scheduled — the same path a declined card takes.
    const reloaded = await bookingRepo().findOne({ where: { id: booking.id } });
    expect(reloaded?.escrow_hold_id).toBeNull();

    const job = await authQueue.getJob(`auth_${booking.id}`);
    expect(job).toBeFalsy();
    const followUpJob = await authQueue.getJob(`auth-followup_${booking.id}`);
    expect(followUpJob).toBeTruthy();
  }, 20_000);

  it("cancel transition removes both the auth and auth-followup jobs (defensive cleanup)", async () => {
    const booking = await seedPrepayBooking({
      daysOut: 15,
      savedCard: null,
      status: BookingStatus.confirmed,
    });

    await authQueue.add(
      "authorize",
      { bookingId: booking.id },
      { jobId: `auth_${booking.id}`, delay: 10 * 24 * 3_600_000 },
    );
    await authQueue.add(
      "follow-up-cancel",
      { bookingId: booking.id },
      { jobId: `auth-followup_${booking.id}`, delay: 10 * 24 * 3_600_000 },
    );
    jobIdsToClean.push(`auth_${booking.id}`, `auth-followup_${booking.id}`);

    await bookingStatusService.transition(booking.id, BookingStatus.cancelled, {
      id: customerId,
      role: "customer",
    });

    // removeBookingAuthJob is fired-and-forgotten (best-effort, outside the
    // transaction) — poll briefly for it to land rather than assuming
    // same-tick completion.
    let authJob = await authQueue.getJob(`auth_${booking.id}`);
    let followUpJob = await authQueue.getJob(`auth-followup_${booking.id}`);
    for (let i = 0; i < 20 && (authJob || followUpJob); i++) {
      await new Promise((r) => setTimeout(r, 100));
      authJob = await authQueue.getJob(`auth_${booking.id}`);
      followUpJob = await authQueue.getJob(`auth-followup_${booking.id}`);
    }
    expect(authJob).toBeFalsy();
    expect(followUpJob).toBeFalsy();
  }, 10_000);

  it("rescheduled transition removes both the auth and auth-followup jobs (Fix 3 — jobs are keyed to the OLD starts_at)", async () => {
    const booking = await seedPrepayBooking({
      daysOut: 15,
      savedCard: null,
      status: BookingStatus.confirmed,
    });

    await authQueue.add(
      "authorize",
      { bookingId: booking.id },
      { jobId: `auth_${booking.id}`, delay: 10 * 24 * 3_600_000 },
    );
    await authQueue.add(
      "follow-up-cancel",
      { bookingId: booking.id },
      { jobId: `auth-followup_${booking.id}`, delay: 10 * 24 * 3_600_000 },
    );
    jobIdsToClean.push(`auth_${booking.id}`, `auth-followup_${booking.id}`);

    // `confirmed -> rescheduled` is an allowed edge (ALLOWED_TRANSITIONS) even
    // though no production route drives it yet (Phase 5). Without Fix 3, the
    // jobs seeded above (keyed to the booking's OLD starts_at) would survive
    // this transition and fire at the wrong time once Phase 5 re-confirms the
    // booking at its new slot.
    await bookingStatusService.transition(booking.id, BookingStatus.rescheduled, {
      id: customerId,
      role: "customer",
    });

    let authJob = await authQueue.getJob(`auth_${booking.id}`);
    let followUpJob = await authQueue.getJob(`auth-followup_${booking.id}`);
    for (let i = 0; i < 20 && (authJob || followUpJob); i++) {
      await new Promise((r) => setTimeout(r, 100));
      authJob = await authQueue.getJob(`auth_${booking.id}`);
      followUpJob = await authQueue.getJob(`auth-followup_${booking.id}`);
    }
    expect(authJob).toBeFalsy();
    expect(followUpJob).toBeFalsy();
  }, 10_000);
});
