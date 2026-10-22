function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

export const config = {
  env,
  isProduction,
  port: {
    gateway: Number(process.env.GATEWAY_PORT) || 3000,
    auth: Number(process.env.AUTH_PORT) || 3001,
    catalog: Number(process.env.CATALOG_PORT) || 3002,
    vendor: Number(process.env.VENDOR_PORT) || 3004,
    notification: Number(process.env.NOTIFICATION_PORT) || 3005,
    cms: Number(process.env.CMS_PORT) || 3006,
    reels: Number(process.env.REELS_PORT) || 3007,
    integration: Number(process.env.INTEGRATION_PORT) || 3008,
    booking: Number(process.env.BOOKING_PORT) || 3009,
  },
  serviceHost: {
    auth: process.env.AUTH_HOST || "localhost",
    catalog: process.env.CATALOG_HOST || "localhost",
    vendor: process.env.VENDOR_HOST || "localhost",
    notification: process.env.NOTIFICATION_HOST || "localhost",
    cms: process.env.CMS_HOST || "localhost",
    reels: process.env.REELS_HOST || "localhost",
    integration: process.env.INTEGRATION_HOST || "localhost",
    booking: process.env.BOOKING_HOST || "localhost",
  },
  database: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "mypickuae",
    password: isProduction ? requireEnv("DB_PASSWORD") : process.env.DB_PASSWORD || "mypickuae",
    database: process.env.DB_NAME || "mypickuae",
  },
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    accessSecret: isProduction
      ? requireEnv("JWT_ACCESS_SECRET")
      : process.env.JWT_ACCESS_SECRET || "dev-access-secret",
    refreshSecret: isProduction
      ? requireEnv("JWT_REFRESH_SECRET")
      : process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
    accessExpiresIn: "15m",
    refreshExpiresIn: "7d",
  },
  aws: {
    region: process.env.AWS_REGION || "me-south-1",
    // SES identities are region-scoped. The verified mypickuae.com identity
    // lives in a specific region that may differ from where S3/media run, so
    // SES gets its own region knob. Falls back to AWS_REGION when unset.
    sesRegion: process.env.SES_REGION || process.env.AWS_REGION || "me-south-1",
    // Production uses the EC2 instance IAM role — no static keys. An empty
    // string makes the AWS SDK fall back to the default credential chain
    // (instance metadata). See terraform/production/iam.tf.
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    // Local dev only: points the S3 client at the `local-s3` docker-compose
    // service instead of AWS. Unset in staging/prod, so the SDK talks to AWS.
    s3Endpoint: process.env.S3_ENDPOINT || "",
  },
  media: {
    s3Bucket: process.env.S3_MEDIA_BUCKET || "mypickuae-media-dev",
    cloudfrontDomain: process.env.CLOUDFRONT_DOMAIN || "",
    cloudfrontDistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || "",
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as readonly string[],
    sizes: { thumb: 150, card: 320, medium: 600, large: 1200 } as const,
  },
  invoice: {
    trn: process.env.PLATFORM_TRN || null,
    legalName: process.env.PLATFORM_LEGAL_NAME || "MyPickUAE",
  },
  twoFa: {
    encryptionKey: isProduction
      ? requireEnv("TWO_FA_ENCRYPTION_KEY")
      : process.env.TWO_FA_ENCRYPTION_KEY || "dev-2fa-encryption-key-32bytes!!",
  },
  internal: {
    serviceSecret: isProduction
      ? requireEnv("INTERNAL_SERVICE_SECRET")
      : process.env.INTERNAL_SERVICE_SECRET || "dev-internal-secret",
    notificationServiceUrl:
      process.env.NOTIFICATION_SERVICE_URL ||
      `http://localhost:${Number(process.env.NOTIFICATION_PORT) || 3005}`,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    connectWebhookSecret: process.env.STRIPE_CONNECT_WEBHOOK_SECRET || "",
  },
  payments: {
    // Card payments (prepay/deposit) need the MyFatoorah module (M2). Until it
    // ships, only pay_at_venue offerings can be published and booked.
    onlineEnabled: process.env.ONLINE_PAYMENTS_ENABLED === "true",
  },
  whatsapp: {
    // Meta WhatsApp Cloud API. All optional — blank accessToken/phoneNumberId
    // means the channel is disabled and consumers must degrade to stubs
    // (never requireEnv here: a missing WhatsApp secret must not crash the
    // other services that import this config at boot).
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    apiBaseUrl: process.env.WHATSAPP_API_BASE_URL || "https://graph.facebook.com/v21.0",
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "",
    appSecret: process.env.WHATSAPP_APP_SECRET || "",
    templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en",
  },
  vendor: {
    encryptionKey: isProduction
      ? requireEnv("VENDOR_ENCRYPTION_KEY")
      : process.env.VENDOR_ENCRYPTION_KEY ||
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  },
  encryption: {
    key: isProduction
      ? requireEnv("ENCRYPTION_KEY")
      : process.env.ENCRYPTION_KEY ||
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  },
  bullmq: {
    redisUrl:
      process.env.BULLMQ_REDIS_URL ||
      `redis://${process.env.REDIS_HOST || "localhost"}:${Number(process.env.REDIS_PORT) || 6379}`,
    reservationExpiryIntervalMs: Number(process.env.RESERVATION_EXPIRY_INTERVAL_MS) || 60_000,
    lowStockThresholdDefault: Number(process.env.LOW_STOCK_THRESHOLD_DEFAULT) || 10,
  },
  orders: {
    pendingExpiryMinutes: Number(process.env.ORDER_PENDING_EXPIRY_MINUTES) || 60,
  },
  bookings: {
    pendingExpiryMinutes: Number(process.env.BOOKING_PENDING_EXPIRY_MINUTES) || 60,
    // Phase 5 Task 5b (spec §5.3 "Auto-complete"): grace period between
    // `ends_at` and the auto-complete fire time. DEFAULT MUST STAY 24h —
    // booking-auth.service.ts's AUTO_COMPLETE_DELAY_HOURS constant hardcodes
    // this same 24h in its own captureDeadline clamp math (the auth job's
    // fire-time -> Stripe-auth-validity safety margin assumes capture happens
    // by `ends_at + 24h`). Changing this env var in a real deployment without
    // also updating that constant would silently desync the two and could
    // let a Stripe authorization expire before auto-complete ever captures
    // it — see that file's AUTO_COMPLETE_DELAY_HOURS comment.
    autoCompleteGraceHours: Number(process.env.BOOKING_AUTOCOMPLETE_GRACE_HOURS) || 24,
    // Phase 5 Task 5 (spec §5.3 no-show strikes): pay_at_venue is revoked for a
    // customer at a vendor once their DERIVED per-vendor no_show count reaches
    // this threshold (default 3), and revoked EVERYWHERE once their platform-wide
    // no_show count reaches the higher platform backstop (default 8). Counts are
    // never stored — always `count(bookings WHERE status='no_show' AND customer=...
    // [AND vendor=...])` (StrikeService). Config-driven, mirroring
    // pendingExpiryMinutes / autoCompleteGraceHours above.
    noShowVendorStrikeThreshold: Number(process.env.BOOKING_NOSHOW_VENDOR_STRIKE_THRESHOLD) || 3,
    noShowPlatformStrikeThreshold:
      Number(process.env.BOOKING_NOSHOW_PLATFORM_STRIKE_THRESHOLD) || 8,
    // Base URL for customer-facing deep links in booking notifications (the
    // no-show dispute/support link, spec §5.3 amended §5.3). Reads the shared
    // WEB_URL env, so there is one storefront base across the monorepo; a dev
    // default keeps this usable without env.
    appUrl: process.env.WEB_URL || "http://localhost:4000",
    // Phase 6 Task 5 (outbound signed iCal feed) — HMAC secret for
    // ical-feed-token.ts. The token itself is long-lived (a subscribed
    // calendar app polls this URL indefinitely, no expiry baked in) —
    // revocation is ONLY a global secret rotation (invalidates every issued
    // feed URL at once); per-staff revocation is a Phase 7+ concern. See
    // ical-feed-token.ts's header for the full rationale.
    //
    // Fail-closed in production, but LAZILY (fix cycle 2, review finding
    // "BOOKING_ICAL_FEED_SECRET can crash-loop EVERY service").
    //
    // The security property is unchanged from the eager version: in
    // production an unset/empty secret throws, so booking-service can never
    // sign or verify a feed token with the public-repo dev string — every
    // staff feed URL would otherwise be forgeable by anyone who read this
    // file. Staging runs NODE_ENV=production too, so there is no
    // forgeable-dev-key window there either.
    //
    // What changed is WHEN it throws. `config` is a single eagerly-evaluated
    // module-level object imported by every service, so evaluating
    // requireEnv() at construction time took down api-gateway, auth, catalog,
    // vendor… on a missing secret, even though booking-service is the only
    // consumer. As a getter the check runs on FIRST ACCESS instead, so the
    // blast radius is exactly the code path that needs the secret
    // (booking-service's container.ts / ical-feed.routes.ts). Call sites are
    // unchanged — `config.bookings.icalFeedSecret` still reads as a string.
    get icalFeedSecret(): string {
      return isProduction
        ? requireEnv("BOOKING_ICAL_FEED_SECRET")
        : (process.env.BOOKING_ICAL_FEED_SECRET ?? "dev-only-ical-feed-key");
    },
  },
  cache: {
    categoryTreeTtl: Number(process.env.CATEGORY_TREE_CACHE_TTL) || 3600,
    productDetailTtl: Number(process.env.PRODUCT_DETAIL_CACHE_TTL) || 600,
    productListTtl: Number(process.env.PRODUCT_LIST_CACHE_TTL) || 300,
    // Per-staff/day free-window read-model. Short TTL also caps staleness if a
    // holiday write-path invalidation is ever missed (Phase 3 fallback).
    availabilityTtl: Number(process.env.AVAILABILITY_CACHE_TTL) || 300,
  },
  typesense: {
    host: process.env.TYPESENSE_HOST || "127.0.0.1",
    port: Number(process.env.TYPESENSE_PORT) || 8108,
    protocol: process.env.TYPESENSE_PROTOCOL || "http",
    apiKey: isProduction
      ? requireEnv("TYPESENSE_API_KEY")
      : process.env.TYPESENSE_API_KEY || "dev-typesense-key",
    servicesCollectionName: process.env.TYPESENSE_SERVICES_COLLECTION || "service_offerings",
  },
  cloudflareStream: {
    accountId: process.env.CLOUDFLARE_STREAM_ACCOUNT_ID ?? "",
    apiToken: process.env.CLOUDFLARE_STREAM_API_TOKEN ?? "",
    webhookSecret: process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET ?? "",
    // Overridden only in local dev to point at the `local-stream` docker-compose
    // service. Staging/prod leave both unset and talk to Cloudflare.
    apiBaseUrl:
      process.env.CLOUDFLARE_STREAM_API_BASE_URL || "https://api.cloudflare.com/client/v4",
    deliveryBaseUrl: process.env.CLOUDFLARE_STREAM_DELIVERY_BASE_URL || "https://videodelivery.net",
  },
  google: {
    /** Public API key for Drive v3 files.list. If null, folder URLs in
     *  bulk catalog import fail with drive_api_not_configured. */
    driveApiKey: process.env.GOOGLE_DRIVE_API_KEY || null,
    /** Gemini API key for AI-powered product media features. */
    geminiApiKey: process.env.GOOGLE_GEMINI_API_KEY ?? "",
  },
  urls: {
    vendorDashboard:
      process.env.VENDOR_DASHBOARD_URL ||
      (isProduction ? requireEnv("VENDOR_DASHBOARD_URL") : "http://localhost:4001"),
    adminPanel:
      process.env.ADMIN_PANEL_URL ||
      (isProduction ? requireEnv("ADMIN_PANEL_URL") : "http://localhost:4002"),
    // Public gateway base URL for building absolute links returned to API
    // clients (Phase 6 Task 5's issued .ics feed URL). Mirrors
    // libs/utils/email.service.ts's own `PUBLIC_API_URL` fallback (the
    // gateway's default port, 3000) — same env var, now also readable via
    // config instead of only a raw `process.env` read.
    publicApi: process.env.PUBLIC_API_URL || "http://localhost:3000",
  },
} as const;

export type Config = typeof config;
