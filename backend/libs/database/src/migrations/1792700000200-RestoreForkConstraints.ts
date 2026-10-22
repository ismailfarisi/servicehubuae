import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Restores the constraints NoorLuna added by hand in its migrations that the
 * fork's entity-generated InitialSchema lost: foreign keys (incl. the booking
 * domain's ~34), ON DELETE rules on relation FKs, CHECK constraints, composite
 * UNIQUE constraints, partial/unique/expression indexes and a few column
 * defaults. Names and predicates match NoorLuna's, adapted where a column
 * became an enum (no `::text` casts).
 *
 * The entities declare every item too (@ForeignKey / @Check / @Unique /
 * @Index, with `synchronize: false` for the expression and opclass indexes
 * TypeORM cannot express) so schema sync and `migration:generate` agree with
 * the database.
 *
 * Deliberately NOT restored (see the fork schema-diff notes): FKs/CHECKs that
 * involve dropped commerce tables or columns (orders, products, brands, carrier
 * accounts), FKs to `areas` (see 1792700000000-AddAreas), and ON DELETE CASCADE
 * on ledger rows (commissions, vendor_payouts, vendor_payout_adjustments.vendor_id,
 * wallet_transactions): NO ACTION keeps a hard delete of a vendor/user with money
 * history from silently erasing the ledger.
 *
 * Every statement is guarded (IF [NOT] EXISTS / pg_constraint lookups), so the
 * migration is safe to re-run against a partially restored database.
 */

