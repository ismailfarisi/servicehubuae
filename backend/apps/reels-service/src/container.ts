import { config } from "@mypickuae/config";
import { ReelLicenseFundingSource } from "@mypickuae/database";
import { Queue } from "bullmq";
import { Elysia } from "elysia";
import Stripe from "stripe";

import { CollabService } from "./domain/collab/collab.service.ts";
import {
  CollabDeadlineRemindersJob,
  type NotifierClient,
} from "./domain/collab/jobs/collab-deadline-reminders.job.ts";
import { ExpireCollabsJob } from "./domain/collab/jobs/expire-collabs.job.ts";
import { BriefService } from "./domain/licensing/brief.service.ts";
import {
  CloudflareStreamDownloadProvider,
  FakeDownloadProvider,
} from "./domain/licensing/download-provider.ts";
import { EscrowEngine } from "./domain/licensing/escrow-engine.ts";
import { ExpireBriefsJob } from "./domain/licensing/jobs/expire-briefs.job.ts";
import { ExpireOffersJob } from "./domain/licensing/jobs/expire-offers.job.ts";
import { LicensingService } from "./domain/licensing/licensing.service.ts";
import { PayoutBalanceRail } from "./domain/licensing/payout-balance-rail.ts";
import { RightsService } from "./domain/licensing/rights.service.ts";
import { StripeChargeGateway, StripeChargeRail } from "./domain/licensing/stripe-charge-rail.ts";

import { AdminAnalyticsService } from "./domain/analytics/admin-analytics.service.ts";
import { RecomputeDailyRollupsJob } from "./domain/analytics/jobs/recompute-daily-rollups.job.ts";
import { RollupService } from "./domain/analytics/rollup.service.ts";
import { VendorAnalyticsService } from "./domain/analytics/vendor-analytics.service.ts";
import { CreatorApplicationService } from "./domain/creator-tier/creator-application.service.ts";
import { CreatorDirectoryService } from "./domain/creator-tier/creator-directory.service.ts";
import { CreatorMediaKitService } from "./domain/creator-tier/creator-media-kit.service.ts";
import { CreatorPortfolioService } from "./domain/creator-tier/creator-portfolio.service.ts";
import { GraduationService } from "./domain/creator-tier/graduation.service.ts";
import { TrustService } from "./domain/creator-tier/trust.service.ts";
import { DiscoveryService } from "./domain/discovery/discovery.service.ts";
import { ShortlistService } from "./domain/discovery/shortlist.service.ts";
import { FeedCacheClient, type RedisLike } from "./domain/feed/feed-cache.client.ts";
import { FeedService } from "./domain/feed/feed.service.ts";
import { RecomputeCohortFeedsJob } from "./domain/feed/jobs/recompute-cohort-feeds.job.ts";
import { RecomputeRankingJob } from "./domain/feed/jobs/recompute-ranking.job.ts";
import { ModerationController } from "./domain/moderation/moderation.controller.ts";
import { ModerationService } from "./domain/moderation/moderation.service.ts";
import { TaggingPermissionsService } from "./domain/moderation/tagging-permissions.service.ts";
import { ReelsController } from "./domain/reels/reels.controller.ts";
import { ReelsService } from "./domain/reels/reels.service.ts";
import { FollowService } from "./domain/social/follow.service.ts";
import { LikeService } from "./domain/social/like.service.ts";
import { SaveService } from "./domain/social/save.service.ts";
import { ShareService } from "./domain/social/share.service.ts";
import { ViewService } from "./domain/social/view.service.ts";
import { CloudflareStreamRecoveryJob } from "./domain/upload/cloudflare-stream-recovery.job.ts";
import { CloudflareStreamClient } from "./domain/upload/cloudflare-stream.client.ts";
import { WebhookHandler } from "./domain/upload/webhook.handler.ts";
import { CreatorWalletService } from "./domain/wallet/creator-wallet.service.ts";

// ─── Upload ───────────────────────────────────────────────────────────
const cloudflareClient = new CloudflareStreamClient();

