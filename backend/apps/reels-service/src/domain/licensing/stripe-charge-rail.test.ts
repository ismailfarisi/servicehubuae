import { describe, expect, it } from "bun:test";
import { StripeChargeGateway } from "./stripe-charge-rail.ts";

describe("StripeChargeGateway without STRIPE_SECRET_KEY", () => {
  it("constructs with a null client and answers 503 stripe_not_configured on use", async () => {
    const gateway = new StripeChargeGateway(null);
    await expect(
      gateway.authorize({
        amountFils: 1000,
        currency: "aed",
        paymentMethodId: "pm_x",
        idempotencyKey: "k1",
        metadata: {},
      }),
    ).rejects.toMatchObject({ statusCode: 503, message: "stripe_not_configured" });
    await expect(gateway.capture({ paymentIntentId: "pi_x" })).rejects.toMatchObject({
      statusCode: 503,
    });
    await expect(gateway.cancel({ paymentIntentId: "pi_x" })).rejects.toMatchObject({
      statusCode: 503,
    });
  });
});