// [table, constraint, column, referenced table, ON DELETE]
const FOREIGN_KEYS: [string, string, string, string, string?][] = [
  ["booking_status_history", "fk_booking_status_history_actor", "actor_id", "users"],
  [
    "booking_status_history",
    "fk_booking_status_history_booking",
    "booking_id",
    "bookings",
    "CASCADE",
  ],
  ["bookings", "fk_bookings_customer", "customer_user_id", "users"],
  ["bookings", "fk_bookings_engagement", "engagement_id", "staff_engagements"],
  ["bookings", "fk_bookings_location", "location_id", "vendor_locations"],
  ["bookings", "fk_bookings_payment", "payment_id", "payments"],
  ["bookings", "fk_bookings_offering", "service_offering_id", "service_offerings"],
  ["bookings", "fk_bookings_staff", "staff_member_id", "staff_members"],
  ["bookings", "fk_bookings_vendor", "vendor_id", "vendors"],
  ["collab_applications", "fk_collab_app_creator", "creator_id", "users", "CASCADE"],
  [
    "collab_applications",
    "fk_collab_app_opportunity",
    "opportunity_id",
    "collab_opportunities",
    "CASCADE",
  ],
  [
    "collab_events",
    "fk_collab_event_application",
    "application_id",
    "collab_applications",
    "CASCADE",
  ],
  [
    "collab_events",
    "fk_collab_event_opportunity",
    "opportunity_id",
    "collab_opportunities",
    "CASCADE",
  ],
  ["collab_opportunities", "fk_collab_opp_vendor", "vendor_id", "vendors", "CASCADE"],
  [
    "daily_creator_metrics",
    "daily_creator_metrics_creator_id_fkey",
    "creator_id",
    "users",
    "CASCADE",
  ],
  ["daily_reel_metrics", "daily_reel_metrics_reel_id_fkey", "reel_id", "reels", "CASCADE"],
  [
    "daily_vendor_reel_metrics",
    "daily_vendor_reel_metrics_vendor_id_fkey",
    "vendor_id",
    "vendors",
    "CASCADE",
  ],
  ["layout_versions", "layout_versions_created_by_fkey", "created_by", "users"],
  ["location_memberships", "fk_lm_user", "user_id", "users"],
  ["location_memberships", "fk_lm_location", "vendor_location_id", "vendor_locations", "CASCADE"],
  ["page_layouts", "page_layouts_created_by_fkey", "created_by", "users"],
  ["payments", "fk_payments_booking", "booking_id", "bookings"],
  [
    "reel_license_escrow_holds",
    "fk_reel_license_escrow_holds_bid",
    "bid_id",
    "reel_brief_bids",
    "CASCADE",
  ],
  [
    "reel_license_escrow_holds",
    "fk_reel_license_escrow_holds_collab_app",
    "collab_application_id",
    "collab_applications",
    "CASCADE",
  ],
  ["reel_license_grants", "fk_reel_license_grants_bid", "bid_id", "reel_brief_bids", "CASCADE"],
  [
    "reel_license_grants",
    "fk_reel_license_grants_collab_app",
    "collab_application_id",
    "collab_applications",
    "CASCADE",
  ],
  ["reel_license_grants", "fk_rlg_creator", "creator_id", "users", "CASCADE"],
  ["reel_license_grants", "fk_rlg_vendor", "vendor_id", "vendors", "CASCADE"],
  ["reel_license_offers", "fk_rlo_creator", "creator_id", "users", "CASCADE"],
  ["reel_license_offers", "fk_rlo_vendor", "vendor_id", "vendors", "CASCADE"],
  ["reel_views", "reel_views_session_id_fkey", "session_id", "guest_sessions", "SET NULL"],
  ["reels", "reels_moderator_id_fkey", "moderator_id", "users"],
  ["section_bids", "section_bids_vendor_id_fkey", "vendor_id", "vendors"],
  ["service_areas", "fk_service_areas_vendor", "vendor_id", "vendors"],
  ["service_offerings", "fk_service_offerings_vendor", "vendor_id", "vendors"],
  ["service_reviews", "fk_service_reviews_booking", "booking_id", "bookings"],
  ["service_reviews", "fk_service_reviews_customer", "customer_user_id", "users"],
  ["service_reviews", "fk_service_reviews_staff", "staff_member_id", "staff_members"],
  ["service_reviews", "fk_service_reviews_vendor", "vendor_id", "vendors"],
  [
    "staff_calendar_subscriptions",
    "fk_calendar_sub_staff",
    "staff_member_id",
    "staff_members",
    "CASCADE",
  ],
  ["staff_calendar_subscriptions", "fk_calendar_sub_vendor", "vendor_id", "vendors"],
  ["staff_engagements", "fk_engagement_staff", "staff_member_id", "staff_members", "CASCADE"],
  ["staff_engagements", "fk_engagement_vendor", "vendor_id", "vendors"],
  ["staff_locations", "fk_staff_locations_staff", "staff_member_id", "staff_members", "CASCADE"],
  [
    "staff_locations",
    "fk_staff_locations_location",
    "vendor_location_id",
    "vendor_locations",
    "CASCADE",
  ],
  ["staff_members", "fk_staff_members_user", "user_id", "users"],
  ["staff_members", "fk_staff_members_vendor", "vendor_id", "vendors"],
  [
    "staff_services",
    "fk_staff_services_offering",
    "service_offering_id",
    "service_offerings",
    "CASCADE",
  ],
  ["staff_services", "fk_staff_services_staff", "staff_member_id", "staff_members", "CASCADE"],
  ["staff_time_off", "fk_sto_staff", "staff_member_id", "staff_members", "CASCADE"],
  ["staff_working_hours", "fk_swh_location", "location_id", "vendor_locations", "CASCADE"],
  ["staff_working_hours", "fk_swh_staff", "staff_member_id", "staff_members", "CASCADE"],
  ["user_tagging_permissions", "user_tagging_permissions_granted_by_fkey", "granted_by", "users"],
  ["user_tagging_permissions", "user_tagging_permissions_vendor_id_fkey", "vendor_id", "vendors"],
  ["vendor_ai_usage", "vendor_ai_usage_vendor_id_fkey", "vendor_id", "vendors", "CASCADE"],
  [
    "vendor_integration_deliveries",
    "vendor_integration_deliveries_integration_id_fkey",
    "integration_id",
    "vendor_integrations",
    "CASCADE",
  ],
  [
    "vendor_integration_pending_writes",
    "vendor_integration_pending_writes_delivery_id_fkey",
    "delivery_id",
    "vendor_integration_deliveries",
    "CASCADE",
  ],
  [
    "vendor_integration_pending_writes",
    "vendor_integration_pending_writes_integration_id_fkey",
    "integration_id",
    "vendor_integrations",
    "CASCADE",
  ],
  ["vendor_locations", "fk_vendor_locations_vendor", "vendor_id", "vendors"],
  ["vendor_members", "FK_vendor_members_invited_by", "invited_by_user_id", "users", "SET NULL"],
  ["vendor_members", "FK_vendor_members_revoked_by", "revoked_by_user_id", "users", "SET NULL"],
  ["vendors", "fk_vendors_verified_by", "verified_by", "users", "SET NULL"],
];

