// booking.service.online-gate.test.ts
//
// Pre-M2 gate: while online payments are disabled, hold() and create() reject
// a deposit/prepay offering with 422 online_payment_unavailable BEFORE any
// Redis hold, availability lookup, DB row or payment call. pay_at_venue is
// unaffected. Pure unit test — every collaborator is a fake.
import { describe, expect, it, mock } from "bun:test";
import { ServiceOfferingStatus, ServicePaymentMode } from "@mypickuae/database";
import { BookingService, OnlinePaymentUnavailableError } from "./booking.service.ts";

const OFFERING_ID = "11111111-1111-4111-8111-111111111111";
const VENDOR_ID = "22222222-2222-4222-8222-222222222222";
const STAFF_ID = "33333333-3333-4333-8333-333333333333";

function makeService(paymentMode: ServicePaymentMode, onlineEnabled: boolean) {
  const offering = {
    id: OFFERING_ID,
    vendor_id: VENDOR_ID,
    status: ServiceOfferingStatus.published,
    payment_mode: paymentMode,
    duration_minutes: 30,
    location_mode: "at_premises",
  };
  const offeringRepo = { findOne: mock(async () => offering) };
  const bookingRepo = {
    manager: { transaction: mock(async () => ({})) },
    update: mock(async () => undefined),
  };
  const availabilityService = {
    getAvailability: mock(async () => ({ slots: [] })),
  };
  const holdService = {
    hold: mock(async () => "token-1"),
    assertHeldFor: mock(async () => undefined),
    release: mock(async () => undefined),
  };
  const gateway = {
    setup: mock(async () => {
      throw new Error("setup must not be called");
    }),
    intent: mock(async () => {
      throw new Error("intent must not be called");
    }),
  };
  const statusService = { confirmPayAtVenue: mock(async () => ({ status: "confirmed" })) };

  const service = new BookingService(
    offeringRepo as any,
    bookingRepo as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    availabilityService as any,
    holdService as any,
    gateway as any,
    undefined,
    undefined,
    statusService as any,
    { onlineEnabled },
  );
  return { service, holdService, availabilityService, bookingRepo, gateway };
}

const slot = {
  startsAt: new Date("2026-11-01T10:00:00.000Z"),
  endsAt: new Date("2026-11-01T10:30:00.000Z"),
};

async function caughtFrom(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (err) {
    return err;
  }
  return undefined;
}

describe("BookingService online-payments gate (onlineEnabled=false)", () => {
  for (const mode of [ServicePaymentMode.deposit, ServicePaymentMode.prepay]) {
    it(`hold(): ${mode} offering -> 422 online_payment_unavailable, no hold taken`, async () => {
      const { service, holdService, availabilityService } = makeService(mode, false);

      const err = await caughtFrom(
        service.hold("customer-1", {
          offeringId: OFFERING_ID,
          staffMemberId: STAFF_ID,
          locationId: "loc-1",
          ...slot,
        }),
      );

      expect(err).toBeInstanceOf(OnlinePaymentUnavailableError);
      expect((err as OnlinePaymentUnavailableError).statusCode).toBe(422);
      expect((err as Error).message).toBe("online_payment_unavailable");
      expect(holdService.hold).not.toHaveBeenCalled();
      expect(availabilityService.getAvailability).not.toHaveBeenCalled();
    });

    it(`create(): ${mode} offering -> 422 online_payment_unavailable, nothing written or charged`, async () => {
      const { service, holdService, bookingRepo, gateway } = makeService(mode, false);

      const err = await caughtFrom(
        service.create("customer-1", {
          offeringId: OFFERING_ID,
          staffMemberId: STAFF_ID,
          locationId: "loc-1",
          holdToken: "token-1",
          ...slot,
        }),
      );

      expect(err).toBeInstanceOf(OnlinePaymentUnavailableError);
      expect(holdService.assertHeldFor).not.toHaveBeenCalled();
      expect(bookingRepo.manager.transaction).not.toHaveBeenCalled();
      expect(gateway.setup).not.toHaveBeenCalled();
      expect(gateway.intent).not.toHaveBeenCalled();
    });
  }

  it("hold(): a pay_at_venue offering passes the gate (reaches slot resolution)", async () => {
    const { service, availabilityService } = makeService(ServicePaymentMode.pay_at_venue, false);

    // No slots in the fake availability -> 409, which proves the gate let it through.
    const err = await caughtFrom(
      service.hold("customer-1", {
        offeringId: OFFERING_ID,
        staffMemberId: STAFF_ID,
        locationId: "loc-1",
        ...slot,
      }),
    );

    expect(err).not.toBeInstanceOf(OnlinePaymentUnavailableError);
    expect((err as { statusCode?: number }).statusCode).toBe(409);
    expect(availabilityService.getAvailability).toHaveBeenCalledTimes(1);
  });

  it("hold(): with online payments enabled a deposit offering passes the gate", async () => {
    const { service, availabilityService } = makeService(ServicePaymentMode.deposit, true);

    const err = await caughtFrom(
      service.hold("customer-1", {
        offeringId: OFFERING_ID,
        staffMemberId: STAFF_ID,
        locationId: "loc-1",
        ...slot,
      }),
    );

    expect(err).not.toBeInstanceOf(OnlinePaymentUnavailableError);
    expect(availabilityService.getAvailability).toHaveBeenCalledTimes(1);
  });
});
