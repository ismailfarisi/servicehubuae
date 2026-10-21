import { config } from "@mypickuae/config";
import {
  AppDataSource,
  User,
} from "@mypickuae/database";
import { EmailService, WhatsAppService } from "@mypickuae/utils";
import { Elysia } from "elysia";
import { createClient } from "redis";
import { NewsletterController } from "./controllers/newsletter.controller.ts";
import { NotificationPreferenceController } from "./controllers/notification-preference.controller.ts";
import { NotificationController } from "./controllers/notification.controller.ts";
import { createEventConsumerWorker } from "./jobs/event-consumer.job.ts";
import {
  createNotificationDispatchWorker,
  getNotificationDispatchQueue,
} from "./jobs/notification-dispatch.job.ts";
import { NewsletterSubscriberRepository } from "./repositories/newsletter-subscriber.repository.ts";
import { NotificationPreferenceRepository } from "./repositories/notification-preference.repository.ts";
import { NotificationRepository } from "./repositories/notification.repository.ts";
import { SesEmailDispatcher } from "./services/email-dispatcher.ts";
import { NewsletterService } from "./services/newsletter.service.ts";
import { NotificationDispatcherService } from "./services/notification-dispatcher.service.ts";
import { NotificationPreferenceService } from "./services/notification-preference.service.ts";
import { NotificationService } from "./services/notification.service.ts";
import { StubPushDispatcher } from "./services/push-dispatcher.ts";
import { MetaWhatsAppDispatcher, StubWhatsAppDispatcher } from "./services/whatsapp-dispatcher.ts";

// Redis client
const redisClient = createClient({
  socket: { host: config.redis.host, port: config.redis.port },
  password: config.redis.password,
});

// Repositories
const preferenceRepo = new NotificationPreferenceRepository();
const notificationRepo = new NotificationRepository();
const userRepo = AppDataSource.getRepository(User);

// Services
const preferenceService = new NotificationPreferenceService(preferenceRepo);
const notificationService = new NotificationService(notificationRepo);

// Controllers
const notificationController = new NotificationController(notificationService);
const preferenceController = new NotificationPreferenceController(preferenceService);

// ── Newsletter ───────────────────────────────────────────────────────────────
const newsletterRepo = new NewsletterSubscriberRepository();
const emailService = new EmailService();
const newsletterService = new NewsletterService(newsletterRepo, emailService);
const newsletterController = new NewsletterController(newsletterService);

// ── Notification Dispatcher ──────────────────────────────────────────────────
const emailDispatcher = new SesEmailDispatcher(emailService);
const pushDispatcher = new StubPushDispatcher();
// Missing WhatsApp credentials must degrade to a stub, never crash boot
// (same lesson as auth-service's phone-verification provider).
let whatsAppDispatcher: MetaWhatsAppDispatcher | StubWhatsAppDispatcher;
if (WhatsAppService.isConfigured(config.whatsapp)) {
  whatsAppDispatcher = new MetaWhatsAppDispatcher(new WhatsAppService(config.whatsapp));
} else {
  console.warn(
    "[notification-service] WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID not set; whatsapp channel is stubbed",
  );
  whatsAppDispatcher = new StubWhatsAppDispatcher();
}
const dispatchQueue = getNotificationDispatchQueue();

const notificationDispatcher = new NotificationDispatcherService(
  notificationService,
  preferenceService,
  emailDispatcher,
  pushDispatcher,
  whatsAppDispatcher,
  userRepo,
  redisClient,
);

// Start BullMQ workers
const _dispatchWorker = createNotificationDispatchWorker(notificationDispatcher);
const _eventConsumer = createEventConsumerWorker(dispatchQueue);

export const container = new Elysia({ name: "notification-service-container" })
  .decorate("notificationController", notificationController)
  .decorate("preferenceController", preferenceController)
  .decorate("redisClient", redisClient)
  .decorate("newsletterController", newsletterController);
