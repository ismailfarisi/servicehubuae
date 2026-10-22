import { Elysia, t } from "elysia";
import { container } from "../container.ts";

/** Public: featured licensed reels on a vendor storefront. */
export const licensingFeaturedRoutes = new Elysia({ prefix: "/reels" }).use(container).get(
  "/featured",
  // biome-ignore lint/suspicious/noExplicitAny: handler context typing follows the slice-1 route pattern
  async ({ query, rightsService }: any) => {
    const data = await rightsService.listFeaturedReels({
      vendorId: query.vendor_id,
    });
    return { statusCode: 200, data, timestamp: new Date().toISOString() };
  },
  { query: t.Object({ vendor_id: t.Optional(t.String()) }) },
);
