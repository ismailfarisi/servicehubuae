// internal-booking.routes.ts
import { internalServiceAuth } from "@mypickuae/guards";
import { Elysia, t } from "elysia";
import { container } from "../../container.ts";

const ok = (data: unknown, status = 200) => ({
  statusCode: status,
  data,
  timestamp: new Date().toISOString(),
});

/**
 * booking-service side of the webhook-routing boundary (spec §3/§5.2, Phase
 * 4 Task 3), over internalServiceAuth (issuer allowlist in
 * libs/guards/src/internal-service-auth.ts). The payments webhook handler
 * (M2, MyFatoorah) is the intended caller and owns the `webhook_events`
 * idempotency guard (dedup on `(gateway, event_id)` before dispatching).
 * `BookingStatusService.confirm()` is ALSO idempotent on top of that (safe
 * no-op on a retried delivery), so double-delivery is covered at both
 * layers. Thin plumbing — every handler delegates straight to
 * BookingStatusService.
 */
export const internalBookingRoutes = new Elysia({ prefix: "/internal/bookings" })
  .use(container)
  .use(internalServiceAuth)
  .post(
    "/:id/confirm",
    async ({ params, bookingStatusService }: any) => {
      // setup_intent.succeeded (prepay) and payment_intent.succeeded
      // (deposit) both land here — BookingStatusService.confirm() doesn't
      // need to know which payment mode triggered it.
      const booking = await bookingStatusService.confirm(params.id);
      return ok({ id: booking.id, status: booking.status });
    },
    { params: t.Object({ id: t.String({ format: "uuid" }) }) },
  )
  .post(
    "/:id/payment-failed",
    async ({ params, body, bookingStatusService }: any) => {
      const booking = await bookingStatusService.handlePaymentFailed(
        params.id,
        body?.reason ?? null,
      );
      return ok({ id: booking.id, status: booking.status });
    },
    {
      params: t.Object({ id: t.String({ format: "uuid" }) }),
      body: t.Object({ reason: t.Optional(t.Union([t.String(), t.Null()])) }),
    },
  );