// Relation FKs TypeORM already creates (entity names), whose ON DELETE rule the
// entity now declares: [table, constraint, column, referenced table, ON DELETE]
const RELATION_ON_DELETE: [string, string, string, string, string][] = [
  ["categories", "FK_88cea2dc9c31951d06437879b40", "parent_id", "categories", "SET NULL"],
  ["creator_applications", "FK_d85268358b352c88dc2c92dd2cc", "user_id", "users", "CASCADE"],
  ["creator_media_kits", "FK_87a7267fedc325f365a6e9bf544", "user_id", "users", "CASCADE"],
  ["creator_portfolio_videos", "FK_6149c26cef5597405d6299c01a2", "user_id", "users", "CASCADE"],
  ["layout_versions", "FK_426947546ad0c048d0a1baa12bb", "layout_id", "page_layouts", "CASCADE"],
  ["page_layouts", "FK_09512aca377c10da97ed5744932", "vendor_id", "vendors", "CASCADE"],
  [
    "page_layouts",
    "FK_b0751ae076487c62e91580cbe24",
    "published_version_id",
    "layout_versions",
    "SET NULL",
  ],
  [
    "page_layouts",
    "FK_c3771b0eb04b91f210227935890",
    "draft_version_id",
    "layout_versions",
    "SET NULL",
  ],
  ["pages", "FK_4cfa4caf7f1c553220d70987fb2", "author_id", "users", "SET NULL"],
  [
    "reel_license_grants",
    "FK_98859265f4e2026a8e89572d9e9",
    "offer_id",
    "reel_license_offers",
    "CASCADE",
  ],
  ["reel_license_grants", "FK_72c6d57396bf9e283a89acc9b5c", "reel_id", "reels", "CASCADE"],
  ["section_bids", "FK_40a5ca1d32f45b17f13e01776e2", "section_id", "layout_sections", "CASCADE"],
  ["site_settings", "FK_f4f6d58d0d931610e228b25fef7", "updated_by", "users", "SET NULL"],
  ["support_messages", "FK_d5e0c744062d01ccda719d7ef17", "ticket_id", "support_tickets", "CASCADE"],
  ["support_messages", "FK_db9f9d46849e30b9ac570db6eb6", "sender_id", "users", "CASCADE"],
  ["support_tickets", "FK_0b1eb4f1f984aab3c481c48468a", "user_id", "users", "CASCADE"],
  ["tax_rates", "FK_b2288e39ae19a91ce29f55f8344", "category_id", "categories", "SET NULL"],
  ["vendor_documents", "FK_0a0e3fccb9f2d9977aad9b3956a", "verified_by", "users", "SET NULL"],
  [
    "vendor_payout_adjustments",
    "FK_3c45a2c7ea4f952c3a88499d057",
    "settled_payout_id",
    "vendor_payouts",
    "SET NULL",
  ],
];

