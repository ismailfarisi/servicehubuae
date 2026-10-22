// booking-dashboard.routes.ts
//
// GET /vendor/booking/dashboard — the active vendor's KPI tiles. Gated exactly
// like the other /vendor/booking routes (jwtAuth in this instance +
// vendorMembership("products.write"); see location.routes.ts for why jwtAuth
// must be `.use()`d here). The admin counterpart lives in
// admin-booking.routes.ts under /admin/bookings/dashboard.
import { jwtAuth, vendorMembership } from "@mypickuae/guards";
import { Elysia } from "elysia";
import { container } from "../../container.ts";

const ok = (data: unknown, status = 200) => ({
  statusCode: status,
  data,
  timestamp: new Date().toISOString(),
});

export const vendorBookingDashboardRoutes = new Elysia({ prefix: "/vendor/booking" })
  .use(container)
  .use(jwtAuth)
  .guard({}, (app) =>
    app
      .use(vendorMembership("products.write"))
      // biome-ignore lint/suspicious/noExplicitAny: guarded context
      .get("/dashboard", async ({ member, bookingDashboardService }: any) =>
        ok(await bookingDashboardService.vendorDashboard(member.vid)),
      ),
  );
