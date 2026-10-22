import type { MigrationInterface, QueryRunner } from "typeorm";

// Initial schema: generated from the entity metadata, plus the schema features
// entities cannot express (notification partitions, the staff_engagements
// exclusion constraint, and the counter/graduation triggers).
export class InitialSchema1792577665748 implements MigrationInterface {
  name = "InitialSchema1792577665748";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'admin', 'customer', 'guest')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'inactive', 'suspended', 'pending_verification')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_creator_tier_enum" AS ENUM('regular', 'creator', 'influencer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(20), "phone_verified_at" TIMESTAMP WITH TIME ZONE, "email_verified_at" TIMESTAMP WITH TIME ZONE, "password_hash" character varying(255) NOT NULL, "must_change_password" boolean NOT NULL DEFAULT false, "token_version" integer NOT NULL DEFAULT '1', "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending_verification', "avatar_url" character varying(1024), "preferred_locale" character varying(10) NOT NULL DEFAULT 'en', "preferred_currency" character varying(3) NOT NULL DEFAULT 'AED', "fcm_token" character varying(512), "last_login_at" TIMESTAMP WITH TIME ZONE, "login_attempts" smallint NOT NULL DEFAULT '0', "locked_until" TIMESTAMP WITH TIME ZONE, "google_id" character varying(255), "apple_id" character varying(255), "wallet_balance" integer NOT NULL DEFAULT '0', "wallet_currency" character varying(3) NOT NULL DEFAULT 'AED', "can_tag_unowned" boolean NOT NULL DEFAULT false, "follower_count" integer NOT NULL DEFAULT '0', "following_count" integer NOT NULL DEFAULT '0', "published_reel_count" integer NOT NULL DEFAULT '0', "creator_tier" "public"."users_creator_tier_enum" NOT NULL DEFAULT 'regular', "creator_tier_earned_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b383987bfa6e6a8745085621d0" ON "users" ("email") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_addresses_type_enum" AS ENUM('shipping', 'billing', 'both')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "label" character varying(100) NOT NULL, "type" "public"."user_addresses_type_enum" NOT NULL, "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "address_line_1" character varying(255) NOT NULL, "address_line_2" character varying(255), "building_name" character varying(150), "apartment" character varying(50), "floor" character varying(50), "city" character varying(100) NOT NULL, "state" character varying(100), "postal_code" character varying(20), "country_code" character(2) NOT NULL, "latitude" numeric(10,7), "longitude" numeric(10,7), "area_id" uuid, "is_default" boolean NOT NULL DEFAULT false, "delivery_notes" character varying(500), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8abbeb5e3239ff7877088ffc25b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "phone_auth_challenges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phone" character varying(20) NOT NULL, "token_hash" character varying(255) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "ip_address" character varying(45), "user_agent" character varying(512), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_f3c6d04dbea153027f74f699bd7" UNIQUE ("token_hash"), CONSTRAINT "PK_2da4bb62185733e29c1f4cbfa8c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_733a1b0ce482d8dad7fdfaf652" ON "phone_auth_challenges" ("phone") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d1c8d069847e5ae1783ef6e7ed" ON "phone_auth_challenges" ("token_hash") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_verified_phones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "phone" character varying(20) NOT NULL, "verified_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8279ed44b1adda0c89e43b8213b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_user_verified_phone" ON "user_verified_phones" ("user_id", "phone") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "refresh_token_hash" character varying(255) NOT NULL, "device_info" jsonb, "ip_address" character varying(45), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "is_revoked" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_tokens_type_enum" AS ENUM('email_verify', 'password_reset', 'two_fa_setup', 'magic_link')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "token_hash" character varying(255) NOT NULL, "type" "public"."user_tokens_type_enum" NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "ip_address" character varying(45), "user_agent" character varying(512), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_ebdd918653813b59cdd5d379b5b" UNIQUE ("token_hash"), CONSTRAINT "PK_63764db9d9aaa4af33e07b2f4bf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8439498e5cddde50e3b87c5134" ON "user_tokens" ("token_hash") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_two_factor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "secret_encrypted" text NOT NULL, "is_enabled" boolean NOT NULL DEFAULT false, "enabled_at" TIMESTAMP WITH TIME ZONE, "backup_codes_encrypted" text NOT NULL DEFAULT '[]', "last_used_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_0e865d85e0ad6329b40523afe55" UNIQUE ("user_id"), CONSTRAINT "REL_0e865d85e0ad6329b40523afe5" UNIQUE ("user_id"), CONSTRAINT "PK_a0dc97e08540c59d6c744e21c58" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('order_update', 'payment', 'promotion', 'system', 'vendor', 'order_confirmed', 'order_shipped', 'order_delivered', 'payment_received', 'payout_sent', 'new_review', 'low_stock', 'vendor_approved', 'return_requested', 'dispute_opened', 'dispute_resolved', 'booking_confirmed', 'booking_reminder', 'booking_rescheduled', 'booking_cancelled', 'booking_no_show', 'booking_completed', 'booking_review_request', 'booking_payment_failed', 'vendor_new_booking', 'vendor_booking_cancelled', 'vendor_booking_conflict', 'vendor_new_order', 'collab_invited')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_channel_enum" AS ENUM('email', 'push', 'sms', 'in_app', 'whatsapp')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "channel" "public"."notifications_channel_enum" NOT NULL DEFAULT 'in_app', "title" character varying(255) NOT NULL, "body" text NOT NULL, "data" jsonb, "is_read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP WITH TIME ZONE, "action_url" character varying(1024), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, PRIMARY KEY ("id", "created_at")) PARTITION BY RANGE ("created_at")`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_preferences_notification_type_enum" AS ENUM('order_update', 'payment', 'promotion', 'system', 'vendor', 'order_confirmed', 'order_shipped', 'order_delivered', 'payment_received', 'payout_sent', 'new_review', 'low_stock', 'vendor_approved', 'return_requested', 'dispute_opened', 'dispute_resolved', 'booking_confirmed', 'booking_reminder', 'booking_rescheduled', 'booking_cancelled', 'booking_no_show', 'booking_completed', 'booking_review_request', 'booking_payment_failed', 'vendor_new_booking', 'vendor_booking_cancelled', 'vendor_booking_conflict', 'vendor_new_order', 'collab_invited')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_preferences_channel_enum" AS ENUM('email', 'push', 'sms', 'in_app', 'whatsapp')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "notification_type" "public"."notification_preferences_notification_type_enum" NOT NULL, "channel" "public"."notification_preferences_channel_enum" NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_5d14f5e0612290ba6a315474d7b" UNIQUE ("user_id", "notification_type", "channel"), CONSTRAINT "PK_e94e2b543f2f218ee68e4f4fad2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "newsletter_subscribers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "user_id" uuid, "locale" text NOT NULL DEFAULT 'en', "source" text NOT NULL DEFAULT 'homepage', "subscribed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "unsubscribed_at" TIMESTAMP WITH TIME ZONE, "unsubscribe_token" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_38f9333e9961b2fdb589128d19b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "guest_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "session_token" character varying(255) NOT NULL, "fingerprint_hash" character varying(255), "ip_address" character varying(45), "user_agent" character varying(512), "preferred_locale" character varying(10) NOT NULL DEFAULT 'en', "preferred_currency" character varying(3) NOT NULL DEFAULT 'AED', "merged_to_user_id" uuid, "merged_at" TIMESTAMP WITH TIME ZONE, "last_active_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_156ffe6484249f432cd081eff30" UNIQUE ("session_token"), CONSTRAINT "PK_7c077389b040139ae9487c1b03e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_156ffe6484249f432cd081eff3" ON "guest_sessions" ("session_token") `,
    );
    await queryRunner.query(
      `CREATE TABLE "saved_searches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying(255), "query" character varying(500) NOT NULL, "filters" jsonb, "notify_on_match" boolean NOT NULL DEFAULT false, "last_notified_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d9a53c71ccc5cf66dcdc5b33dfe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "recent_searches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "query" text NOT NULL, "last_used_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_be062c120d505d479cb3113f1cc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_566b01af8b6063d48a27626679" ON "recent_searches" ("user_id", "last_used_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendors_status_enum" AS ENUM('pending', 'under_review', 'approved', 'rejected', 'suspended', 'deactivated')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendors_commission_type_enum" AS ENUM('percentage', 'fixed', 'tiered')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "founded_year" smallint, "story" text, "logo_url" character varying(1024), "banner_url" character varying(1024), "cover_images" jsonb NOT NULL DEFAULT '[]', "status" "public"."vendors_status_enum" NOT NULL DEFAULT 'pending', "verified_at" TIMESTAMP WITH TIME ZONE, "verified_by" uuid, "rejection_reason" text, "business_name" character varying(255) NOT NULL, "business_type" character varying(100) NOT NULL, "trade_license_number" character varying(100), "vat_number" character varying(50), "vat_registered" boolean NOT NULL DEFAULT false, "contact_email" character varying(255) NOT NULL, "contact_phone" character varying(20) NOT NULL, "whatsapp" character varying(20), "website_url" character varying(512), "address" jsonb, "social_links" jsonb NOT NULL DEFAULT '{}', "commission_type" "public"."vendors_commission_type_enum", "commission_value" numeric(8,4), "commission_tiers" jsonb, "payout_schedule" character varying(50) NOT NULL DEFAULT 'biweekly', "minimum_payout" integer NOT NULL DEFAULT '10000', "settlement_window_days" integer, "auto_approve_orders" boolean NOT NULL DEFAULT true, "services_trusted" boolean NOT NULL DEFAULT false, "auto_create_shipment" boolean NOT NULL DEFAULT true, "default_carrier" character varying(100), "default_shipping_account_id" uuid, "processing_time_days" smallint NOT NULL DEFAULT '2', "response_time_hours" smallint, "return_policy" text, "shipping_policy" text, "rating_avg" numeric(3,2) NOT NULL DEFAULT '0', "rating_count" integer NOT NULL DEFAULT '0', "total_sales" numeric(14,2) NOT NULL DEFAULT '0', "total_orders" integer NOT NULL DEFAULT '0', "follower_count" integer NOT NULL DEFAULT '0', "is_featured" boolean NOT NULL DEFAULT false, "featured_until" TIMESTAMP WITH TIME ZONE, "stripe_account_id" character varying(255), "charges_enabled" boolean NOT NULL DEFAULT false, "payouts_enabled" boolean NOT NULL DEFAULT false, "details_submitted" boolean NOT NULL DEFAULT false, "reels_program_joined_at" TIMESTAMP WITH TIME ZONE, "reels_commission_rate" numeric(5,4) NOT NULL DEFAULT '0.05', "reels_subsidy_ends_at" TIMESTAMP WITH TIME ZONE, "meta_title" character varying(255), "meta_description" character varying(500), "exclude_from_channel_feeds" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_7188425e2c26bcd0516fbbcd1be" UNIQUE ("slug"), CONSTRAINT "PK_9c956c9797edfae5c6ddacc4e6e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_750a10541e8f8048d076bed731" ON "vendors" ("slug") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_ai_usage" ("vendor_id" uuid NOT NULL, "month" character(7) NOT NULL, "count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_1af24a23d93ec0dc2e56179785b" PRIMARY KEY ("vendor_id", "month"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_documents_type_enum" AS ENUM('trade_license', 'vat_certificate', 'emirates_id', 'passport', 'bank_statement', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "type" "public"."vendor_documents_type_enum" NOT NULL, "file_url" character varying(1024) NOT NULL, "file_name" character varying(255) NOT NULL, "file_size" integer, "mime_type" character varying(100), "expiry_date" date, "is_verified" boolean NOT NULL DEFAULT false, "verified_at" TIMESTAMP WITH TIME ZONE, "verified_by" uuid, "rejection_reason" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_b6aa864f4d6f4a283445266a4dc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_218ad2aece37d1c3bf7cfe6c72" ON "vendor_documents" ("vendor_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_bank_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "account_holder_name" character varying(255) NOT NULL, "bank_name" character varying(255) NOT NULL, "account_number_encrypted" character varying(512) NOT NULL, "iban_encrypted" character varying(512), "swift_code" character varying(20), "routing_number" character varying(50), "currency" character(3) NOT NULL DEFAULT 'AED', "is_primary" boolean NOT NULL DEFAULT false, "is_verified" boolean NOT NULL DEFAULT false, "verified_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_737114e245e303e951b7cc3f0c9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_94e674d49212d992777ba20b8f" ON "vendor_bank_accounts" ("vendor_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "locale" character varying(10) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "return_policy" text, "shipping_policy" text, "meta_title" character varying(255), "meta_description" character varying(500), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_b0c30461cc843d95528e889e41c" UNIQUE ("vendor_id", "locale"), CONSTRAINT "PK_7b8aa98c0c3d01d46a5cf55b85a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_be516cd138f3a6318fb7b17ddd" ON "vendor_translations" ("vendor_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_followers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "user_id" uuid NOT NULL, "followed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_3acdb5184cf99505d1fba01427d" UNIQUE ("vendor_id", "user_id"), CONSTRAINT "PK_962cc3ca8dd840ca609a0c60099" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0cf0b8f1c9b56d545899636919" ON "vendor_followers" ("vendor_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9fd05625f8610fd308f072cba2" ON "vendor_followers" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_holidays" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "starts_at" date NOT NULL, "ends_at" date NOT NULL, "auto_extend_sla" boolean NOT NULL DEFAULT true, "notify_customers" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8852d6e9786154961e3cf509811" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a0d0070ae44e30a9566d401c5" ON "vendor_holidays" ("vendor_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_integrations_inventory_authority_enum" AS ENUM('authoritative', 'advisory')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_integrations_pricing_authority_enum" AS ENUM('authoritative', 'advisory')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_integrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "outbound_url" text, "outbound_secret_encrypted" text, "outbound_previous_secret_encrypted" text, "outbound_secret_rotated_at" TIMESTAMP WITH TIME ZONE, "inbound_secret_encrypted" text, "inbound_secret_last4" character varying(8), "inbound_ip_allowlist" text array NOT NULL DEFAULT '{}', "inventory_authority" "public"."vendor_integrations_inventory_authority_enum" NOT NULL DEFAULT 'advisory', "pricing_authority" "public"."vendor_integrations_pricing_authority_enum" NOT NULL DEFAULT 'advisory', "is_active" boolean NOT NULL DEFAULT true, "degraded_until" TIMESTAMP WITH TIME ZONE, "last_outbound_success_at" TIMESTAMP WITH TIME ZONE, "last_inbound_success_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_ea2aa03199e11003291f2b824b8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "vendor_integrations_active_uq" ON "vendor_integrations" ("vendor_id") WHERE is_active = true AND deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_integration_mappings_event_type_enum" AS ENUM('vendor_order.created', 'vendor_order.status_changed', 'shipment.created', 'shipment.status_changed', 'order.accept', 'order.reject', 'shipment.create', 'shipment.update_status', 'inventory.adjust', 'product.update_price', 'product.update_attribute')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_integration_mappings_direction_enum" AS ENUM('outbound', 'inbound')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_integration_mappings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "integration_id" uuid NOT NULL, "event_type" "public"."vendor_integration_mappings_event_type_enum" NOT NULL, "direction" "public"."vendor_integration_mappings_direction_enum" NOT NULL, "spec" jsonb NOT NULL, "is_enabled" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_fd236122d13c7bc5d0100e4cb5a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "vendor_integration_mappings_uq" ON "vendor_integration_mappings" ("integration_id", "event_type", "direction") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_integration_deliveries_event_type_enum" AS ENUM('vendor_order.created', 'vendor_order.status_changed', 'shipment.created', 'shipment.status_changed', 'order.accept', 'order.reject', 'shipment.create', 'shipment.update_status', 'inventory.adjust', 'product.update_price', 'product.update_attribute')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_integration_deliveries_direction_enum" AS ENUM('outbound', 'inbound')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_integration_deliveries_status_enum" AS ENUM('pending', 'delivered', 'failed', 'dlq', 'skipped')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_integration_deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "integration_id" uuid NOT NULL, "event_type" "public"."vendor_integration_deliveries_event_type_enum" NOT NULL, "direction" "public"."vendor_integration_deliveries_direction_enum" NOT NULL, "source_ref" jsonb, "idempotency_key" character varying(128), "request_body" jsonb, "request_headers" jsonb, "response_status" integer, "response_body" text, "latency_ms" integer NOT NULL DEFAULT '0', "attempt" smallint NOT NULL DEFAULT '1', "status" "public"."vendor_integration_deliveries_status_enum" NOT NULL DEFAULT 'pending', "error_message" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9ea8ab78599711ff6a0303db04c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "vid_idempotency_uq" ON "vendor_integration_deliveries" ("idempotency_key", "integration_id") WHERE idempotency_key IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "vid_integration_created_idx" ON "vendor_integration_deliveries" ("integration_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_integration_pending_writes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "integration_id" uuid NOT NULL, "delivery_id" uuid NOT NULL, "kind" character varying(32) NOT NULL, "payload" jsonb NOT NULL, "status" character varying(16) NOT NULL DEFAULT 'pending', "auto_apply_threshold_breached" boolean NOT NULL DEFAULT false, "reviewed_by" uuid, "reviewed_at" TIMESTAMP WITH TIME ZONE, "applied_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cd196bdfe2f21baeef4030c59e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "vipw_status_idx" ON "vendor_integration_pending_writes" ("integration_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_members_role_enum" AS ENUM('owner', 'manager', 'staff', 'viewer')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_members_status_enum" AS ENUM('pending', 'active', 'revoked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "user_id" uuid, "email" character varying(255) NOT NULL, "role" "public"."vendor_members_role_enum" NOT NULL, "status" "public"."vendor_members_status_enum" NOT NULL DEFAULT 'pending', "invite_token" character varying(64), "invite_expires_at" TIMESTAMP WITH TIME ZONE, "invited_by_user_id" uuid, "accepted_at" TIMESTAMP WITH TIME ZONE, "revoked_at" TIMESTAMP WITH TIME ZONE, "revoked_by_user_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_df4f5fd5f54daefe49e9b0a90c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0d3b6ba9896e44104938d7c70" ON "vendor_members" ("vendor_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."role_permissions_role_enum" AS ENUM('owner', 'manager', 'staff', 'viewer')`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."role_permissions_role_enum" NOT NULL, "permission" character varying(64) NOT NULL, "updated_by_user_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9c116ac03805ca80baf3e8d2319" UNIQUE ("role", "permission"), CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "parent_id" uuid, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "image_url" character varying(1024), "icon_url" character varying(1024), "banner_url" character varying(1024), "is_active" boolean NOT NULL DEFAULT true, "is_featured" boolean NOT NULL DEFAULT false, "sort_order" integer NOT NULL DEFAULT '0', "commission_rate" numeric(5,2), "meta_title" character varying(255), "meta_description" character varying(500), "meta_keywords" character varying(500), "path" text, "depth" smallint NOT NULL DEFAULT '0', "product_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_61720ee48ef901a7a228b06b04" ON "categories" ("slug") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "category_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category_id" uuid NOT NULL, "locale" character varying(10) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "meta_title" character varying(255), "meta_description" character varying(500), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_0e9b8be8a7526b1726dfb8f83ef" UNIQUE ("category_id", "locale"), CONSTRAINT "PK_9dff018a4a26a924c60d3e86432" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded', 'chargeback', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_payment_method_enum" AS ENUM('credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash_on_delivery', 'wallet', 'crypto', 'tabby', 'tamara')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_id" uuid, "user_id" uuid NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', "payment_method" "public"."payments_payment_method_enum" NOT NULL, "amount" integer NOT NULL, "currency" character(3) NOT NULL DEFAULT 'AED', "gateway" character varying(50) NOT NULL, "gateway_transaction_id" character varying(255), "gateway_payment_id" character varying(255), "gateway_order_id" character varying(255), "gateway_response" jsonb, "card_last4" character(4), "card_brand" character varying(20), "card_expiry" character varying(7), "refunded_amount" integer NOT NULL DEFAULT '0', "refund_reason" text, "refunded_at" TIMESTAMP WITH TIME ZONE, "authorized_at" TIMESTAMP WITH TIME ZONE, "captured_at" TIMESTAMP WITH TIME ZONE, "failed_at" TIMESTAMP WITH TIME ZONE, "failure_reason" text, "ip_address" character varying(45), "is_test" boolean NOT NULL DEFAULT false, "three_ds_status" character varying(50), "three_ds_redirect_url" character varying(1024), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."webhook_events_status_enum" AS ENUM('pending', 'processed', 'failed', 'skipped')`,
    );
    await queryRunner.query(
      `CREATE TABLE "webhook_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "gateway" character varying(50) NOT NULL, "event_type" character varying(100) NOT NULL, "event_id" character varying(255) NOT NULL, "payload" jsonb NOT NULL, "status" "public"."webhook_events_status_enum" NOT NULL DEFAULT 'pending', "processed_at" TIMESTAMP WITH TIME ZONE, "error_message" text, "attempts" smallint NOT NULL DEFAULT '0', "last_attempt_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_a1c947fff2f3407ed722a947855" UNIQUE ("gateway", "event_id"), CONSTRAINT "PK_4cba37e6a0acb5e1fc49c34ebfd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tax_rates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "rate" numeric(5,2) NOT NULL, "country_code" character(2) NOT NULL DEFAULT 'AE', "emirate" character varying(50), "category_id" uuid, "zone_type" character varying(50), "is_default" boolean NOT NULL DEFAULT false, "effective_from" date NOT NULL, "effective_until" date, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_41164a748f3dafa373c7e508ca2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."commissions_commission_type_enum" AS ENUM('percentage', 'fixed', 'tiered')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."commissions_status_enum" AS ENUM('pending', 'held', 'approved', 'paid', 'disputed', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "commissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "booking_id" uuid, "payout_id" uuid, "commission_type" "public"."commissions_commission_type_enum" NOT NULL, "commission_rate" numeric(8,4) NOT NULL, "item_total" integer NOT NULL, "commission_amount" integer NOT NULL, "tax_on_commission" integer NOT NULL DEFAULT '0', "vendor_earning" integer NOT NULL, "currency" character(3) NOT NULL DEFAULT 'AED', "status" "public"."commissions_status_enum" NOT NULL DEFAULT 'pending', "settle_after" TIMESTAMP WITH TIME ZONE, "approved_at" TIMESTAMP WITH TIME ZONE, "paid_at" TIMESTAMP WITH TIME ZONE, "adjustment_amount" integer NOT NULL DEFAULT '0', "adjustment_reason" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2701379966e2e670bb5ff0ae78e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_payouts_status_enum" AS ENUM('pending', 'processing', 'paid', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vendor_payouts_payout_rail_enum" AS ENUM('manual_bank_transfer', 'stripe_connect')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_payouts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "bank_account_id" uuid NOT NULL, "payout_reference" character varying(50) NOT NULL, "period_start" date NOT NULL, "period_end" date NOT NULL, "gross_amount" integer NOT NULL, "commission_total" integer NOT NULL, "adjustment_total" integer NOT NULL DEFAULT '0', "carrier_cost_total" integer NOT NULL DEFAULT '0', "shipping_contribution_total" integer NOT NULL DEFAULT '0', "net_amount" integer NOT NULL, "currency" character(3) NOT NULL DEFAULT 'AED', "status" "public"."vendor_payouts_status_enum" NOT NULL DEFAULT 'pending', "payout_rail" "public"."vendor_payouts_payout_rail_enum", "gateway_reference" character varying(255), "processed_at" TIMESTAMP WITH TIME ZONE, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_594843b57e27788bacc9d4e459c" UNIQUE ("payout_reference"), CONSTRAINT "PK_e74c8ca05043a7ae7cf20b4f59e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dcddca06ee5d705e0aedb1d09b" ON "vendor_payouts" ("payout_reference") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_payout_adjustments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "amount_fils" integer NOT NULL, "reason" character varying(255) NOT NULL, "source_type" character varying(50) NOT NULL, "source_id" uuid, "settled_payout_id" uuid, "created_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e74cdae4251f0cd4577197d6d85" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fa6be81c82219a4d8fcb87d73c" ON "vendor_payout_adjustments" ("vendor_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "wallet_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "amount" integer NOT NULL, "currency" character(3) NOT NULL DEFAULT 'AED', "balance_before" integer NOT NULL, "balance_after" integer NOT NULL, "transaction_type" character varying(50) NOT NULL, "reference_type" character varying(50), "reference_id" uuid, "description" text, "expires_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payment_method_thresholds" ("provider" character varying(32) NOT NULL, "min_amount_fils" bigint NOT NULL, "max_amount_fils" bigint NOT NULL, "plans" jsonb NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "surcharge_fils" bigint, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_69dd08389057da10722f9d37a3d" PRIMARY KEY ("provider"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "rules_epoch" ("id" smallint NOT NULL, "epoch" bigint NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7b8c46817aac52b651bb43b48a1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "site_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(255) NOT NULL, "value" text NOT NULL, "value_type" character varying(20) NOT NULL, "setting_group" character varying(100), "description" text, "updated_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_e71167433328a5afb90dda43da0" UNIQUE ("key"), CONSTRAINT "PK_e4290e8371a166d7e066d131f6e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_6ff6ede58b63767ee813eb94a9" ON "site_settings" ("key") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor_id" uuid, "actor_role" character varying(50) NOT NULL, "action" character varying(100) NOT NULL, "entity_type" character varying(100) NOT NULL, "entity_id" uuid, "changes" jsonb, "ip_address" character varying(45), "user_agent" character varying(512), "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pages_status_enum" AS ENUM('draft', 'published', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "content" text, "rich_content" jsonb, "status" "public"."pages_status_enum" NOT NULL DEFAULT 'draft', "published_at" TIMESTAMP WITH TIME ZONE, "author_id" uuid, "locale" character varying(10) NOT NULL DEFAULT 'en', "meta_title" character varying(255), "meta_description" character varying(500), "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_fe66ca6a86dc94233e5d7789535" UNIQUE ("slug"), CONSTRAINT "PK_8f21ed625aa34c8391d636b7d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c515459aa43b0485dc3d0c4ab1" ON "pages" ("slug") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "banners" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "subtitle" character varying(500), "image_url" character varying(1024) NOT NULL, "mobile_image_url" character varying(1024), "link_url" character varying(1024), "placement" character varying(100) NOT NULL, "starts_at" TIMESTAMP WITH TIME ZONE, "expires_at" TIMESTAMP WITH TIME ZONE, "is_active" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', "locale" character varying(10), "target_audience" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e9b186b959296fcb940790d31c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "header_navigation_configs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL DEFAULT '1', "status" character varying(20) NOT NULL DEFAULT 'draft', "published_at" TIMESTAMP WITH TIME ZONE, "config" jsonb NOT NULL, "created_by" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_6170d24548d2af157c5589aad6a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."support_tickets_status_enum" AS ENUM('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."support_tickets_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`,
    );
    await queryRunner.query(
      `CREATE TABLE "support_tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticket_number" character varying(30) NOT NULL, "user_id" uuid, "guest_session" character varying(255), "guest_email" character varying(255), "guest_name" character varying(255), "slack_thread_ts" character varying(64), "slack_channel_id" character varying(64), "assigned_to" uuid, "booking_id" uuid, "subject" character varying(255) NOT NULL, "status" "public"."support_tickets_status_enum" NOT NULL DEFAULT 'open', "priority" "public"."support_tickets_priority_enum" NOT NULL DEFAULT 'medium', "category" character varying(100), "resolved_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_27bc711a89a033d5318df5e0201" UNIQUE ("ticket_number"), CONSTRAINT "PK_942e8d8f5df86100471d2324643" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9113dc95d29b23ab6abe8b94d5" ON "support_tickets" ("ticket_number") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_support_tickets_guest_session" ON "support_tickets" ("guest_session") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_support_tickets_slack_thread" ON "support_tickets" ("slack_thread_ts") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "support_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ticket_id" uuid NOT NULL, "sender_id" uuid, "sender_role" character varying(20) NOT NULL, "message" text NOT NULL, "attachment_urls" jsonb NOT NULL DEFAULT '[]', "is_internal" boolean NOT NULL DEFAULT false, "origin" character varying(16) NOT NULL DEFAULT 'app', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2aa37479e71ef29cbf4dba2b1a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "section_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "label" jsonb NOT NULL, "description" text, "icon" character varying(100), "settings_schema" jsonb, "max_per_layout" smallint, "is_active" boolean NOT NULL DEFAULT true, "scope" character varying(20) NOT NULL DEFAULT 'platform', "supports_bidding" boolean NOT NULL DEFAULT false, "default_settings" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ab7aa68c5dd25288eda6ead7695" UNIQUE ("name"), CONSTRAINT "PK_fe2e7e0e1ce4691acce3feba35b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."page_layouts_status_enum" AS ENUM('draft', 'published', 'scheduled', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "page_layouts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying(255) NOT NULL, "vendor_id" uuid, "title" jsonb NOT NULL, "status" "public"."page_layouts_status_enum" NOT NULL DEFAULT 'draft', "published_version_id" uuid, "draft_version_id" uuid, "created_by" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_1d5d5d7605ac6cfa66836304d37" UNIQUE ("slug"), CONSTRAINT "PK_75360f592e7ba64dffd60a31eeb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "layout_versions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "layout_id" uuid NOT NULL, "version_number" integer NOT NULL, "publish_at" TIMESTAMP WITH TIME ZONE, "published_at" TIMESTAMP WITH TIME ZONE, "created_by" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9a54bd4f0c6f474fda68288a9ee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."layout_sections_source_mode_enum" AS ENUM('manual', 'query', 'bidded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "layout_sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version_id" uuid NOT NULL, "section_type_id" uuid NOT NULL, "position" smallint NOT NULL, "enabled" boolean NOT NULL DEFAULT true, "visibility" jsonb NOT NULL DEFAULT '{"mobile":true,"web":true}', "targeting" jsonb, "settings" jsonb NOT NULL DEFAULT '{}', "source_mode" "public"."layout_sections_source_mode_enum" NOT NULL DEFAULT 'manual', "data_source" jsonb, "blocks" jsonb, "bid_config" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4a4593f0b0f0f4f056e8a88588f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."section_bids_status_enum" AS ENUM('pending', 'active', 'won', 'lost', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "section_bids" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "section_id" uuid NOT NULL, "vendor_id" uuid NOT NULL, "bid_amount_fils" integer NOT NULL, "status" "public"."section_bids_status_enum" NOT NULL DEFAULT 'pending', "product_id" uuid, "content" jsonb, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "cancellation_reason" character varying(50), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e3d9e022dd402a2f8bc37126dfb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "section_bid_slots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "section_type_id" uuid NOT NULL, "max_slots" smallint NOT NULL, "min_bid_fils" integer NOT NULL, "billing_model" character varying(20) NOT NULL DEFAULT 'per_day', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9f04dba53f6bc728524152da9fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reels_author_kind_enum" AS ENUM('creator', 'customer', 'house')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reels_status_enum" AS ENUM('draft', 'pending_review', 'approved', 'rejected', 'removed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "video_provider" text NOT NULL DEFAULT 'cloudflare_stream', "video_asset_id" text NOT NULL, "video_playback_url" text NOT NULL, "video_duration_seconds" integer NOT NULL, "video_width" integer NOT NULL, "video_height" integer NOT NULL, "thumbnail_url" text NOT NULL, "caption" text, "author_kind" "public"."reels_author_kind_enum" NOT NULL DEFAULT 'customer', "is_verified_buyer" boolean NOT NULL DEFAULT false, "language_code" text NOT NULL, "is_sponsored_disclosed" boolean NOT NULL DEFAULT false, "status" "public"."reels_status_enum" NOT NULL DEFAULT 'draft', "rejection_reason" text, "risk_score" numeric(5,4), "auto_flags" jsonb NOT NULL DEFAULT '{}'::jsonb, "auto_review_result" text, "moderator_id" uuid, "moderated_at" TIMESTAMP WITH TIME ZONE, "published_at" TIMESTAMP WITH TIME ZONE, "like_count" integer NOT NULL DEFAULT '0', "view_count" integer NOT NULL DEFAULT '0', "save_count" integer NOT NULL DEFAULT '0', "share_count" integer NOT NULL DEFAULT '0', "unique_viewer_count" integer NOT NULL DEFAULT '0', "ranking_score" numeric(12,4) NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_e5ecdc818bad986f1eb0a5d7a2d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_moderation_log_action_enum" AS ENUM('approved', 'rejected', 'removed', 'restored', 'flagged')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_moderation_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reel_id" uuid NOT NULL, "moderator_id" uuid, "action" "public"."reel_moderation_log_action_enum" NOT NULL, "reason" text, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f66144a176678e74e34a0dec80a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_views" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid, "reel_id" uuid NOT NULL, "session_id" uuid, "viewed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "watch_duration_seconds" numeric(6,2) NOT NULL, "completion_percentage" numeric(5,4) NOT NULL, "device_type" text, CONSTRAINT "CHK_5c939747b5304d3a8961c328d7" CHECK ("completion_percentage" BETWEEN 0 AND 1), CONSTRAINT "PK_173bad37447287652b7c88c6757" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_likes" ("reel_id" uuid NOT NULL, "user_id" uuid NOT NULL, "liked_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_231b6c47c9765462d1fbfd7f5a8" PRIMARY KEY ("reel_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_saves" ("user_id" uuid NOT NULL, "reel_id" uuid NOT NULL, "saved_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1376313e00dba04872be7c0e6df" PRIMARY KEY ("user_id", "reel_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_vendor_shortlists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "reel_id" uuid NOT NULL, "saved_by_user_id" uuid NOT NULL, "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_17a1bed6ac60f21e2b989545450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_license_offers_rights_scope_enum" AS ENUM('in_platform', 'off_platform', 'both')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_license_offers_funding_source_enum" AS ENUM('stripe', 'payout_balance')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_license_offers_status_enum" AS ENUM('pending_creator', 'countered', 'completed', 'declined', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_license_offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reel_id" uuid NOT NULL, "vendor_id" uuid NOT NULL, "creator_id" uuid NOT NULL, "amount_fils" bigint NOT NULL, "rights_scope" "public"."reel_license_offers_rights_scope_enum" NOT NULL, "funding_source" "public"."reel_license_offers_funding_source_enum" NOT NULL, "status" "public"."reel_license_offers_status_enum" NOT NULL DEFAULT 'pending_creator', "last_actor" character varying(10) NOT NULL DEFAULT 'vendor', "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "message" text, "completed_at" TIMESTAMP WITH TIME ZONE, "declined_at" TIMESTAMP WITH TIME ZONE, "cancelled_at" TIMESTAMP WITH TIME ZONE, "countered_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_af593a2e13adca92bcbd3d90a55" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_license_offer_events_event_type_enum" AS ENUM('offered', 'countered', 're_offered', 'accepted', 'declined', 'expired', 'cancelled', 'captured', 'released')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_license_offer_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "offer_id" uuid NOT NULL, "actor" character varying(10) NOT NULL, "event_type" "public"."reel_license_offer_events_event_type_enum" NOT NULL, "amount_fils_snapshot" bigint, "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4d713866d5af27ac6b444aea822" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_license_escrow_holds_funding_source_enum" AS ENUM('stripe', 'payout_balance')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_license_escrow_holds_status_enum" AS ENUM('held', 'captured', 'released')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_license_escrow_holds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "offer_id" uuid, "bid_id" uuid, "collab_application_id" uuid, "vendor_id" uuid NOT NULL, "funding_source" "public"."reel_license_escrow_holds_funding_source_enum" NOT NULL, "amount_fils" bigint NOT NULL, "status" "public"."reel_license_escrow_holds_status_enum" NOT NULL DEFAULT 'held', "stripe_payment_intent_id" text, "idempotency_key" text NOT NULL, "settled_payout_id" uuid, "captured_at" TIMESTAMP WITH TIME ZONE, "released_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_43f66f68042374d0a9ef253dd43" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_license_grants_scope_enum" AS ENUM('in_platform', 'off_platform', 'both')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_license_grants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "offer_id" uuid, "bid_id" uuid, "collab_application_id" uuid, "reel_id" uuid NOT NULL, "vendor_id" uuid NOT NULL, "creator_id" uuid NOT NULL, "scope" "public"."reel_license_grants_scope_enum" NOT NULL, "gross_fils" bigint NOT NULL, "platform_fee_fils" bigint NOT NULL, "creator_net_fils" bigint NOT NULL, "fee_rate_snapshot" numeric(5,4) NOT NULL, "wallet_transaction_id" uuid, "terms_snapshot" jsonb NOT NULL DEFAULT '{}'::jsonb, "expires_at" TIMESTAMP WITH TIME ZONE, "revoked_at" TIMESTAMP WITH TIME ZONE, "granted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5d5df66f251e9849032addf2b87" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_license_features_placement_enum" AS ENUM('product', 'storefront')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_license_features" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "grant_id" uuid NOT NULL, "reel_id" uuid NOT NULL, "vendor_id" uuid NOT NULL, "placement" "public"."reel_license_features_placement_enum" NOT NULL, "product_id" uuid, "position" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_33471443906cce2e27d8d3350d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_license_downloads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "grant_id" uuid NOT NULL, "requested_by" uuid NOT NULL, "url_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7ec2602d3cccf2dbd0d28cab0b8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_briefs_rights_scope_enum" AS ENUM('in_platform', 'off_platform', 'both')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_briefs_status_enum" AS ENUM('open', 'awarded', 'fulfilled', 'cancelled', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_briefs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "title" character varying(200) NOT NULL, "brief" text NOT NULL, "rights_scope" "public"."reel_briefs_rights_scope_enum" NOT NULL, "budget_guide_fils" bigint, "target_product_id" uuid, "target_category" character varying(100), "bids_close_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."reel_briefs_status_enum" NOT NULL DEFAULT 'open', "awarded_bid_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_3766836a8a27da4bbeb4072e46c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_brief_bids_status_enum" AS ENUM('pending', 'accepted', 'delivered', 'revision_requested', 'completed', 'rejected', 'withdrawn', 'declined')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_brief_bids" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brief_id" uuid NOT NULL, "creator_id" uuid NOT NULL, "amount_fils" bigint NOT NULL, "pitch" text NOT NULL, "status" "public"."reel_brief_bids_status_enum" NOT NULL DEFAULT 'pending', "delivered_reel_id" uuid, "grant_id" uuid, "delivery_deadline_at" TIMESTAMP WITH TIME ZONE, "delivery_round" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_80b717fa778f66429287ad5eff1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reel_brief_events_event_type_enum" AS ENUM('brief_created', 'bid_placed', 'bid_withdrawn', 'bid_accepted', 'bid_declined', 'delivered', 'revision_requested', 'approved', 'rejected', 'brief_cancelled', 'brief_expired', 'delivery_expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_brief_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brief_id" uuid NOT NULL, "bid_id" uuid, "actor" character varying(10) NOT NULL, "event_type" "public"."reel_brief_events_event_type_enum" NOT NULL, "amount_fils_snapshot" bigint, "note" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9bed1297d4ff53a658e90d7639c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reel_hot_categories" ("category_id" uuid NOT NULL, "language_code" character varying(5) NOT NULL, "country_code" character varying(2) NOT NULL, "reel_count_30d" integer NOT NULL DEFAULT '0', "last_recomputed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_80fef63155f25de439684f0b02b" PRIMARY KEY ("category_id", "language_code", "country_code"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_rhc_last_recomputed" ON "reel_hot_categories" ("last_recomputed_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_follows" ("follower_id" uuid NOT NULL, "followee_id" uuid NOT NULL, "followed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_13a1298be5681a7b698437138e" CHECK ("follower_id" <> "followee_id"), CONSTRAINT "PK_254b7373cfa05319edbd8b8d9a4" PRIMARY KEY ("follower_id", "followee_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_tagging_permissions_scope_enum" AS ENUM('any_product', 'specific_brand', 'specific_vendor', 'specific_products')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_tagging_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "scope" "public"."user_tagging_permissions_scope_enum" NOT NULL, "brand_id" uuid, "vendor_id" uuid, "product_ids" uuid array, "granted_by" uuid NOT NULL, "granted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE, "reason" text, CONSTRAINT "PK_000c0abec4603d2b76ce5dba8c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."collab_applications_status_enum" AS ENUM('invited', 'applied', 'accepted', 'declined', 'withdrawn', 'in_progress', 'delivered', 'revision_requested', 'completed', 'rejected', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "collab_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "opportunity_id" uuid NOT NULL, "creator_id" uuid NOT NULL, "status" "public"."collab_applications_status_enum" NOT NULL, "pitch" text, "invite_note" text, "proposed_fee_fils" bigint, "agreed_fee_fils" bigint, "delivered_reel_id" uuid, "shipping_address_id" uuid, "carrier" character varying(100), "tracking_number" character varying(255), "shipped_at" TIMESTAMP WITH TIME ZONE, "received_at" TIMESTAMP WITH TIME ZONE, "deliver_by" TIMESTAMP WITH TIME ZONE, "revision_count" integer NOT NULL DEFAULT '0', "responded_at" TIMESTAMP WITH TIME ZONE, "accepted_at" TIMESTAMP WITH TIME ZONE, "delivered_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0899694a1d3006823883f7d2406" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."collab_events_event_type_enum" AS ENUM('created', 'published', 'invited', 'applied', 'withdrawn', 'accepted', 'declined', 'shipped', 'received', 'delivered', 'revision_requested', 'approved', 'rejected', 'settled', 'cancelled', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "collab_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "opportunity_id" uuid NOT NULL, "application_id" uuid, "actor" character varying(10) NOT NULL, "actor_user_id" uuid, "event_type" "public"."collab_events_event_type_enum" NOT NULL, "amount_fils_snapshot" bigint, "note" text, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_da2c98d7dfb1f88923be40ba908" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."collab_opportunities_type_enum" AS ENUM('product_seeding', 'paid_campaign', 'event_appearance')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."collab_opportunities_visibility_enum" AS ENUM('board', 'direct')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."collab_opportunities_status_enum" AS ENUM('draft', 'open', 'filled', 'completed', 'cancelled', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."collab_opportunities_required_platforms_enum" AS ENUM('instagram', 'tiktok', 'youtube', 'internal_reel')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."collab_opportunities_rights_scope_enum" AS ENUM('in_platform', 'off_platform', 'both')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."collab_opportunities_funding_source_enum" AS ENUM('stripe', 'payout_balance')`,
    );
    await queryRunner.query(
      `CREATE TABLE "collab_opportunities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "type" "public"."collab_opportunities_type_enum" NOT NULL, "visibility" "public"."collab_opportunities_visibility_enum" NOT NULL, "status" "public"."collab_opportunities_status_enum" NOT NULL DEFAULT 'draft', "title" character varying(200) NOT NULL, "description" text NOT NULL, "deliverables" jsonb, "slots_total" integer NOT NULL DEFAULT '1', "slots_filled" integer NOT NULL DEFAULT '0', "applications_close_at" TIMESTAMP WITH TIME ZONE, "deliver_by" TIMESTAMP WITH TIME ZONE, "min_follower_count" integer, "required_platforms" "public"."collab_opportunities_required_platforms_enum" array, "required_categories" character varying(100) array, "rights_scope" "public"."collab_opportunities_rights_scope_enum", "fee_fils" bigint, "funding_source" "public"."collab_opportunities_funding_source_enum", "seeded_product_id" uuid, "seeded_variant_id" uuid, "seeded_qty" integer, "seeding_value_fils" bigint, "location_id" uuid, "starts_at" TIMESTAMP WITH TIME ZONE, "ends_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0c4afd926e58b0e505ecf8c95e5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "creator_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "status" character varying(12) NOT NULL DEFAULT 'pending', "display_name" character varying(120) NOT NULL, "bio" text NOT NULL, "primary_category" character varying(100) NOT NULL, "social_links" jsonb NOT NULL DEFAULT '{}', "follower_estimate" integer, "sample_urls" jsonb, "motivation" text, "agreed_to_terms_at" TIMESTAMP WITH TIME ZONE NOT NULL, "reviewed_by" uuid, "review_notes" text, "submitted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reviewed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_d1b7eb7218323d0fd1de08c70c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_creator_app_user" ON "creator_applications" ("user_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_creator_app_status_submitted" ON "creator_applications" ("status", "submitted_at") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_creator_app_open_per_user" ON "creator_applications" ("user_id") WHERE deleted_at IS NULL AND status IN ('pending','needs_info')`,
    );
    await queryRunner.query(
      `CREATE TABLE "creator_media_kits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "headline" character varying(120), "pull_quote" character varying(160), "about" text, "location_label" character varying(120), "stats" jsonb NOT NULL DEFAULT '[]'::jsonb, "content_types" jsonb NOT NULL DEFAULT '[]'::jsonb, "audience" jsonb NOT NULL DEFAULT '[]'::jsonb, "top_locations" jsonb NOT NULL DEFAULT '[]'::jsonb, "collaboration_note" text, "is_published" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_b6ef31572e9fe6fc9eaab217df8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_media_kit_per_user" ON "creator_media_kits" ("user_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "creator_portfolio_videos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "kind" character varying(10) NOT NULL, "video_url" text NOT NULL, "content_type" character varying(50) NOT NULL, "caption" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c46b318c4a94444a96ab0c12031" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_portfolio_user_kind" ON "creator_portfolio_videos" ("user_id", "kind", "created_at") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_portfolio_intro_per_user" ON "creator_portfolio_videos" ("user_id") WHERE kind = 'intro' AND deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "daily_reel_metrics" ("reel_id" uuid NOT NULL, "bucket_date" date NOT NULL, "impressions" integer NOT NULL DEFAULT '0', "unique_viewers" integer NOT NULL DEFAULT '0', "likes" integer NOT NULL DEFAULT '0', "saves" integer NOT NULL DEFAULT '0', "shares" integer NOT NULL DEFAULT '0', "product_taps" integer NOT NULL DEFAULT '0', "attributed_orders" integer NOT NULL DEFAULT '0', "attributed_gmv_fils" bigint NOT NULL DEFAULT '0', "earned_commission_fils" bigint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_238e4b0943d4632a60a33615929" PRIMARY KEY ("reel_id", "bucket_date"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "daily_creator_metrics" ("creator_id" uuid NOT NULL, "bucket_date" date NOT NULL, "reel_count" integer NOT NULL DEFAULT '0', "impressions" integer NOT NULL DEFAULT '0', "unique_viewers" integer NOT NULL DEFAULT '0', "engagement_events" integer NOT NULL DEFAULT '0', "attributed_orders" integer NOT NULL DEFAULT '0', "attributed_gmv_fils" bigint NOT NULL DEFAULT '0', "earned_commission_fils" bigint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_46df094a5f7a4583199a1a3e16b" PRIMARY KEY ("creator_id", "bucket_date"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "daily_vendor_reel_metrics" ("vendor_id" uuid NOT NULL, "bucket_date" date NOT NULL, "reel_count" integer NOT NULL DEFAULT '0', "impressions" integer NOT NULL DEFAULT '0', "product_taps" integer NOT NULL DEFAULT '0', "attributed_orders" integer NOT NULL DEFAULT '0', "attributed_gmv_fils" bigint NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_551b3c664832fc7eb82e2cbed81" PRIMARY KEY ("vendor_id", "bucket_date"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_offerings_location_mode_enum" AS ENUM('at_premises', 'home_visit', 'either')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_offerings_payment_mode_enum" AS ENUM('prepay', 'deposit', 'pay_at_venue')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_offerings_deposit_type_enum" AS ENUM('percent', 'fixed', 'none')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_offerings_cancellation_refund_policy_enum" AS ENUM('full', 'deposit_forfeit', 'percent')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_offerings_status_enum" AS ENUM('draft', 'pending_review', 'published', 'rejected', 'paused', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_offerings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "category_id" uuid, "slug" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "media_urls" jsonb NOT NULL DEFAULT '[]', "duration_minutes" integer NOT NULL, "buffer_before_minutes" integer NOT NULL DEFAULT '0', "buffer_after_minutes" integer NOT NULL DEFAULT '0', "slot_step_minutes" integer NOT NULL DEFAULT '15', "location_mode" "public"."service_offerings_location_mode_enum" NOT NULL DEFAULT 'at_premises', "payment_mode" "public"."service_offerings_payment_mode_enum" NOT NULL DEFAULT 'pay_at_venue', "price_fils" integer NOT NULL, "deposit_type" "public"."service_offerings_deposit_type_enum" NOT NULL DEFAULT 'none', "deposit_value" integer NOT NULL DEFAULT '0', "vat_rate" numeric(5,2) NOT NULL DEFAULT '5', "min_notice_minutes" integer NOT NULL DEFAULT '0', "max_advance_days" integer NOT NULL DEFAULT '60', "cancellation_window_hours" integer NOT NULL DEFAULT '24', "cancellation_refund_policy" "public"."service_offerings_cancellation_refund_policy_enum" NOT NULL DEFAULT 'full', "cancellation_penalty_percent" integer NOT NULL DEFAULT '100', "reschedule_window_hours" integer NOT NULL DEFAULT '24', "status" "public"."service_offerings_status_enum" NOT NULL DEFAULT 'draft', "rejection_reason" text, "reviewed_at" TIMESTAMP WITH TIME ZONE, "reviewed_by" uuid, "auto_approve" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9b854841d82dd234996e82399e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_service_offerings_vendor" ON "service_offerings" ("vendor_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_service_offerings_slug" ON "service_offerings" ("slug") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_offering_translations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "offering_id" uuid NOT NULL, "locale" character varying(8) NOT NULL, "name" character varying(255) NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_9e8bdf79083ee58ccaa4baea4fd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_869efdbc1f6f127dc5d937aa94" ON "service_offering_translations" ("offering_id", "locale") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "vendor_locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "address" jsonb, "lat" numeric(10,7), "lng" numeric(10,7), "area_id" uuid, "timezone" character varying(64) NOT NULL DEFAULT 'Asia/Dubai', "is_active" boolean NOT NULL DEFAULT true, "settings" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a88df4684c7bdc6395477cbb5b9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_vendor_locations_vendor" ON "vendor_locations" ("vendor_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_areas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "area_id" uuid NOT NULL, "travel_buffer_minutes" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_cdda4e5b616d5be3c81d15fd756" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_290a02e213c0bd23eed7a5f64c" ON "service_areas" ("vendor_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_02fc86ab519b512d8a72537fb4" ON "service_areas" ("vendor_id", "area_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_id" uuid NOT NULL, "user_id" uuid, "name" character varying(255) NOT NULL, "avatar_url" text, "bio" text, "is_active" boolean NOT NULL DEFAULT true, "rating" numeric(3,2) NOT NULL DEFAULT '0', "rating_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_cdad75efe024402db5d51140960" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_staff_members_vendor" ON "staff_members" ("vendor_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_member_id" uuid NOT NULL, "vendor_location_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c70ad9e536ca9b66d55cf06bbf3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_04c2c8e0c2da5134632ceb879e" ON "staff_locations" ("staff_member_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c48600ad5bb1b0563b3eafb505" ON "staff_locations" ("staff_member_id", "vendor_location_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_member_id" uuid NOT NULL, "service_offering_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_960130c8a280d6ae93ec9d04d12" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e2d0bf285df3f6ba4f64645fb6" ON "staff_services" ("staff_member_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0c9d354807a0ee3d3d5dee7da9" ON "staff_services" ("staff_member_id", "service_offering_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_working_hours" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_member_id" uuid NOT NULL, "location_id" uuid, "day_of_week" smallint NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "effective_from" date, "effective_to" date, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_acc867c54e3188dc531b9652e38" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_swh_staff" ON "staff_working_hours" ("staff_member_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_time_off" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_member_id" uuid NOT NULL, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "reason" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2df06dc460d60f303911971047d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ca66363cd73f803553ee51753" ON "staff_time_off" ("staff_member_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "location_memberships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "vendor_location_id" uuid NOT NULL, "user_id" uuid NOT NULL, "role" character varying(32) NOT NULL, "permissions" jsonb NOT NULL DEFAULT '[]', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_993c2c93b7986f69793f1be11da" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_92e6f022dc4b3bb777b1099551" ON "location_memberships" ("vendor_location_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ec0996d19d8553571f5b53e4fb" ON "location_memberships" ("vendor_location_id", "user_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."staff_engagements_status_enum" AS ENUM('held', 'confirmed', 'released', 'cancelled', 'conflicted')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."staff_engagements_kind_enum" AS ENUM('marketplace_booking', 'walk_in', 'phone', 'external_import', 'manual_block', 'break')`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        "mypickuae",
        "public",
        "staff_engagements",
        "GENERATED_COLUMN",
        "slot_range",
        'tstzrange("starts_at", "ends_at", \'[)\')',
      ],
    );
    await queryRunner.query(
      `CREATE TABLE "staff_engagements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_member_id" uuid NOT NULL, "vendor_id" uuid NOT NULL, "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "slot_range" tstzrange GENERATED ALWAYS AS (tstzrange("starts_at", "ends_at", '[)')) STORED NOT NULL, "status" "public"."staff_engagements_status_enum" NOT NULL DEFAULT 'held', "kind" "public"."staff_engagements_kind_enum" NOT NULL, "external_source" character varying(128), "external_ref" character varying(255), "created_by" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_577c78a3e1ac6cb4fa2261c89e0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_engagement_vendor_start" ON "staff_engagements" ("vendor_id", "starts_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_engagement_staff_start" ON "staff_engagements" ("staff_member_id", "starts_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "staff_calendar_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "staff_member_id" uuid NOT NULL, "vendor_id" uuid NOT NULL, "ical_url" text NOT NULL, "last_synced_at" TIMESTAMP WITH TIME ZONE, "last_sync_error" character varying(500), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_33bc2476b9052dde7cef9a4ede5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cf30fc4318d98616d9547279c6" ON "staff_calendar_subscriptions" ("staff_member_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bookings_deposit_type_enum" AS ENUM('percent', 'fixed', 'none')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bookings_cancellation_refund_policy_enum" AS ENUM('full', 'deposit_forfeit', 'percent')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."commission_type" AS ENUM('percentage', 'fixed', 'tiered')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bookings_status_enum" AS ENUM('pending_payment', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no_show', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bookings_payment_mode_enum" AS ENUM('prepay', 'deposit', 'pay_at_venue')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_number" character varying(30) NOT NULL, "customer_user_id" uuid, "vendor_id" uuid NOT NULL, "location_id" uuid, "customer_address" jsonb, "customer_name" character varying(255), "customer_phone" character varying(32), "staff_member_id" uuid NOT NULL, "engagement_id" uuid NOT NULL, "service_offering_id" uuid, "service_name" character varying(255) NOT NULL, "duration_minutes" integer NOT NULL, "price_fils" integer NOT NULL, "vat_fils" integer NOT NULL DEFAULT '0', "deposit_fils" integer NOT NULL DEFAULT '0', "deposit_type" "public"."bookings_deposit_type_enum" NOT NULL DEFAULT 'none', "cancellation_window_hours" integer NOT NULL, "cancellation_refund_policy" "public"."bookings_cancellation_refund_policy_enum" NOT NULL DEFAULT 'full', "cancellation_penalty_percent" integer NOT NULL DEFAULT '100', "reschedule_window_hours" integer NOT NULL, "commission_rate" numeric(8,4) NOT NULL, "commission_fils" integer NOT NULL DEFAULT '0', "commission_type" "public"."commission_type" NOT NULL DEFAULT 'percentage', "starts_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ends_at" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending_payment', "source" character varying(32) NOT NULL DEFAULT 'marketplace', "payment_mode" "public"."bookings_payment_mode_enum" NOT NULL, "amount_paid_fils" integer NOT NULL DEFAULT '0', "balance_due_fils" integer NOT NULL DEFAULT '0', "paid_at_venue" boolean NOT NULL DEFAULT false, "payment_id" uuid, "escrow_hold_id" uuid, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_bookings_number" ON "bookings" ("booking_number") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_customer" ON "bookings" ("customer_user_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_bookings_engagement" ON "bookings" ("engagement_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_status" ON "bookings" ("status") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_staff_starts" ON "bookings" ("staff_member_id", "starts_at") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_bookings_vendor_starts" ON "bookings" ("vendor_id", "starts_at") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE TABLE "booking_status_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_id" uuid NOT NULL, "from_status" character varying(50), "to_status" character varying(50) NOT NULL, "actor_id" uuid, "actor_role" character varying(50), "reason" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_589851c586ac15a59462092c0cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a5c5d9b022065f6b1b64609599" ON "booking_status_history" ("booking_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_reviews_status_enum" AS ENUM('pending', 'approved', 'rejected', 'flagged')`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "booking_id" uuid NOT NULL, "customer_user_id" uuid NOT NULL, "vendor_id" uuid NOT NULL, "staff_member_id" uuid NOT NULL, "rating" smallint NOT NULL, "title" character varying(255), "body" text, "media_urls" jsonb NOT NULL DEFAULT '[]', "status" "public"."service_reviews_status_enum" NOT NULL DEFAULT 'pending', "vendor_reply" text, "is_verified" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_c40dc1be7bcb7704ee29fef3c10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b3ffb85fde94b06879e2d79980" ON "service_reviews" ("booking_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_service_reviews_staff" ON "service_reviews" ("staff_member_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_service_reviews_vendor" ON "service_reviews" ("vendor_id") WHERE deleted_at IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_addresses" ADD CONSTRAINT "FK_7a5100ce0548ef27a6f1533a5ce" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_verified_phones" ADD CONSTRAINT "FK_94143735b8eb744a002a1d42d25" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tokens" ADD CONSTRAINT "FK_9e144a67be49e5bba91195ef5de" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_two_factor" ADD CONSTRAINT "FK_0e865d85e0ad6329b40523afe55" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_64c90edc7310c6be7c10c96f675" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "newsletter_subscribers" ADD CONSTRAINT "FK_dcd5c5b83f0fba1ccef75e09a4c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "guest_sessions" ADD CONSTRAINT "FK_ca25eb82ca26487173e561cebba" FOREIGN KEY ("merged_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_searches" ADD CONSTRAINT "FK_8f01d13ac8e7b451d244674274f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recent_searches" ADD CONSTRAINT "FK_40e066371156ac8b5fed746b439" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_documents" ADD CONSTRAINT "FK_218ad2aece37d1c3bf7cfe6c72f" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_documents" ADD CONSTRAINT "FK_0a0e3fccb9f2d9977aad9b3956a" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bank_accounts" ADD CONSTRAINT "FK_94e674d49212d992777ba20b8fb" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_translations" ADD CONSTRAINT "FK_be516cd138f3a6318fb7b17dddb" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_followers" ADD CONSTRAINT "FK_0cf0b8f1c9b56d5458996369198" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_followers" ADD CONSTRAINT "FK_9fd05625f8610fd308f072cba22" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_holidays" ADD CONSTRAINT "FK_9a0d0070ae44e30a9566d401c57" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_integrations" ADD CONSTRAINT "FK_b567dfcc0aacfd7e1cc6429d1ae" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_integration_mappings" ADD CONSTRAINT "FK_2727b00bff7fdd22056a83c7129" FOREIGN KEY ("integration_id") REFERENCES "vendor_integrations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_members" ADD CONSTRAINT "FK_d0d3b6ba9896e44104938d7c705" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_members" ADD CONSTRAINT "FK_63045f9c571e25f19f3b4256e38" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_78f1c9690ce4f4fa12167b1b1c2" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_translations" ADD CONSTRAINT "FK_87902f79e775e1c1b0082201d7e" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_427785468fb7d2733f59e7d7d39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_rates" ADD CONSTRAINT "FK_b2288e39ae19a91ce29f55f8344" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "commissions" ADD CONSTRAINT "FK_6e9671436739516dc8c3d2c332a" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "commissions" ADD CONSTRAINT "FK_849033557800214c533304fd647" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "commissions" ADD CONSTRAINT "FK_eec7f0191c45412ada72b72c574" FOREIGN KEY ("payout_id") REFERENCES "vendor_payouts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_payouts" ADD CONSTRAINT "FK_7848ea6f2544c6edc74b625a0ce" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_payouts" ADD CONSTRAINT "FK_742f29d7085689dc88d9e273a78" FOREIGN KEY ("bank_account_id") REFERENCES "vendor_bank_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_payout_adjustments" ADD CONSTRAINT "FK_fa6be81c82219a4d8fcb87d73c5" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_payout_adjustments" ADD CONSTRAINT "FK_3c45a2c7ea4f952c3a88499d057" FOREIGN KEY ("settled_payout_id") REFERENCES "vendor_payouts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_4796762c619893704abbc3dce65" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD CONSTRAINT "FK_f4f6d58d0d931610e228b25fef7" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pages" ADD CONSTRAINT "FK_4cfa4caf7f1c553220d70987fb2" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_tickets" ADD CONSTRAINT "FK_0b1eb4f1f984aab3c481c48468a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_tickets" ADD CONSTRAINT "FK_1497d97a1193ff937dea51ac1ea" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_messages" ADD CONSTRAINT "FK_d5e0c744062d01ccda719d7ef17" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_messages" ADD CONSTRAINT "FK_db9f9d46849e30b9ac570db6eb6" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_layouts" ADD CONSTRAINT "FK_09512aca377c10da97ed5744932" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_layouts" ADD CONSTRAINT "FK_b0751ae076487c62e91580cbe24" FOREIGN KEY ("published_version_id") REFERENCES "layout_versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_layouts" ADD CONSTRAINT "FK_c3771b0eb04b91f210227935890" FOREIGN KEY ("draft_version_id") REFERENCES "layout_versions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "layout_versions" ADD CONSTRAINT "FK_426947546ad0c048d0a1baa12bb" FOREIGN KEY ("layout_id") REFERENCES "page_layouts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "layout_sections" ADD CONSTRAINT "FK_0b9e9c68f375a10323bec888bca" FOREIGN KEY ("version_id") REFERENCES "layout_versions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "layout_sections" ADD CONSTRAINT "FK_7a0387998b4802f910da1c004a0" FOREIGN KEY ("section_type_id") REFERENCES "section_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "section_bids" ADD CONSTRAINT "FK_40a5ca1d32f45b17f13e01776e2" FOREIGN KEY ("section_id") REFERENCES "layout_sections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "section_bid_slots" ADD CONSTRAINT "FK_c56378b50ff447826f7299a89c1" FOREIGN KEY ("section_type_id") REFERENCES "section_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reels" ADD CONSTRAINT "FK_1793c12dac83d91ec123d6d2219" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_moderation_log" ADD CONSTRAINT "FK_dadfb3ebbbeee7a37cce60a1dcc" FOREIGN KEY ("reel_id") REFERENCES "reels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_moderation_log" ADD CONSTRAINT "FK_8f733a76b2aafef140e7ef04c3d" FOREIGN KEY ("moderator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_views" ADD CONSTRAINT "FK_633ecd78741a9d2065dfb23be6c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_views" ADD CONSTRAINT "FK_0c17584277474394a5bfb221ea3" FOREIGN KEY ("reel_id") REFERENCES "reels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_likes" ADD CONSTRAINT "FK_843ba14e13d0166f180292c6e3f" FOREIGN KEY ("reel_id") REFERENCES "reels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_likes" ADD CONSTRAINT "FK_55b577b8ea0be63d0725bc23ce5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_saves" ADD CONSTRAINT "FK_22946fc763d7d5a5fe8dce4035c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_saves" ADD CONSTRAINT "FK_bf01b1e39f2f5581ef283ed5826" FOREIGN KEY ("reel_id") REFERENCES "reels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_vendor_shortlists" ADD CONSTRAINT "FK_b3a0a8979102803aea6f598d960" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_vendor_shortlists" ADD CONSTRAINT "FK_ab74c3d8673cab543dae3155625" FOREIGN KEY ("reel_id") REFERENCES "reels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_vendor_shortlists" ADD CONSTRAINT "FK_e1ecd288316f5121ce8e0c21464" FOREIGN KEY ("saved_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_offers" ADD CONSTRAINT "FK_fabbc3a594e6bc3c250919f2ae7" FOREIGN KEY ("reel_id") REFERENCES "reels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_offer_events" ADD CONSTRAINT "FK_0fc3063628b407d18dea4478447" FOREIGN KEY ("offer_id") REFERENCES "reel_license_offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_escrow_holds" ADD CONSTRAINT "FK_37234bc4cba724c3f3c8d3bab7e" FOREIGN KEY ("offer_id") REFERENCES "reel_license_offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_grants" ADD CONSTRAINT "FK_98859265f4e2026a8e89572d9e9" FOREIGN KEY ("offer_id") REFERENCES "reel_license_offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_grants" ADD CONSTRAINT "FK_72c6d57396bf9e283a89acc9b5c" FOREIGN KEY ("reel_id") REFERENCES "reels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_features" ADD CONSTRAINT "FK_5b88e21cb98550ba7501c6b2947" FOREIGN KEY ("grant_id") REFERENCES "reel_license_grants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_downloads" ADD CONSTRAINT "FK_9b354512e86f1916b13bb495684" FOREIGN KEY ("grant_id") REFERENCES "reel_license_grants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_brief_bids" ADD CONSTRAINT "FK_cd360e85531f65d3a5d7a8752b3" FOREIGN KEY ("brief_id") REFERENCES "reel_briefs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_brief_events" ADD CONSTRAINT "FK_cca148f2c7b316d914310906529" FOREIGN KEY ("brief_id") REFERENCES "reel_briefs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_hot_categories" ADD CONSTRAINT "FK_7ae5147213a63616eb020693817" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" ADD CONSTRAINT "FK_f7af3bf8f2dcba61b4adc108239" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" ADD CONSTRAINT "FK_ad9563c49281be94000f50a4308" FOREIGN KEY ("followee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tagging_permissions" ADD CONSTRAINT "FK_957deb65de4d099def8fc8a60cf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "creator_applications" ADD CONSTRAINT "FK_d85268358b352c88dc2c92dd2cc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "creator_media_kits" ADD CONSTRAINT "FK_87a7267fedc325f365a6e9bf544" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "creator_portfolio_videos" ADD CONSTRAINT "FK_6149c26cef5597405d6299c01a2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_offering_translations" ADD CONSTRAINT "FK_b7ac272b46e5815527a691399ee" FOREIGN KEY ("offering_id") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2026_09" PARTITION OF "notifications" FOR VALUES FROM ('2026-09-01T00:00:00.000Z') TO ('2026-10-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2026_10" PARTITION OF "notifications" FOR VALUES FROM ('2026-10-01T00:00:00.000Z') TO ('2026-11-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2026_11" PARTITION OF "notifications" FOR VALUES FROM ('2026-11-01T00:00:00.000Z') TO ('2026-12-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2026_12" PARTITION OF "notifications" FOR VALUES FROM ('2026-12-01T00:00:00.000Z') TO ('2027-01-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2027_01" PARTITION OF "notifications" FOR VALUES FROM ('2027-01-01T00:00:00.000Z') TO ('2027-02-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2027_02" PARTITION OF "notifications" FOR VALUES FROM ('2027-02-01T00:00:00.000Z') TO ('2027-03-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2027_03" PARTITION OF "notifications" FOR VALUES FROM ('2027-03-01T00:00:00.000Z') TO ('2027-04-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2027_04" PARTITION OF "notifications" FOR VALUES FROM ('2027-04-01T00:00:00.000Z') TO ('2027-05-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2027_05" PARTITION OF "notifications" FOR VALUES FROM ('2027-05-01T00:00:00.000Z') TO ('2027-06-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2027_06" PARTITION OF "notifications" FOR VALUES FROM ('2027-06-01T00:00:00.000Z') TO ('2027-07-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2027_07" PARTITION OF "notifications" FOR VALUES FROM ('2027-07-01T00:00:00.000Z') TO ('2027-08-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2027_08" PARTITION OF "notifications" FOR VALUES FROM ('2027-08-01T00:00:00.000Z') TO ('2027-09-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2027_09" PARTITION OF "notifications" FOR VALUES FROM ('2027-09-01T00:00:00.000Z') TO ('2027-10-01T00:00:00.000Z')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "notifications_2027_10" PARTITION OF "notifications" FOR VALUES FROM ('2027-10-01T00:00:00.000Z') TO ('2027-11-01T00:00:00.000Z')`,
    );
    await queryRunner.query(`CREATE OR REPLACE FUNCTION create_next_notification_partition()
      RETURNS void AS $$
      DECLARE
        next_month date := date_trunc('month', now() + interval '1 month');
        partition_name text;
        start_date text;
        end_date text;
      BEGIN
        partition_name := 'notifications_' || to_char(next_month, 'YYYY_MM');
        start_date := to_char(next_month, 'YYYY-MM-DD');
        end_date := to_char(next_month + interval '1 month', 'YYYY-MM-DD');
        EXECUTE format(
          'CREATE TABLE IF NOT EXISTS %I PARTITION OF notifications FOR VALUES FROM (%L) TO (%L)',
          partition_name, start_date, end_date
        );
      END;
      $$ LANGUAGE plpgsql`);
    await queryRunner.query(`CREATE OR REPLACE FUNCTION drop_old_notification_partitions()
      RETURNS void AS $$
      DECLARE
        cutoff date := date_trunc('month', now() - interval '6 months');
        r record;
      BEGIN
        FOR r IN
          SELECT inhrelid::regclass::text AS partition_name
          FROM pg_inherits
          WHERE inhparent = 'notifications'::regclass
        LOOP
          IF r.partition_name ~ 'notifications_[0-9]{4}_[0-9]{2}' THEN
            DECLARE
              partition_date date;
            BEGIN
              partition_date := to_date(
                substring(r.partition_name from 'notifications_([0-9]{4}_[0-9]{2})'),
                'YYYY_MM'
              );
              IF partition_date < cutoff THEN
                EXECUTE format('DROP TABLE IF EXISTS %I', r.partition_name);
              END IF;
            END;
          END IF;
        END LOOP;
      END;
      $$ LANGUAGE plpgsql`);
    await queryRunner.query("CREATE EXTENSION IF NOT EXISTS btree_gist");
    await queryRunner.query(`ALTER TABLE "staff_engagements" ADD CONSTRAINT "no_double_book"
        EXCLUDE USING gist (staff_member_id WITH =, slot_range WITH &&)
        WHERE (status IN ('held','confirmed'))`);
    await queryRunner.query(`CREATE OR REPLACE FUNCTION trg_reel_likes_count() RETURNS trigger AS $$
      BEGIN
        IF (TG_OP = 'INSERT') THEN
          UPDATE reels SET like_count = like_count + 1 WHERE id = NEW.reel_id;
        ELSIF (TG_OP = 'DELETE') THEN
          UPDATE reels SET like_count = greatest(like_count - 1, 0) WHERE id = OLD.reel_id;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql`);
    await queryRunner.query(
      `CREATE TRIGGER reel_likes_count_trigger AFTER INSERT OR DELETE ON "reel_likes" FOR EACH ROW EXECUTE FUNCTION trg_reel_likes_count()`,
    );
    await queryRunner.query(`CREATE OR REPLACE FUNCTION trg_reel_saves_count() RETURNS trigger AS $$
      BEGIN
        IF (TG_OP = 'INSERT') THEN
          UPDATE reels SET save_count = save_count + 1 WHERE id = NEW.reel_id;
        ELSIF (TG_OP = 'DELETE') THEN
          UPDATE reels SET save_count = greatest(save_count - 1, 0) WHERE id = OLD.reel_id;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql`);
    await queryRunner.query(
      `CREATE TRIGGER reel_saves_count_trigger AFTER INSERT OR DELETE ON "reel_saves" FOR EACH ROW EXECUTE FUNCTION trg_reel_saves_count()`,
    );
    await queryRunner.query(`CREATE OR REPLACE FUNCTION trg_reel_published_count() RETURNS trigger AS $$
      BEGIN
        IF (TG_OP = 'UPDATE' AND OLD.status <> 'approved' AND NEW.status = 'approved') THEN
          UPDATE users SET published_reel_count = published_reel_count + 1 WHERE id = NEW.user_id;
        ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status <> 'approved') THEN
          UPDATE users SET published_reel_count = greatest(published_reel_count - 1, 0) WHERE id = NEW.user_id;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql`);
    await queryRunner.query(
      `CREATE TRIGGER reel_published_count_trigger AFTER UPDATE OF status ON "reels" FOR EACH ROW EXECUTE FUNCTION trg_reel_published_count()`,
    );
    await queryRunner.query(`CREATE OR REPLACE FUNCTION trg_user_follows_count() RETURNS trigger AS $$
      BEGIN
        IF (TG_OP = 'INSERT') THEN
          UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.followee_id;
          UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        ELSIF (TG_OP = 'DELETE') THEN
          UPDATE users SET follower_count = greatest(follower_count - 1, 0) WHERE id = OLD.followee_id;
          UPDATE users SET following_count = greatest(following_count - 1, 0) WHERE id = OLD.follower_id;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql`);
    await queryRunner.query(
      `CREATE TRIGGER user_follows_count_trigger AFTER INSERT OR DELETE ON "user_follows" FOR EACH ROW EXECUTE FUNCTION trg_user_follows_count()`,
    );
    await queryRunner.query(`CREATE OR REPLACE FUNCTION trg_auto_graduate_creator() RETURNS trigger AS $$
      DECLARE
        threshold_followers int;
        threshold_reels int;
      BEGIN
        IF NEW.creator_tier = 'regular' THEN
          SELECT (value::int) INTO threshold_followers FROM site_settings WHERE key = 'reels_graduation_follower_count' AND deleted_at IS NULL;
          SELECT (value::int) INTO threshold_reels FROM site_settings WHERE key = 'reels_graduation_approved_reel_count' AND deleted_at IS NULL;
          threshold_followers := COALESCE(threshold_followers, 500);
          threshold_reels := COALESCE(threshold_reels, 5);
          IF NEW.follower_count >= threshold_followers OR NEW.published_reel_count >= threshold_reels THEN
            NEW.creator_tier := 'creator';
            NEW.creator_tier_earned_at := now();
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql`);
    await queryRunner.query(
      `CREATE TRIGGER user_auto_graduate_trigger BEFORE UPDATE OF follower_count, published_reel_count ON "users" FOR EACH ROW EXECUTE FUNCTION trg_auto_graduate_creator()`,
    );
    await queryRunner.query(`CREATE OR REPLACE FUNCTION bump_rules_epoch() RETURNS trigger
        LANGUAGE plpgsql AS $$
      BEGIN
        UPDATE rules_epoch SET epoch = epoch + 1, updated_at = now() WHERE id = 1;
        RETURN COALESCE(NEW, OLD);
      END;
      $$`);
    await queryRunner.query(
      "CREATE TRIGGER trg_bump_rules_epoch_thresholds AFTER INSERT OR UPDATE OR DELETE ON payment_method_thresholds FOR EACH ROW EXECUTE FUNCTION bump_rules_epoch()",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DROP TRIGGER IF EXISTS trg_bump_rules_epoch_thresholds ON payment_method_thresholds",
    );
    await queryRunner.query("DROP FUNCTION IF EXISTS bump_rules_epoch()");
    await queryRunner.query(`DROP TRIGGER IF EXISTS user_auto_graduate_trigger ON "users"`);
    await queryRunner.query("DROP FUNCTION IF EXISTS trg_auto_graduate_creator()");
    await queryRunner.query(`DROP TRIGGER IF EXISTS user_follows_count_trigger ON "user_follows"`);
    await queryRunner.query("DROP FUNCTION IF EXISTS trg_user_follows_count()");
    await queryRunner.query(`DROP TRIGGER IF EXISTS reel_published_count_trigger ON "reels"`);
    await queryRunner.query("DROP FUNCTION IF EXISTS trg_reel_published_count()");
    await queryRunner.query(`DROP TRIGGER IF EXISTS reel_saves_count_trigger ON "reel_saves"`);
    await queryRunner.query("DROP FUNCTION IF EXISTS trg_reel_saves_count()");
    await queryRunner.query(`DROP TRIGGER IF EXISTS reel_likes_count_trigger ON "reel_likes"`);
    await queryRunner.query("DROP FUNCTION IF EXISTS trg_reel_likes_count()");
    await queryRunner.query(
      `ALTER TABLE "staff_engagements" DROP CONSTRAINT IF EXISTS "no_double_book"`,
    );
    await queryRunner.query("DROP FUNCTION IF EXISTS create_next_notification_partition()");
    await queryRunner.query("DROP FUNCTION IF EXISTS drop_old_notification_partitions()");
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_creator_tier_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b383987bfa6e6a8745085621d0"`);
    await queryRunner.query(`DROP TYPE "public"."user_addresses_type_enum"`);
    await queryRunner.query(`DROP TABLE "user_addresses"`);
    await queryRunner.query(`DROP TABLE "phone_auth_challenges"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_733a1b0ce482d8dad7fdfaf652"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d1c8d069847e5ae1783ef6e7ed"`);
    await queryRunner.query(`DROP TABLE "user_verified_phones"`);
    await queryRunner.query(`DROP INDEX "public"."uq_user_verified_phone"`);
    await queryRunner.query(`DROP TABLE "user_sessions"`);
    await queryRunner.query(`DROP TYPE "public"."user_tokens_type_enum"`);
    await queryRunner.query(`DROP TABLE "user_tokens"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8439498e5cddde50e3b87c5134"`);
    await queryRunner.query(`DROP TABLE "user_two_factor"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_channel_enum"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notification_preferences_notification_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notification_preferences_channel_enum"`);
    await queryRunner.query(`DROP TABLE "notification_preferences"`);
    await queryRunner.query(`DROP TABLE "newsletter_subscribers"`);
    await queryRunner.query(`DROP TABLE "guest_sessions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_156ffe6484249f432cd081eff3"`);
    await queryRunner.query(`DROP TABLE "saved_searches"`);
    await queryRunner.query(`DROP TABLE "recent_searches"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_566b01af8b6063d48a27626679"`);
    await queryRunner.query(`DROP TYPE "public"."vendors_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."vendors_commission_type_enum"`);
    await queryRunner.query(`DROP TABLE "vendors"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_750a10541e8f8048d076bed731"`);
    await queryRunner.query(`DROP TABLE "vendor_ai_usage"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_documents_type_enum"`);
    await queryRunner.query(`DROP TABLE "vendor_documents"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_218ad2aece37d1c3bf7cfe6c72"`);
    await queryRunner.query(`DROP TABLE "vendor_bank_accounts"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_94e674d49212d992777ba20b8f"`);
    await queryRunner.query(`DROP TABLE "vendor_translations"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_be516cd138f3a6318fb7b17ddd"`);
    await queryRunner.query(`DROP TABLE "vendor_followers"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0cf0b8f1c9b56d545899636919"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9fd05625f8610fd308f072cba2"`);
    await queryRunner.query(`DROP TABLE "vendor_holidays"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9a0d0070ae44e30a9566d401c5"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_integrations_inventory_authority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_integrations_pricing_authority_enum"`);
    await queryRunner.query(`DROP TABLE "vendor_integrations"`);
    await queryRunner.query(`DROP INDEX "public"."vendor_integrations_active_uq"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_integration_mappings_event_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_integration_mappings_direction_enum"`);
    await queryRunner.query(`DROP TABLE "vendor_integration_mappings"`);
    await queryRunner.query(`DROP INDEX "public"."vendor_integration_mappings_uq"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_integration_deliveries_event_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_integration_deliveries_direction_enum"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_integration_deliveries_status_enum"`);
    await queryRunner.query(`DROP TABLE "vendor_integration_deliveries"`);
    await queryRunner.query(`DROP INDEX "public"."vid_idempotency_uq"`);
    await queryRunner.query(`DROP INDEX "public"."vid_integration_created_idx"`);
    await queryRunner.query(`DROP TABLE "vendor_integration_pending_writes"`);
    await queryRunner.query(`DROP INDEX "public"."vipw_status_idx"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_members_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_members_status_enum"`);
    await queryRunner.query(`DROP TABLE "vendor_members"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d0d3b6ba9896e44104938d7c70"`);
    await queryRunner.query(`DROP TYPE "public"."role_permissions_role_enum"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_61720ee48ef901a7a228b06b04"`);
    await queryRunner.query(`DROP TABLE "category_translations"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payments_payment_method_enum"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."webhook_events_status_enum"`);
    await queryRunner.query(`DROP TABLE "webhook_events"`);
    await queryRunner.query(`DROP TABLE "tax_rates"`);
    await queryRunner.query(`DROP TYPE "public"."commissions_commission_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."commissions_status_enum"`);
    await queryRunner.query(`DROP TABLE "commissions"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_payouts_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."vendor_payouts_payout_rail_enum"`);
    await queryRunner.query(`DROP TABLE "vendor_payouts"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_dcddca06ee5d705e0aedb1d09b"`);
    await queryRunner.query(`DROP TABLE "vendor_payout_adjustments"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fa6be81c82219a4d8fcb87d73c"`);
    await queryRunner.query(`DROP TABLE "wallet_transactions"`);
    await queryRunner.query(`DROP TABLE "payment_method_thresholds"`);
    await queryRunner.query(`DROP TABLE "rules_epoch"`);
    await queryRunner.query(`DROP TABLE "site_settings"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6ff6ede58b63767ee813eb94a9"`);
    await queryRunner.query(`DROP TABLE "audit_log"`);
    await queryRunner.query(`DROP TYPE "public"."pages_status_enum"`);
    await queryRunner.query(`DROP TABLE "pages"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c515459aa43b0485dc3d0c4ab1"`);
    await queryRunner.query(`DROP TABLE "banners"`);
    await queryRunner.query(`DROP TABLE "header_navigation_configs"`);
    await queryRunner.query(`DROP TYPE "public"."support_tickets_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."support_tickets_priority_enum"`);
    await queryRunner.query(`DROP TABLE "support_tickets"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9113dc95d29b23ab6abe8b94d5"`);
    await queryRunner.query(`DROP INDEX "public"."idx_support_tickets_guest_session"`);
    await queryRunner.query(`DROP INDEX "public"."idx_support_tickets_slack_thread"`);
    await queryRunner.query(`DROP TABLE "support_messages"`);
    await queryRunner.query(`DROP TABLE "section_types"`);
    await queryRunner.query(`DROP TYPE "public"."page_layouts_status_enum"`);
    await queryRunner.query(`DROP TABLE "page_layouts"`);
    await queryRunner.query(`DROP TABLE "layout_versions"`);
    await queryRunner.query(`DROP TYPE "public"."layout_sections_source_mode_enum"`);
    await queryRunner.query(`DROP TABLE "layout_sections"`);
    await queryRunner.query(`DROP TYPE "public"."section_bids_status_enum"`);
    await queryRunner.query(`DROP TABLE "section_bids"`);
    await queryRunner.query(`DROP TABLE "section_bid_slots"`);
    await queryRunner.query(`DROP TYPE "public"."reels_author_kind_enum"`);
    await queryRunner.query(`DROP TYPE "public"."reels_status_enum"`);
    await queryRunner.query(`DROP TABLE "reels"`);
    await queryRunner.query(`DROP TYPE "public"."reel_moderation_log_action_enum"`);
    await queryRunner.query(`DROP TABLE "reel_moderation_log"`);
    await queryRunner.query(`DROP TABLE "reel_views"`);
    await queryRunner.query(`DROP TABLE "reel_likes"`);
    await queryRunner.query(`DROP TABLE "reel_saves"`);
    await queryRunner.query(`DROP TABLE "reel_vendor_shortlists"`);
    await queryRunner.query(`DROP TYPE "public"."reel_license_offers_rights_scope_enum"`);
    await queryRunner.query(`DROP TYPE "public"."reel_license_offers_funding_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."reel_license_offers_status_enum"`);
    await queryRunner.query(`DROP TABLE "reel_license_offers"`);
    await queryRunner.query(`DROP TYPE "public"."reel_license_offer_events_event_type_enum"`);
    await queryRunner.query(`DROP TABLE "reel_license_offer_events"`);
    await queryRunner.query(`DROP TYPE "public"."reel_license_escrow_holds_funding_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."reel_license_escrow_holds_status_enum"`);
    await queryRunner.query(`DROP TABLE "reel_license_escrow_holds"`);
    await queryRunner.query(`DROP TYPE "public"."reel_license_grants_scope_enum"`);
    await queryRunner.query(`DROP TABLE "reel_license_grants"`);
    await queryRunner.query(`DROP TYPE "public"."reel_license_features_placement_enum"`);
    await queryRunner.query(`DROP TABLE "reel_license_features"`);
    await queryRunner.query(`DROP TABLE "reel_license_downloads"`);
    await queryRunner.query(`DROP TYPE "public"."reel_briefs_rights_scope_enum"`);
    await queryRunner.query(`DROP TYPE "public"."reel_briefs_status_enum"`);
    await queryRunner.query(`DROP TABLE "reel_briefs"`);
    await queryRunner.query(`DROP TYPE "public"."reel_brief_bids_status_enum"`);
    await queryRunner.query(`DROP TABLE "reel_brief_bids"`);
    await queryRunner.query(`DROP TYPE "public"."reel_brief_events_event_type_enum"`);
    await queryRunner.query(`DROP TABLE "reel_brief_events"`);
    await queryRunner.query(`DROP TABLE "reel_hot_categories"`);
    await queryRunner.query(`DROP INDEX "public"."idx_rhc_last_recomputed"`);
    await queryRunner.query(`DROP TABLE "user_follows"`);
    await queryRunner.query(`DROP TYPE "public"."user_tagging_permissions_scope_enum"`);
    await queryRunner.query(`DROP TABLE "user_tagging_permissions"`);
    await queryRunner.query(`DROP TYPE "public"."collab_applications_status_enum"`);
    await queryRunner.query(`DROP TABLE "collab_applications"`);
    await queryRunner.query(`DROP TYPE "public"."collab_events_event_type_enum"`);
    await queryRunner.query(`DROP TABLE "collab_events"`);
    await queryRunner.query(`DROP TYPE "public"."collab_opportunities_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."collab_opportunities_visibility_enum"`);
    await queryRunner.query(`DROP TYPE "public"."collab_opportunities_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."collab_opportunities_required_platforms_enum"`);
    await queryRunner.query(`DROP TYPE "public"."collab_opportunities_rights_scope_enum"`);
    await queryRunner.query(`DROP TYPE "public"."collab_opportunities_funding_source_enum"`);
    await queryRunner.query(`DROP TABLE "collab_opportunities"`);
    await queryRunner.query(`DROP TABLE "creator_applications"`);
    await queryRunner.query(`DROP INDEX "public"."idx_creator_app_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_creator_app_status_submitted"`);
    await queryRunner.query(`DROP INDEX "public"."uq_creator_app_open_per_user"`);
    await queryRunner.query(`DROP TABLE "creator_media_kits"`);
    await queryRunner.query(`DROP INDEX "public"."uq_media_kit_per_user"`);
    await queryRunner.query(`DROP TABLE "creator_portfolio_videos"`);
    await queryRunner.query(`DROP INDEX "public"."idx_portfolio_user_kind"`);
    await queryRunner.query(`DROP INDEX "public"."uq_portfolio_intro_per_user"`);
    await queryRunner.query(`DROP TABLE "daily_reel_metrics"`);
    await queryRunner.query(`DROP TABLE "daily_creator_metrics"`);
    await queryRunner.query(`DROP TABLE "daily_vendor_reel_metrics"`);
    await queryRunner.query(`DROP TYPE "public"."service_offerings_location_mode_enum"`);
    await queryRunner.query(`DROP TYPE "public"."service_offerings_payment_mode_enum"`);
    await queryRunner.query(`DROP TYPE "public"."service_offerings_deposit_type_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."service_offerings_cancellation_refund_policy_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."service_offerings_status_enum"`);
    await queryRunner.query(`DROP TABLE "service_offerings"`);
    await queryRunner.query(`DROP INDEX "public"."idx_service_offerings_vendor"`);
    await queryRunner.query(`DROP INDEX "public"."uq_service_offerings_slug"`);
    await queryRunner.query(`DROP TABLE "service_offering_translations"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_869efdbc1f6f127dc5d937aa94"`);
    await queryRunner.query(`DROP TABLE "vendor_locations"`);
    await queryRunner.query(`DROP INDEX "public"."idx_vendor_locations_vendor"`);
    await queryRunner.query(`DROP TABLE "service_areas"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_290a02e213c0bd23eed7a5f64c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_02fc86ab519b512d8a72537fb4"`);
    await queryRunner.query(`DROP TABLE "staff_members"`);
    await queryRunner.query(`DROP INDEX "public"."idx_staff_members_vendor"`);
    await queryRunner.query(`DROP TABLE "staff_locations"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_04c2c8e0c2da5134632ceb879e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c48600ad5bb1b0563b3eafb505"`);
    await queryRunner.query(`DROP TABLE "staff_services"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e2d0bf285df3f6ba4f64645fb6"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0c9d354807a0ee3d3d5dee7da9"`);
    await queryRunner.query(`DROP TABLE "staff_working_hours"`);
    await queryRunner.query(`DROP INDEX "public"."idx_swh_staff"`);
    await queryRunner.query(`DROP TABLE "staff_time_off"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5ca66363cd73f803553ee51753"`);
    await queryRunner.query(`DROP TABLE "location_memberships"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_92e6f022dc4b3bb777b1099551"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ec0996d19d8553571f5b53e4fb"`);
    await queryRunner.query(`DROP TYPE "public"."staff_engagements_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."staff_engagements_kind_enum"`);
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`,
      ["GENERATED_COLUMN", "slot_range", "mypickuae", "public", "staff_engagements"],
    );
    await queryRunner.query(`DROP TABLE "staff_engagements"`);
    await queryRunner.query(`DROP INDEX "public"."idx_engagement_vendor_start"`);
    await queryRunner.query(`DROP INDEX "public"."idx_engagement_staff_start"`);
    await queryRunner.query(`DROP TABLE "staff_calendar_subscriptions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cf30fc4318d98616d9547279c6"`);
    await queryRunner.query(`DROP TYPE "public"."bookings_deposit_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."bookings_cancellation_refund_policy_enum"`);
    await queryRunner.query(`DROP TYPE "public"."commission_type"`);
    await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."bookings_payment_mode_enum"`);
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP INDEX "public"."uq_bookings_number"`);
    await queryRunner.query(`DROP INDEX "public"."idx_bookings_customer"`);
    await queryRunner.query(`DROP INDEX "public"."uq_bookings_engagement"`);
    await queryRunner.query(`DROP INDEX "public"."idx_bookings_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_bookings_staff_starts"`);
    await queryRunner.query(`DROP INDEX "public"."idx_bookings_vendor_starts"`);
    await queryRunner.query(`DROP TABLE "booking_status_history"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a5c5d9b022065f6b1b64609599"`);
    await queryRunner.query(`DROP TYPE "public"."service_reviews_status_enum"`);
    await queryRunner.query(`DROP TABLE "service_reviews"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b3ffb85fde94b06879e2d79980"`);
    await queryRunner.query(`DROP INDEX "public"."idx_service_reviews_staff"`);
    await queryRunner.query(`DROP INDEX "public"."idx_service_reviews_vendor"`);
    await queryRunner.query(
      `ALTER TABLE "user_addresses" DROP CONSTRAINT "FK_7a5100ce0548ef27a6f1533a5ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_verified_phones" DROP CONSTRAINT "FK_94143735b8eb744a002a1d42d25"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_e9658e959c490b0a634dfc54783"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tokens" DROP CONSTRAINT "FK_9e144a67be49e5bba91195ef5de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_two_factor" DROP CONSTRAINT "FK_0e865d85e0ad6329b40523afe55"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_64c90edc7310c6be7c10c96f675"`,
    );
    await queryRunner.query(
      `ALTER TABLE "newsletter_subscribers" DROP CONSTRAINT "FK_dcd5c5b83f0fba1ccef75e09a4c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "guest_sessions" DROP CONSTRAINT "FK_ca25eb82ca26487173e561cebba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_searches" DROP CONSTRAINT "FK_8f01d13ac8e7b451d244674274f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recent_searches" DROP CONSTRAINT "FK_40e066371156ac8b5fed746b439"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_documents" DROP CONSTRAINT "FK_218ad2aece37d1c3bf7cfe6c72f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_documents" DROP CONSTRAINT "FK_0a0e3fccb9f2d9977aad9b3956a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_bank_accounts" DROP CONSTRAINT "FK_94e674d49212d992777ba20b8fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_translations" DROP CONSTRAINT "FK_be516cd138f3a6318fb7b17dddb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_followers" DROP CONSTRAINT "FK_0cf0b8f1c9b56d5458996369198"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_followers" DROP CONSTRAINT "FK_9fd05625f8610fd308f072cba22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_holidays" DROP CONSTRAINT "FK_9a0d0070ae44e30a9566d401c57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_integrations" DROP CONSTRAINT "FK_b567dfcc0aacfd7e1cc6429d1ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_integration_mappings" DROP CONSTRAINT "FK_2727b00bff7fdd22056a83c7129"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_members" DROP CONSTRAINT "FK_d0d3b6ba9896e44104938d7c705"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_members" DROP CONSTRAINT "FK_63045f9c571e25f19f3b4256e38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_78f1c9690ce4f4fa12167b1b1c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "category_translations" DROP CONSTRAINT "FK_87902f79e775e1c1b0082201d7e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_427785468fb7d2733f59e7d7d39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tax_rates" DROP CONSTRAINT "FK_b2288e39ae19a91ce29f55f8344"`,
    );
    await queryRunner.query(
      `ALTER TABLE "commissions" DROP CONSTRAINT "FK_6e9671436739516dc8c3d2c332a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "commissions" DROP CONSTRAINT "FK_849033557800214c533304fd647"`,
    );
    await queryRunner.query(
      `ALTER TABLE "commissions" DROP CONSTRAINT "FK_eec7f0191c45412ada72b72c574"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_payouts" DROP CONSTRAINT "FK_7848ea6f2544c6edc74b625a0ce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_payouts" DROP CONSTRAINT "FK_742f29d7085689dc88d9e273a78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_payout_adjustments" DROP CONSTRAINT "FK_fa6be81c82219a4d8fcb87d73c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vendor_payout_adjustments" DROP CONSTRAINT "FK_3c45a2c7ea4f952c3a88499d057"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_4796762c619893704abbc3dce65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_settings" DROP CONSTRAINT "FK_f4f6d58d0d931610e228b25fef7"`,
    );
    await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "FK_4cfa4caf7f1c553220d70987fb2"`);
    await queryRunner.query(
      `ALTER TABLE "support_tickets" DROP CONSTRAINT "FK_0b1eb4f1f984aab3c481c48468a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_tickets" DROP CONSTRAINT "FK_1497d97a1193ff937dea51ac1ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_messages" DROP CONSTRAINT "FK_d5e0c744062d01ccda719d7ef17"`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_messages" DROP CONSTRAINT "FK_db9f9d46849e30b9ac570db6eb6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_layouts" DROP CONSTRAINT "FK_09512aca377c10da97ed5744932"`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_layouts" DROP CONSTRAINT "FK_b0751ae076487c62e91580cbe24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "page_layouts" DROP CONSTRAINT "FK_c3771b0eb04b91f210227935890"`,
    );
    await queryRunner.query(
      `ALTER TABLE "layout_versions" DROP CONSTRAINT "FK_426947546ad0c048d0a1baa12bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "layout_sections" DROP CONSTRAINT "FK_0b9e9c68f375a10323bec888bca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "layout_sections" DROP CONSTRAINT "FK_7a0387998b4802f910da1c004a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "section_bids" DROP CONSTRAINT "FK_40a5ca1d32f45b17f13e01776e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "section_bid_slots" DROP CONSTRAINT "FK_c56378b50ff447826f7299a89c1"`,
    );
    await queryRunner.query(`ALTER TABLE "reels" DROP CONSTRAINT "FK_1793c12dac83d91ec123d6d2219"`);
    await queryRunner.query(
      `ALTER TABLE "reel_moderation_log" DROP CONSTRAINT "FK_dadfb3ebbbeee7a37cce60a1dcc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_moderation_log" DROP CONSTRAINT "FK_8f733a76b2aafef140e7ef04c3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_views" DROP CONSTRAINT "FK_633ecd78741a9d2065dfb23be6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_views" DROP CONSTRAINT "FK_0c17584277474394a5bfb221ea3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_likes" DROP CONSTRAINT "FK_843ba14e13d0166f180292c6e3f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_likes" DROP CONSTRAINT "FK_55b577b8ea0be63d0725bc23ce5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_saves" DROP CONSTRAINT "FK_22946fc763d7d5a5fe8dce4035c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_saves" DROP CONSTRAINT "FK_bf01b1e39f2f5581ef283ed5826"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_vendor_shortlists" DROP CONSTRAINT "FK_b3a0a8979102803aea6f598d960"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_vendor_shortlists" DROP CONSTRAINT "FK_ab74c3d8673cab543dae3155625"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_vendor_shortlists" DROP CONSTRAINT "FK_e1ecd288316f5121ce8e0c21464"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_offers" DROP CONSTRAINT "FK_fabbc3a594e6bc3c250919f2ae7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_offer_events" DROP CONSTRAINT "FK_0fc3063628b407d18dea4478447"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_escrow_holds" DROP CONSTRAINT "FK_37234bc4cba724c3f3c8d3bab7e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_grants" DROP CONSTRAINT "FK_98859265f4e2026a8e89572d9e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_grants" DROP CONSTRAINT "FK_72c6d57396bf9e283a89acc9b5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_features" DROP CONSTRAINT "FK_5b88e21cb98550ba7501c6b2947"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_license_downloads" DROP CONSTRAINT "FK_9b354512e86f1916b13bb495684"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_brief_bids" DROP CONSTRAINT "FK_cd360e85531f65d3a5d7a8752b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_brief_events" DROP CONSTRAINT "FK_cca148f2c7b316d914310906529"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reel_hot_categories" DROP CONSTRAINT "FK_7ae5147213a63616eb020693817"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" DROP CONSTRAINT "FK_f7af3bf8f2dcba61b4adc108239"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" DROP CONSTRAINT "FK_ad9563c49281be94000f50a4308"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_tagging_permissions" DROP CONSTRAINT "FK_957deb65de4d099def8fc8a60cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "creator_applications" DROP CONSTRAINT "FK_d85268358b352c88dc2c92dd2cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "creator_media_kits" DROP CONSTRAINT "FK_87a7267fedc325f365a6e9bf544"`,
    );
    await queryRunner.query(
      `ALTER TABLE "creator_portfolio_videos" DROP CONSTRAINT "FK_6149c26cef5597405d6299c01a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_offering_translations" DROP CONSTRAINT "FK_b7ac272b46e5815527a691399ee"`,
    );
  }
}