// [table, constraint, expression]
const CHECKS: [string, string, string][] = [
  [
    "collab_opportunities",
    "ck_collab_slots",
    "slots_total > 0 AND slots_filled >= 0 AND slots_filled <= slots_total",
  ],
  [
    "collab_opportunities",
    "ck_collab_type_fields",
    "(type = 'product_seeding' AND seeded_product_id IS NOT NULL AND seeded_qty IS NOT NULL AND seeded_qty > 0) OR (type = 'paid_campaign' AND fee_fils IS NOT NULL AND fee_fils > 0 AND funding_source IS NOT NULL) OR (type = 'event_appearance' AND location_id IS NOT NULL AND starts_at IS NOT NULL AND ends_at IS NOT NULL AND ends_at > starts_at)",
  ],
  ["creator_media_kits", "ck_media_kit_audience_len", "jsonb_array_length(audience) <= 6"],
  [
    "creator_media_kits",
    "ck_media_kit_content_types_len",
    "jsonb_array_length(content_types) <= 8",
  ],
  ["creator_media_kits", "ck_media_kit_locations_len", "jsonb_array_length(top_locations) <= 6"],
  ["creator_media_kits", "ck_media_kit_stats_len", "jsonb_array_length(stats) <= 4"],
  [
    "payment_method_thresholds",
    "payment_method_thresholds_provider_check",
    "provider IN ('tabby', 'tamara', 'cod')",
  ],
  [
    "payment_method_thresholds",
    "payment_method_thresholds_surcharge_nonneg",
    "surcharge_fils IS NULL OR surcharge_fils >= 0",
  ],
  [
    "reel_license_escrow_holds",
    "chk_reel_license_escrow_holds_link",
    "num_nonnulls(offer_id, bid_id, collab_application_id) = 1",
  ],
  [
    "reel_license_grants",
    "chk_reel_license_grants_link",
    "num_nonnulls(offer_id, bid_id, collab_application_id) = 1",
  ],
  ["reel_views", "ck_reel_views_user_or_session", "user_id IS NOT NULL OR session_id IS NOT NULL"],
  ["reels", "ck_reels_caption_length", "caption IS NULL OR length(caption) <= 500"],
  ["reels", "ck_reels_duration", "video_duration_seconds >= 3 AND video_duration_seconds <= 90"],
  ["reels", "ck_reels_language", "language_code IN ('ar', 'en', 'hi', 'ur', 'ml')"],
  ["reels", "ck_reels_portrait", "video_height >= video_width"],
  ["rules_epoch", "rules_epoch_id_check", "id = 1"],
  ["section_bid_slots", "section_bid_slots_max_slots_check", "max_slots > 0"],
  ["section_bid_slots", "section_bid_slots_min_bid_fils_check", "min_bid_fils > 0"],
  ["section_bids", "chk_bid_dates", "expires_at > starts_at"],
  ["section_bids", "section_bids_bid_amount_fils_check", "bid_amount_fils > 0"],
  ["service_reviews", "chk_service_reviews_rating", "rating >= 1 AND rating <= 5"],
  [
    "support_tickets",
    "support_tickets_owner_present",
    "user_id IS NOT NULL OR guest_session IS NOT NULL",
  ],
  [
    "user_tagging_permissions",
    "ck_tagging_perm_scope",
    "scope = 'any_product' OR (scope = 'specific_brand' AND brand_id IS NOT NULL) OR (scope = 'specific_vendor' AND vendor_id IS NOT NULL) OR (scope = 'specific_products' AND product_ids IS NOT NULL)",
  ],
  ["vendor_payout_adjustments", "vendor_payout_adjustments_amount_nonzero", "amount_fils <> 0"],
  [
    "vendors",
    "vendors_settlement_window_nonneg",
    "settlement_window_days IS NULL OR settlement_window_days >= 0",
  ],
];

// [table, constraint, column list]
const UNIQUES: [string, string, string][] = [
  ["layout_versions", "uq_layout_version", '"layout_id", "version_number"'],
  ["recent_searches", "recent_searches_user_id_query_key", '"user_id", "query"'],
  ["reel_license_grants", "uq_rlg_offer", '"offer_id"'],
];

