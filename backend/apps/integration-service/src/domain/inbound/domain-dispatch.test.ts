import { describe, expect, it } from "bun:test";
import { startMockVendorServer } from "../../test-helpers/mock-vendor-server.ts";
import { DomainDispatch } from "./domain-dispatch.ts";

describe("DomainDispatch", () => {
  it("rejects the removed order/product event types with 422 and makes no call", async () => {
    const mock = startMockVendorServer({ respondWith: { status: 200, body: '{"ok":true}' } });
    process.env.INTERNAL_SERVICE_SECRET = "test-secret";
    const dispatch = new DomainDispatch({ booking: mock.url });
    for (const eventType of [
      "order.accept",
      "order.reject",
      "shipment.create",
      "shipment.update_status",
      "inventory.adjust",
      "product.update_price",
      "product.update_attribute",
    ]) {
      const r = await dispatch.call({ eventType: eventType as any, vendorId: "v1", payload: {} });
      expect(r.status).toBe(422);
      expect(r.body).toContain(eventType);
    }
    expect(mock.requests).toHaveLength(0);
    mock.stop();
  });

  it("calls the routed path with an internal JWT and the vendor id", async () => {
    const mock = startMockVendorServer({ respondWith: { status: 200, body: '{"ok":true}' } });
    process.env.INTERNAL_SERVICE_SECRET = "test-secret";
    const dispatch = new DomainDispatch(
      { booking: mock.url },
      {
        "booking.confirm": {
          host: "booking",
          method: "POST",
          path: (p) => `/internal/bookings/${p.booking_id}/confirm`,
        },
      },
    );
    const r = await dispatch.call({
      eventType: "booking.confirm" as any,
      vendorId: "v1",
      payload: { booking_id: "b1" },
    });
    expect(r.status).toBe(200);
    const req = mock.requests[0];
    if (!req) throw new Error("expected captured request");
    expect(req.url).toContain("/internal/bookings/b1/confirm");
    expect(req.headers.authorization).toMatch(/^Bearer /);
    expect(JSON.parse(req.body)).toEqual({ booking_id: "b1", vendor_id: "v1" });
    mock.stop();
  });

  it("propagates 4xx errors from the domain service", async () => {
    const mock = startMockVendorServer({ respondWith: { status: 422, body: '{"error":"bad"}' } });
    process.env.INTERNAL_SERVICE_SECRET = "s";
    const dispatch = new DomainDispatch(
      { booking: mock.url },
      { "booking.confirm": { host: "booking", method: "POST", path: () => "/internal/x" } },
    );
    const r = await dispatch.call({
      eventType: "booking.confirm" as any,
      vendorId: "v1",
      payload: {},
    });
    expect(r.status).toBe(422);
    expect(r.body).toContain("bad");
    mock.stop();
  });
});
