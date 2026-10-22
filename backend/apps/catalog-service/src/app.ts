import { errorHandler, requestLogger } from "@servicehubuae/plugins";
import { Elysia } from "elysia";
import { adminServiceOfferingRoutes } from "./routes/admin-service-offering.routes.ts";
import { areaAdminRoutes, areaRoutes } from "./routes/area.routes.ts";
import { categoryAdminRoutes } from "./routes/category-admin.routes.ts";
import { categoryRoutes } from "./routes/category.routes.ts";
import { mediaRoutes } from "./routes/media.routes.ts";
import { recentSearchRoutes } from "./routes/recent-search.routes.ts";
import { searchAdminRoutes } from "./routes/search-admin.routes.ts";
import { serviceOfferingRoutes } from "./routes/service-offering.routes.ts";
import { serviceRoutes } from "./routes/service.routes.ts";

export const app = new Elysia()
  .use(requestLogger)
  .use(errorHandler)
  .get("/health", () => ({ status: "ok", service: "catalog" }))
  .use(categoryRoutes)
  .use(categoryAdminRoutes)
  .use(areaRoutes)
  .use(areaAdminRoutes)
  .use(serviceRoutes)
  .use(serviceOfferingRoutes)
  .use(adminServiceOfferingRoutes)
  .use(searchAdminRoutes)
  .use(mediaRoutes)
  .use(recentSearchRoutes);