// [table, index, unique, column list, partial-index predicate]
const INDEXES: [string, string, boolean, string, string | null][] = [
  [
    "categories",
    "idx_categories_path_prefix",
    false,
    "path varchar_pattern_ops",
    "deleted_at IS NULL",
  ],
  [
    "collab_applications",
    "idx_collab_app_awaiting_receipt",
    false,
    "shipped_at",
    "deleted_at IS NULL AND received_at IS NULL",
  ],
  [
    "collab_applications",
    "idx_collab_app_creator",
    false,
    "creator_id, status",
    "deleted_at IS NULL",
  ],
  [
    "collab_applications",
    "idx_collab_app_deliver_by",
    false,
    "deliver_by",
    "deleted_at IS NULL AND completed_at IS NULL",
  ],
  [
    "collab_applications",
    "uq_collab_app_creator",
    true,
    "opportunity_id, creator_id",
    "deleted_at IS NULL",
  ],
  ["collab_events", "idx_collab_events_opp", false, "opportunity_id, created_at", null],
  [
    "collab_opportunities",
    "idx_collab_board",
    false,
    "status, visibility, applications_close_at",
    "deleted_at IS NULL",
  ],
  ["collab_opportunities", "idx_collab_vendor", false, "vendor_id, status", "deleted_at IS NULL"],
  [
    "commissions",
    "idx_commissions_payable",
    false,
    "vendor_id, status, settle_after",
    "payout_id IS NULL AND deleted_at IS NULL",
  ],
  ["daily_creator_metrics", "idx_dcm_bucket_date", false, "bucket_date DESC", null],
  ["daily_reel_metrics", "idx_drm_bucket_date", false, "bucket_date DESC", null],
  ["daily_vendor_reel_metrics", "idx_dvrm_bucket_date", false, "bucket_date DESC", null],
  [
    "header_navigation_configs",
    "uniq_header_nav_published",
    true,
    "status",
    "status = 'published' AND deleted_at IS NULL",
  ],
  ["layout_sections", "idx_layout_sections_version", false, 'version_id, "position"', null],
  ["newsletter_subscribers", "idx_newsletter_subscribers_user", false, "user_id", null],
  [
    "newsletter_subscribers",
    "uq_newsletter_subscribers_email_active",
    true,
    "email",
    "deleted_at IS NULL",
  ],
  ["newsletter_subscribers", "uq_newsletter_subscribers_token", true, "unsubscribe_token", null],
  ["notifications", "idx_notifications_created_at", false, "created_at", null],
  ["notifications", "idx_notifications_user_id", false, "user_id", null],
  ["notifications", "idx_notifications_user_read", false, "user_id, is_read", null],
  ["page_layouts", "idx_page_layouts_vendor", false, "vendor_id", "deleted_at IS NULL"],
  [
    "page_layouts",
    "uq_page_layouts_admin_slug",
    true,
    "slug",
    "vendor_id IS NULL AND deleted_at IS NULL",
  ],
  [
    "page_layouts",
    "uq_page_layouts_vendor_slug",
    true,
    "vendor_id, slug",
    "vendor_id IS NOT NULL AND deleted_at IS NULL",
  ],
  ["payments", "idx_payments_booking", false, "booking_id", "booking_id IS NOT NULL"],
  ["reel_brief_bids", "idx_bid_brief", false, "brief_id, status", null],
  ["reel_brief_bids", "idx_bid_creator", false, "creator_id", null],
  [
    "reel_brief_bids",
    "uq_bid_awarded",
    true,
    "brief_id",
    "status IN ('accepted', 'delivered', 'revision_requested')",
  ],
  ["reel_brief_events", "idx_brief_event_brief_created", false, "brief_id, created_at", null],
  ["reel_briefs", "idx_brief_status_open", false, "status, bids_close_at", "deleted_at IS NULL"],
  ["reel_briefs", "idx_brief_vendor", false, "vendor_id", "deleted_at IS NULL"],
  ["reel_license_downloads", "idx_rld_grant_created", false, "grant_id, created_at", null],
  [
    "reel_license_escrow_holds",
    "idx_reel_license_escrow_holds_bid",
    false,
    "bid_id",
    "bid_id IS NOT NULL",
  ],
  [
    "reel_license_escrow_holds",
    "idx_reel_license_escrow_holds_collab_app",
    false,
    "collab_application_id",
    "collab_application_id IS NOT NULL",
  ],
  [
    "reel_license_escrow_holds",
    "idx_rleh_vendor_payout_active",
    false,
    "vendor_id",
    "funding_source = 'payout_balance' AND status IN ('held', 'captured') AND deleted_at IS NULL",
  ],
  ["reel_license_escrow_holds", "uq_rleh_idem", true, "idempotency_key", null],
  [
    "reel_license_features",
    "idx_rlf_product",
    false,
    'product_id, "position"',
    "deleted_at IS NULL",
  ],
  [
    "reel_license_features",
    "idx_rlf_vendor",
    false,
    'vendor_id, placement, "position"',
    "deleted_at IS NULL",
  ],
  [
    "reel_license_features",
    "uq_rlf_storefront",
    true,
    "grant_id, placement",
    "product_id IS NULL AND deleted_at IS NULL",
  ],
  [
    "reel_license_features",
    "uq_rlf_surface",
    true,
    "grant_id, placement, product_id",
    "deleted_at IS NULL",
  ],
  ["reel_license_grants", "idx_reel_license_grants_bid", false, "bid_id", "bid_id IS NOT NULL"],
  [
    "reel_license_grants",
    "idx_reel_license_grants_collab_app",
    false,
    "collab_application_id",
    "collab_application_id IS NOT NULL",
  ],
  ["reel_license_grants", "idx_rlg_creator", false, "creator_id", "deleted_at IS NULL"],
  ["reel_license_grants", "idx_rlg_vendor", false, "vendor_id", "deleted_at IS NULL"],
  ["reel_license_offer_events", "idx_rloe_offer_created", false, "offer_id, created_at", null],
  [
    "reel_license_offers",
    "idx_rlo_creator_status",
    false,
    "creator_id, status",
    "deleted_at IS NULL",
  ],
  ["reel_license_offers", "idx_rlo_expiry", false, "status, expires_at", "deleted_at IS NULL"],
  [
    "reel_license_offers",
    "idx_rlo_vendor_status",
    false,
    "vendor_id, status",
    "deleted_at IS NULL",
  ],
  ["reel_moderation_log", "idx_moderation_log_reel", false, "reel_id, created_at DESC", null],
  ["reel_saves", "idx_reel_saves_user_recent", false, "user_id, saved_at DESC", null],
  [
    "reel_vendor_shortlists",
    "idx_reel_vendor_shortlists_vendor",
    false,
    "vendor_id",
    "deleted_at IS NULL",
  ],
  [
    "reel_vendor_shortlists",
    "uq_reel_vendor_shortlists_active",
    true,
    "vendor_id, reel_id",
    "deleted_at IS NULL",
  ],
  [
    "reel_views",
    "idx_reel_views_user_recent",
    false,
    "user_id, viewed_at DESC",
    "user_id IS NOT NULL",
  ],
  [
    "reel_views",
    "idx_reel_views_user_seen",
    false,
    "user_id",
    "completion_percentage >= 0.5 AND user_id IS NOT NULL",
  ],
  [
    "reel_views",
    "uq_reel_views_session_reel",
    true,
    "session_id, reel_id",
    "user_id IS NULL AND session_id IS NOT NULL",
  ],
  ["reel_views", "uq_reel_views_user_reel", true, "user_id, reel_id", "user_id IS NOT NULL"],
  [
    "reels",
    "idx_reels_author_kind_status_published",
    false,
    "author_kind, status, published_at DESC",
    "deleted_at IS NULL",
  ],
  [
    "reels",
    "idx_reels_pending_queue",
    false,
    "created_at",
    "status = 'pending_review' AND deleted_at IS NULL",
  ],
  ["reels", "idx_reels_status_published", false, "status, published_at DESC", "deleted_at IS NULL"],
  [
    "reels",
    "idx_reels_user_published",
    false,
    "user_id, published_at DESC",
    "status = 'approved' AND deleted_at IS NULL",
  ],
  [
    "section_bids",
    "idx_section_bids_active",
    false,
    "section_id, status, expires_at",
    "status = 'won'",
  ],
  ["section_bids", "idx_section_bids_section", false, "section_id, status", null],
  ["section_bids", "idx_section_bids_vendor", false, "vendor_id, status", null],
  ["service_offerings", "idx_service_offerings_status", false, "status", "deleted_at IS NULL"],
  [
    "staff_calendar_subscriptions",
    "idx_calendar_sub_active",
    false,
    "is_active",
    "deleted_at IS NULL",
  ],
  [
    "staff_calendar_subscriptions",
    "idx_calendar_sub_vendor",
    false,
    "vendor_id",
    "deleted_at IS NULL",
  ],
  ["user_follows", "idx_user_follows_followee", false, "followee_id, followed_at DESC", null],
  ["user_tagging_permissions", "idx_tagging_permissions_user", false, "user_id", null],
  ["users", "idx_users_creator_tier", false, "creator_tier", "creator_tier <> 'regular'"],
  [
    "vendor_members",
    "idx_vendor_members_user_status",
    false,
    "user_id, status",
    "deleted_at IS NULL",
  ],
  [
    "vendor_members",
    "uq_vendor_members_active",
    true,
    "vendor_id, user_id",
    "status = 'active' AND deleted_at IS NULL",
  ],
  [
    "vendor_members",
    "uq_vendor_members_active_owner",
    true,
    "vendor_id",
    "role = 'owner' AND status = 'active' AND deleted_at IS NULL",
  ],
  [
    "vendor_members",
    "uq_vendor_members_invite_token",
    true,
    "invite_token",
    "invite_token IS NOT NULL",
  ],
  [
    "vendor_members",
    "uq_vendor_members_pending_email",
    true,
    "vendor_id, lower(email)",
    "status = 'pending' AND deleted_at IS NULL",
  ],
  [
    "vendor_payouts",
    "uq_vendor_payouts_vendor_period_active",
    true,
    "vendor_id, period_start, period_end",
    "deleted_at IS NULL",
  ],
];