// ─── Creator tier (trust + graduation) ────────────────────────────────
const trustService = new TrustService();
const graduationService = new GraduationService();
const creatorApplicationService = new CreatorApplicationService();
const creatorPortfolioService = new CreatorPortfolioService();
// NOT decorated onto the container below, deliberately: the container is at
// the ceiling of what TypeScript will infer through, and one more `.decorate`
// tips admin-analytics.routes.ts into TS2589 ("type instantiation is
// excessively deep"). It is exported as a named singleton instead — the same
// way the jobs below are consumed — and imported directly by
// creator-directory.routes.ts, which needs nothing else from the container.
const creatorDirectoryService = new CreatorDirectoryService();
// Same reasoning: a named singleton, not another `.decorate` on the container.
const creatorMediaKitService = new CreatorMediaKitService();

// ─── Reels ────────────────────────────────────────────────────────────
const reelsService = new ReelsService(cloudflareClient, trustService);
const reelsController = new ReelsController(reelsService);

// ─── Moderation ───────────────────────────────────────────────────────
const moderationService = new ModerationService();
const moderationController = new ModerationController(moderationService);
const taggingPermissionsService = new TaggingPermissionsService();

// ─── Webhook ──────────────────────────────────────────────────────────
const webhookHandler = new WebhookHandler(reelsService);
const cloudflareStreamRecoveryJob = new CloudflareStreamRecoveryJob(
  config.bullmq.redisUrl,
  cloudflareClient,
  webhookHandler,
);
reelsService.setUploadRecoveryScheduler(cloudflareStreamRecoveryJob);

// ─── Feed cache + scheduled jobs ──────────────────────────────────────
// NOTE: FeedCacheClient's `RedisLike` structural interface targets an
// ioredis-shaped client (`zrevrange`, `zadd`), while this monorepo uses
// node-redis v4. Reconciling the two is known deferred debt (see Task 4).
// For now we wire an inert stub: the cohort job only exercises this at
// runtime, and production deployment will swap it for a real ioredis-
// compatible instance (BullMQ already pulls ioredis transitively).
// TODO(M2): replace with a real Redis client once the adapter lands.
const feedCacheRedisStub: RedisLike = {
  multi: () => {
    const self = {
      del: () => self,
      zadd: () => self,
      expire: () => self,
      exec: async () => [],
    };
    return self;
  },
  zrevrange: async () => [],
  del: async () => 0,
};
const feedCache = new FeedCacheClient(feedCacheRedisStub);
const cohortJob = new RecomputeCohortFeedsJob(feedCache);
const rankingJob = new RecomputeRankingJob();

// ─── Feed + social services ───────────────────────────────────────────
// FeedService lazily resolves its ReelView/Reel repositories on first
// query so the container can be imported before `ensureDatabase()`.
const feedService = new FeedService(feedCache);
const likeService = new LikeService(rankingJob);
const saveService = new SaveService(rankingJob);
const shareService = new ShareService(rankingJob);
const followService = new FollowService();
const viewService = new ViewService();

// ─── Creator wallet (licensing + collab payouts) ─────────────────────
const creatorWalletService = new CreatorWalletService();

// ─── Internal notifier ────────────────────────────────────────────────
// HTTP notifier used by the collab deadline reminders. Posts to
// notification-service's /notifications/send-internal route which is gated
// by x-internal-secret (see notification.routes.ts). Transport errors
// surface to BullMQ's attempts+backoff so the worker retries on transient
// 5xx / network blips.
const internalNotifier: NotifierClient = {
  async send(payload) {
    const url = `${config.internal.notificationServiceUrl}/notifications/send-internal`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-secret": config.internal.serviceSecret,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`notification_send_failed_${res.status}`);
    }
  },
};

// ─── Analytics ────────────────────────────────────────────────────
const rollupService = new RollupService();
const adminAnalyticsService = new AdminAnalyticsService(rollupService);
const vendorAnalyticsService = new VendorAnalyticsService();
const recomputeDailyRollupsJob = new RecomputeDailyRollupsJob();

