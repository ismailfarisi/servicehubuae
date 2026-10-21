import { config } from "@mypickuae/config";
import {
  AppDataSource,
  AuditLog,
  SiteSetting,
  User,
  Vendor,
  VendorIntegration,
  VendorIntegrationDelivery,
  VendorIntegrationMapping,
  VendorIntegrationPendingWrite,
  ensureDatabase,
} from "@mypickuae/database";
import { getIntegrationEventsQueue } from "@mypickuae/integration-events";
import { EncryptionService } from "@mypickuae/utils";
import { Elysia } from "elysia";
import { type RedisClientType, createClient } from "redis";
import { DispatcherService } from "./domain/dispatcher/dispatcher.service.ts";
import { createDispatcherWorker } from "./domain/dispatcher/dispatcher.worker.ts";
import { DomainDispatch } from "./domain/inbound/domain-dispatch.ts";
import { InboundService } from "./domain/inbound/inbound.service.ts";
import { IntegrationController } from "./domain/integration/integration.controller.ts";
import { IntegrationService } from "./domain/integration/integration.service.ts";
import { MappingService } from "./domain/mapping/mapping.service.ts";
import { PendingWritesService } from "./domain/pending-writes/pending-writes.service.ts";

await ensureDatabase();

const siteSettingRepo = AppDataSource.getRepository(SiteSetting);
const vendorRepo = AppDataSource.getRepository(Vendor);
const integrationRepo = AppDataSource.getRepository(VendorIntegration);
const mappingRepo = AppDataSource.getRepository(VendorIntegrationMapping);
const deliveryRepo = AppDataSource.getRepository(VendorIntegrationDelivery);
const pendingWriteRepo = AppDataSource.getRepository(VendorIntegrationPendingWrite);
const auditLogRepo = AppDataSource.getRepository(AuditLog);
const userRepo = AppDataSource.getRepository(User);

const encryption = new EncryptionService(config.encryption.key);
const eventsQueue = getIntegrationEventsQueue();

const integrationService = new IntegrationService(integrationRepo, encryption, auditLogRepo);
const integrationController = new IntegrationController(integrationService);
const mappingService = new MappingService(mappingRepo, auditLogRepo);
const pendingWritesService = new PendingWritesService(pendingWriteRepo);
const domainDispatch = new DomainDispatch({
  orderHost: process.env.ORDER_HOST ?? "http://order-service:3003",
  productHost: process.env.PRODUCT_HOST ?? "http://product-service:3002",
});
const inboundService = new InboundService({
  integrationRepo,
  mappingRepo,
  deliveryRepo,
  pendingWrites: pendingWritesService,
  domainDispatch,
  encryption,
});

export const container = new Elysia({ name: "integration-service-container" })
  .decorate("vendorRepo", vendorRepo)
  .decorate("integrationRepo", integrationRepo)
  .decorate("mappingRepo", mappingRepo)
  .decorate("deliveryRepo", deliveryRepo)
  .decorate("pendingWriteRepo", pendingWriteRepo)
  .decorate("encryption", encryption)
  .decorate("eventsQueue", eventsQueue)
  .decorate("integrationService", integrationService)
  .decorate("integrationController", integrationController)
  .decorate("mappingService", mappingService)
  .decorate("pendingWritesService", pendingWritesService)
  .decorate("domainDispatch", domainDispatch)
  .decorate("inboundService", inboundService)
  .decorate("siteSettingRepo", siteSettingRepo)
  .decorate("userRepo", userRepo);

const dispatcherRedis: RedisClientType = createClient({
  socket: { host: config.redis.host, port: config.redis.port },
  password: config.redis.password,
}) as RedisClientType;
dispatcherRedis
  .connect()
  .catch((err: any) => console.error("Dispatcher redis connect error:", err));

const dispatcherService = new DispatcherService();
const _dispatcherWorker = createDispatcherWorker({
  integrationRepo,
  mappingRepo,
  deliveryRepo,
  encryption,
  service: dispatcherService,
  redis: dispatcherRedis,
});