// [table, column, default expression]
const DEFAULTS: [string, string, string][] = [
  ["rules_epoch", "epoch", "0"],
  ["rules_epoch", "id", "1"],
  ["user_verified_phones", "verified_at", "now()"],
];

const addConstraintIfMissing = (table: string, name: string, definition: string) =>
  `DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = '${name}' AND conrelid = '"${table}"'::regclass
    ) THEN
      ALTER TABLE "${table}" ADD CONSTRAINT "${name}" ${definition};
    END IF;
  END $$`;

const fkDefinition = (column: string, refTable: string, onDelete?: string) =>
  `FOREIGN KEY ("${column}") REFERENCES "${refTable}"("id")${onDelete ? ` ON DELETE ${onDelete}` : ""}`;

export class RestoreForkConstraints1792700000200 implements MigrationInterface {
  name = "RestoreForkConstraints1792700000200";

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [table, name, column, refTable, onDelete] of FOREIGN_KEYS) {
      await queryRunner.query(
        addConstraintIfMissing(table, name, fkDefinition(column, refTable, onDelete)),
      );
    }
    for (const [table, name, column, refTable, onDelete] of RELATION_ON_DELETE) {
      await queryRunner.query(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${name}"`);
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD CONSTRAINT "${name}" ${fkDefinition(column, refTable, onDelete)}`,
      );
    }
    for (const [table, name, expression] of CHECKS) {
      await queryRunner.query(addConstraintIfMissing(table, name, `CHECK (${expression})`));
    }
    for (const [table, name, columns] of UNIQUES) {
      await queryRunner.query(addConstraintIfMissing(table, name, `UNIQUE (${columns})`));
    }
    for (const [table, name, unique, columns, where] of INDEXES) {
      await queryRunner.query(
        `CREATE ${unique ? "UNIQUE " : ""}INDEX IF NOT EXISTS "${name}" ON "${table}" (${columns})${where ? ` WHERE ${where}` : ""}`,
      );
    }
    for (const [table, column, expression] of DEFAULTS) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "${column}" SET DEFAULT ${expression}`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [table, column] of DEFAULTS) {
      await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN "${column}" DROP DEFAULT`);
    }
    for (const [, name] of INDEXES) {
      await queryRunner.query(`DROP INDEX IF EXISTS "${name}"`);
    }
    for (const [table, name] of [...UNIQUES, ...CHECKS, ...FOREIGN_KEYS]) {
      await queryRunner.query(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${name}"`);
    }
    for (const [table, name, column, refTable] of RELATION_ON_DELETE) {
      await queryRunner.query(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${name}"`);
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD CONSTRAINT "${name}" ${fkDefinition(column, refTable)}`,
      );
    }
  }
}
