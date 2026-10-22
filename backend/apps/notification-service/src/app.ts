import { errorHandler, requestLogger } from "@mypickuae/plugins";
import { Elysia } from "elysia";
import { newsletterRoutes } from "./routes/newsletter.routes.ts";
import { notificationPreferenceRoutes } from "./routes/notification-preference.routes.ts";
import { notificationRoutes } from "./routes/notification.routes.ts";
import { whatsappWebhookRoutes } from "./routes/whatsapp-webhook.routes.ts";

export const app = new Elysia()
  .use(requestLogger)
  .use(errorHandler)
  // Root health check (gateway /health polls every service at GET /health).
  .get("/health", () => ({
    status: "ok",
    service: "notification-service",
    timestamp: new Date().toISOString(),
  }))
  .use(notificationRoutes)
  .use(notificationPreferenceRoutes)
  .use(newsletterRoutes)
  .use(whatsappWebhookRoutes);
