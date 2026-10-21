import { config } from "@mypickuae/config";
import {
  AppDataSource,
  Reel,
  ReelAuthorKind,
  ReelStatus,
  VendorMember,
  VendorMemberStatus,
} from "@mypickuae/database";
import { In, type Repository } from "typeorm";
import type { TrustService } from "../creator-tier/trust.service.ts";
import type { CategoryCohortInvalidator } from "../feed/category-cohort-invalidator.ts";
import { collectCategorySeedIdsForReel } from "../moderation/moderation.service.ts";
import type { CloudflareStreamClient } from "../upload/cloudflare-stream.client.ts";

export interface RequestUploadInput {
  userId: string;
}

export interface RequestUploadResult {
  uploadUrl: string;
  assetId: string;
  reelId: string;
}

export interface UploadRecoveryScheduler {
  enqueue(input: { assetId: string; userId: string }): Promise<void>;
}

export class ReelsService {
  private reelRepo: Repository<Reel> | null = null;
  private uploadRecoveryScheduler: UploadRecoveryScheduler | null = null;

  constructor(
    private readonly cloudflare: CloudflareStreamClient,
    private readonly trustService: TrustService,
    private readonly invalidator?: CategoryCohortInvalidator,
  ) {}

  setUploadRecoveryScheduler(scheduler: UploadRecoveryScheduler): void {
    this.uploadRecoveryScheduler = scheduler;
  }

  private getRepo(): Repository<Reel> {
    if (!this.reelRepo) this.reelRepo = AppDataSource.getRepository(Reel);
    return this.reelRepo;
  }