// ─── Discovery (UGC gallery + shortlist) ──────────────────────────────
const discoveryService = new DiscoveryService();
const shortlistService = new ShortlistService();

// ─── Licensing escrow ─────────────────────────────────────────────────
// STRIPE_SECRET_KEY defaults to "": no client, and StripeChargeGateway answers
// 503 stripe_not_configured on use instead of failing at boot.
const stripeClient = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey, { apiVersion: "2026-03-25.dahlia" })
  : null;
const licensingRails = {
  [ReelLicenseFundingSource.payout_balance]: new PayoutBalanceRail(),
  [ReelLicenseFundingSource.stripe]: new StripeChargeRail(new StripeChargeGateway(stripeClient)),
};
const licensingService = new LicensingService(licensingRails, creatorWalletService);
const escrowEngine = new EscrowEngine(licensingRails, creatorWalletService);
const briefService = new BriefService(escrowEngine);
const downloadProvider =
  config.cloudflareStream.accountId && config.cloudflareStream.apiToken
    ? new CloudflareStreamDownloadProvider(
        config.cloudflareStream.accountId,
        config.cloudflareStream.apiToken,
      )
    : new FakeDownloadProvider();
const rightsService = new RightsService(downloadProvider);
const expireOffersJob = new ExpireOffersJob(config.bullmq.redisUrl, licensingService);
const expireBriefsJob = new ExpireBriefsJob(config.bullmq.redisUrl, briefService);
// Producer handle on the shared cross-service "notification-events" queue.
// Each producer service creates its own handle rather than importing
// notification-service's module — the queue name is the contract, since these
// are separate deployables (same pattern as booking-service).
const notificationEventsQueue = new Queue("notification-events", {
  connection: { url: config.bullmq.redisUrl },
});
const collabService = new CollabService(escrowEngine, notificationEventsQueue);
const expireCollabsJob = new ExpireCollabsJob(config.bullmq.redisUrl, collabService);
const collabRemindersJob = new CollabDeadlineRemindersJob(
  config.bullmq.redisUrl,
  collabService,
  internalNotifier,
);

export const container = new Elysia({ name: "reels-service-container" })
  .decorate("collabService", collabService)
  .decorate("reelsService", reelsService)
  .decorate("reelsController", reelsController)
  .decorate("trustService", trustService)
  .decorate("graduationService", graduationService)
  .decorate("creatorApplicationService", creatorApplicationService)
  .decorate("creatorPortfolioService", creatorPortfolioService)
  .decorate("moderationService", moderationService)
  .decorate("moderationController", moderationController)
  .decorate("taggingPermissionsService", taggingPermissionsService)
  .decorate("cloudflareClient", cloudflareClient)
  .decorate("webhookHandler", webhookHandler)
  .decorate("cloudflareStreamRecoveryJob", cloudflareStreamRecoveryJob)
  .decorate("feedCache", feedCache)
  .decorate("cohortJob", cohortJob)
  .decorate("rankingJob", rankingJob)
  .decorate("feedService", feedService)
  .decorate("likeService", likeService)
  .decorate("saveService", saveService)
  .decorate("shareService", shareService)
  .decorate("followService", followService)
  .decorate("viewService", viewService)
  .decorate("creatorWalletService", creatorWalletService)
  .decorate("rollupService", rollupService)
  .decorate("adminAnalyticsService", adminAnalyticsService)
  .decorate("vendorAnalyticsService", vendorAnalyticsService)
  .decorate("discoveryService", discoveryService)
  .decorate("shortlistService", shortlistService)
  .decorate("licensingService", licensingService)
  .decorate("rightsService", rightsService)
  .decorate("briefService", briefService);

export {
  creatorDirectoryService,
  creatorMediaKitService,
  feedCache,
  cohortJob,
  rankingJob,
  recomputeDailyRollupsJob,
  cloudflareStreamRecoveryJob,
  expireOffersJob,
  expireBriefsJob,
  expireCollabsJob,
  collabRemindersJob,
};
