import type { IntegrationEventType } from "@servicehubuae/database";
import jwt from "jsonwebtoken";

export interface DomainDispatchInput {
  eventType: IntegrationEventType;
  vendorId: string;
  payload: Record<string, unknown>;
}

export interface DomainDispatchResult {
  status: number;
  body: string;
}

export interface DomainDispatchHosts {
  booking: string;
}

export interface DomainRoute {
  host: keyof DomainDispatchHosts;
  method: string;
  path: (payload: any) => string;
}

/**
 * Inbound event type -> internal domain endpoint.
 *
 * Empty on purpose. The inbound targets inherited from the fork (order.accept,
 * order.reject, shipment.create, shipment.update_status, inventory.adjust,
 * product.update_price, product.update_attribute) all pointed at the removed
 * order/product services, so they were dropped instead of calling hosts that no
 * longer exist. Inbound deliveries for them now fail fast with 422.
 *
 * TODO(M2): add booking-service targets here (e.g. a vendor system confirming
 * or cancelling a booking) once booking events and their internal endpoints
 * exist, plus the matching IntegrationEventType values and mapping templates.
 */
const ROUTE_MAP: Record<string, DomainRoute> = {};

export class DomainDispatch {
  constructor(
    private hosts: DomainDispatchHosts,
    private routes: Record<string, DomainRoute> = ROUTE_MAP,
  ) {}

  async call(input: DomainDispatchInput): Promise<DomainDispatchResult> {
    const route = this.routes[input.eventType];
    if (!route) {
      return { status: 422, body: `event_type ${input.eventType} has no domain target` };
    }
    const host = this.hosts[route.host];
    const url = `${host}${route.path(input.payload)}`;
    const secret = process.env.INTERNAL_SERVICE_SECRET;
    if (!secret) return { status: 500, body: "INTERNAL_SERVICE_SECRET unset" };
    const token = jwt.sign({ iss: "integration-service" }, secret, { expiresIn: "1m" });

    const res = await fetch(url, {
      method: route.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...input.payload, vendor_id: input.vendorId }),
      signal: AbortSignal.timeout(10_000),
    });
    return { status: res.status, body: await res.text() };
  }
}