  async requestUpload(input: RequestUploadInput): Promise<RequestUploadResult> {
    const result = await this.cloudflare.requestDirectUploadUrl({
      maxDurationSeconds: 90,
      // Pass userId so the eventual video.ready webhook can be associated
      // with the uploader. Without this, the webhook handler rejects the
      // asset as `missing_user_id` and deletes it.
      meta: { userId: input.userId },
    });
    const draft = await this.createPendingDraftForAsset({
      userId: input.userId,
      assetId: result.assetId,
    });
    if (this.uploadRecoveryScheduler) {
      try {
        await this.uploadRecoveryScheduler.enqueue({
          assetId: result.assetId,
          userId: input.userId,
        });
      } catch (error) {
        console.warn(
          `[ReelsService] failed to enqueue Cloudflare recovery for asset ${result.assetId}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }
    return { ...result, reelId: draft.id };
  }

  private async createPendingDraftForAsset(input: {
    userId: string;
    assetId: string;
  }): Promise<Reel> {
    const repo = this.getRepo();
    const existing = await repo.findOne({ where: { video_asset_id: input.assetId } });
    if (existing) return existing;

    const hasActiveVendorMembership = await this.hasActiveVendorMembership(input.userId);
    const deliveryBaseUrl = `${config.cloudflareStream.deliveryBaseUrl}/${input.assetId}`;
    const reel = repo.create({
      user_id: input.userId,
      video_provider: "cloudflare_stream",
      video_asset_id: input.assetId,
      video_playback_url: `${deliveryBaseUrl}/manifest/video.m3u8`,
      video_duration_seconds: 90,
      video_width: 720,
      video_height: 1280,
      thumbnail_url: `${deliveryBaseUrl}/thumbnails/thumbnail.jpg`,
      author_kind: hasActiveVendorMembership ? ReelAuthorKind.house : ReelAuthorKind.customer,
      language_code: "en",
      status: ReelStatus.draft,
    });
    return repo.save(reel);
  }

  async createDraftFromAsset(input: {
    userId: string;
    assetId: string;
    durationSeconds: number;
    width: number;
    height: number;
    thumbnailUrl: string;
    playbackUrl: string;
  }): Promise<Reel> {
    const repo = this.getRepo();
    const existing = await repo.findOne({ where: { video_asset_id: input.assetId } });
    if (existing) {
      existing.video_playback_url = input.playbackUrl;
      existing.video_duration_seconds = input.durationSeconds;
      existing.video_width = input.width;
      existing.video_height = input.height;
      existing.thumbnail_url = input.thumbnailUrl;
      return repo.save(existing);
    }

    const hasActiveVendorMembership = await this.hasActiveVendorMembership(input.userId);
    const reel = repo.create({
      user_id: input.userId,
      video_provider: "cloudflare_stream",
      video_asset_id: input.assetId,
      video_playback_url: input.playbackUrl,
      video_duration_seconds: input.durationSeconds,
      video_width: input.width,
      video_height: input.height,
      thumbnail_url: input.thumbnailUrl,
      author_kind: hasActiveVendorMembership ? ReelAuthorKind.house : ReelAuthorKind.customer,
      language_code: "en", // default; user changes in metadata form later
      status: ReelStatus.draft,
    });
    return repo.save(reel);
  }

  private async hasActiveVendorMembership(userId: string): Promise<boolean> {
    const count = await AppDataSource.getRepository(VendorMember).count({
      where: { user_id: userId, status: VendorMemberStatus.active },
    });
    return count > 0;
  }

  private async countTagsForReel(reelId: string): Promise<number> {
    // Product tagging was removed with the commerce domain; reels carry no tags.
    return 0;
  }

  private async isTrustedUser(userId: string): Promise<boolean> {
    // Delegation kept as a private method so existing publish tests that
    // mock `(service as any).isTrustedUser = ...` continue to work.
    return this.trustService.isTrusted(userId);
  }

  async publish(input: { reelId: string; userId: string }): Promise<Reel> {
    const repo = this.getRepo();
    const reel = await repo.findOne({ where: { id: input.reelId } });
    if (!reel) throw new Error("reel_not_found");
    if (reel.user_id !== input.userId) throw new Error("not_the_owner");
    if (reel.status !== ReelStatus.draft) throw new Error("reel_not_in_draft_state");

    await this.refreshCloudflareMetadataBeforePublish(reel);

    const tagCount = await this.countTagsForReel(input.reelId);
    if (tagCount < 1) throw new Error("at_least_one_tag");

    const trusted = await this.isTrustedUser(input.userId);
    if (trusted) {
      reel.status = ReelStatus.approved;
      reel.published_at = new Date();
    } else {
      reel.status = ReelStatus.pending_review;
    }
    return repo.save(reel);
  }

  private async refreshCloudflareMetadataBeforePublish(reel: Reel): Promise<void> {
    if (reel.video_provider !== "cloudflare_stream") return;

    const video = await this.cloudflare.getVideo(reel.video_asset_id);
    if (video.status === "uploading") throw new Error("video_still_processing");
    if (video.status === "error") {
      await this.markAssetRejected(reel.video_asset_id, video.errorReason ?? "transcode_failed");
      throw new Error(video.errorReason ?? "transcode_failed");
    }
    const durationSeconds = Math.round(video.duration);
    if (durationSeconds < 3) {
      await this.markAssetRejected(reel.video_asset_id, "duration_too_short");
      throw new Error("duration_too_short");
    }
    if (durationSeconds > 90) {
      await this.markAssetRejected(reel.video_asset_id, "duration_too_long");
      throw new Error("duration_too_long");
    }
    if (video.height < video.width) {
      await this.markAssetRejected(reel.video_asset_id, "aspect_ratio_not_portrait");
      throw new Error("aspect_ratio_not_portrait");
    }

    reel.video_playback_url = video.playbackUrl;
    reel.video_duration_seconds = durationSeconds;
    reel.video_width = video.width;
    reel.video_height = video.height;
    reel.thumbnail_url = video.thumbnailUrl;
    await this.getRepo().save(reel);
  }

  async getById(reelId: string, viewerId: string | null): Promise<Reel | null> {
    const repo = this.getRepo();
    const reel = await repo.findOne({
      where: { id: reelId },
    });
    if (!reel) return null;
    if (reel.status !== ReelStatus.approved) {
      if (!viewerId || viewerId !== reel.user_id) return null;
    }
    return reel;
  }

  async softDelete(reelId: string, userId: string): Promise<void> {
    const repo = this.getRepo();
    const reel = await repo.findOne({ where: { id: reelId } });
    if (!reel) throw new Error("reel_not_found");
    if (reel.user_id !== userId) throw new Error("not_the_owner");

    const seeds = this.invalidator
      ? await collectCategorySeedIdsForReel(reelId, AppDataSource)
      : [];
    await repo.softRemove(reel);
    if (this.invalidator && seeds.length > 0) {
      void this.invalidator.enqueue({ seedCategoryIds: seeds });
    }
  }

  async updateMetadata(
    reelId: string,
    userId: string,
    data: {
      caption?: string;
      language_code?: string;
      thumbnail_url?: string;
      is_sponsored_disclosed?: boolean;
    },
  ): Promise<Reel> {
    const repo = this.getRepo();
    const reel = await repo.findOne({ where: { id: reelId } });
    if (!reel) throw new Error("reel_not_found");
    if (reel.user_id !== userId) throw new Error("not_the_owner");
    if (reel.status !== ReelStatus.draft) {
      // post-publish: only caption + language editable, within 30 minutes
      const anchor = reel.published_at ?? reel.created_at;
      const ageMs = Date.now() - new Date(anchor).getTime();
      if (ageMs > 30 * 60 * 1000) throw new Error("edit_window_closed");
      data.thumbnail_url = undefined;
    }
    if (data.caption !== undefined) reel.caption = data.caption;
    if (data.language_code !== undefined) reel.language_code = data.language_code;
    if (data.thumbnail_url !== undefined) reel.thumbnail_url = data.thumbnail_url;
    if (data.is_sponsored_disclosed !== undefined)
      reel.is_sponsored_disclosed = data.is_sponsored_disclosed;
    return repo.save(reel);
  }

  /**
   * List reels owned by a given user across all statuses. If `assetId` is
   * provided, filter to the single reel with that Cloudflare asset id —
   * useful right after upload when the client knows the asset but not the
   * reel UUID yet.
   *
   * Cursor is the previous page's last `created_at` ISO string.
   */
  async listForOwner(opts: {
    userId: string;
    assetId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<{ items: Reel[]; nextCursor: string | null }> {
    const repo = this.getRepo();
    const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);
    const qb = repo
      .createQueryBuilder("r")
      .where("r.user_id = :uid", { uid: opts.userId })
      .andWhere("r.deleted_at IS NULL")
      .orderBy("r.created_at", "DESC")
      .limit(limit + 1);
    if (opts.assetId) {
      qb.andWhere("r.video_asset_id = :asset", { asset: opts.assetId });
    }
    if (opts.cursor) {
      qb.andWhere("r.created_at < :cursor", { cursor: new Date(opts.cursor) });
    }
    const rows = await qb.getMany();
    const items = rows.slice(0, limit);
    const nextCursor =
      rows.length > limit ? items[items.length - 1]!.created_at.toISOString() : null;
    return { items, nextCursor };
  }

  /**
   * Idempotency probe used by the webhook handler — returns the existing
   * reel row for a given Cloudflare asset id, or null if none exists.
   * Callers shouldn't rely on any soft-deleted rows being filtered out,
   * since recovery flows may want to see them.
   */
  async findByAssetId(assetId: string): Promise<Reel | null> {
    const repo = this.getRepo();
    return repo.findOne({ where: { video_asset_id: assetId } });
  }

  async markAssetRejected(assetId: string, reason: string): Promise<void> {
    const repo = this.getRepo();
    // If a draft row already exists for this asset, mark it rejected.
    const existing = await repo.findOne({ where: { video_asset_id: assetId } });
    if (existing) {
      existing.status = ReelStatus.rejected;
      existing.rejection_reason = reason;
      await repo.save(existing);
    }
    // Best-effort clean up the Cloudflare asset regardless.
    try {
      await this.cloudflare.deleteVideo(assetId);
    } catch (error) {
      console.warn(`[ReelsService] failed to delete rejected asset ${assetId}:`, error);
    }
  }
}
