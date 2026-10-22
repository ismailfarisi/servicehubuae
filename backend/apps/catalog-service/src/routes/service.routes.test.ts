import { describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";

const searchPublic = mock(async (_query: any) => ({
  data: [{ id: "o1", name: "Balayage" }],
  total: 1,
  page: 1,
  limit: 24,
  facets: { areas: [], categories: [], visitTypes: [], paymentModes: [], vendors: [] },
}));

// Stub the heavy DI container with a real Elysia instance (satisfies
// `.use(container)`, unlike a plain object) decorated with a stub controller.
// Precedent: service-offering.auth-wiring.test.ts.
mock.module("../container.ts", () => ({
  container: new Elysia({ name: "container" }).decorate("serviceOfferingController", {
    searchPublic,
  }),
}));

// A query-suffixed specifier gives this file its OWN instance of service.routes.ts,
// bound to the stub container above. Without it, `bun test` (one process for
// every file) hands back the instance an earlier file already evaluated against
// a different container, and the stub controller is never called.
const ISOLATED_ROUTES = "./service.routes.ts?isolated";
const loadRoutes = () => import(ISOLATED_ROUTES) as Promise<typeof import("./service.routes.ts")>;

describe("GET /services", () => {
  it("is registered and reachable at the bare path (no gateway/jwtAuth layer here — see jwt-auth.services-list.test.ts for the allowlist regression guard)", async () => {
    const { serviceRoutes } = await loadRoutes();
    const app = new Elysia().use(serviceRoutes);

    const res = await app.handle(new Request("http://localhost/services"));
    expect(res.status).toBe(200);
  });

  it("passes filters through to the controller", async () => {
    searchPublic.mockClear();
    const { serviceRoutes } = await loadRoutes();
    const app = new Elysia().use(serviceRoutes);

    await app.handle(
      new Request(
        "http://localhost/services?area=dubai-marina&visit=home_visit&min_price=10000&page=2",
      ),
    );

    const arg = searchPublic.mock.calls[0]?.[0];
    expect(arg.area).toBe("dubai-marina");
    expect(arg.visit).toBe("home_visit");
    expect(arg.minPrice).toBe(10000);
    expect(arg.page).toBe(2);
  });
});
