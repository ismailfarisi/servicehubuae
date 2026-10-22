import {
  AppDataSource,
  type Reel,
  Reel as ReelEntity,
  ReelStatus,
  type ReelView,
  ReelView as ReelViewEntity,
  UserFollow,
} from "@servicehubuae/database";
import type { Repository } from "typeorm";
import { reelLinkedToVendorSql } from "../shared/reel-vendor-link.ts";
import type { FeedCacheClient } from "./feed-cache.client.ts";

export interface HomeFeedQuery {
  tab: "for_you" | "latest" | "following";
  language: string;
  country: string;
  userId: string | null;
  cursor?: string;
  limit: number;
}

export interface FeedResult {
  reels: Reel[];
  nextCursor: string | null;
}

export class FeedService {
  private viewRepo!: Repository<ReelView>;
  private reelRepo!: Repository<Reel>;

  constructor(
    private readonly cache: FeedCacheClient,
    viewRepo?: Repository<ReelView>,
    reelRepo?: Repository<Reel>,
  ) {
    if (viewRepo) this.viewRepo = viewRepo;
    if (reelRepo) this.reelRepo = reelRepo;
  }

  private getRepos() {
    if (!this.viewRepo) this.viewRepo = AppDataSource.getRepository(ReelViewEntity);
    if (!this.reelRepo) this.reelRepo = AppDataSource.getRepository(ReelEntity);
    return { viewRepo: this.viewRepo, reelRepo: this.reelRepo };
  }

  async getHomeFeed(q: HomeFeedQuery): Promise<FeedResult> {
    if (q.tab === "for_you") return this.getForYouFeed(q);
    if (q.tab === "latest") return this.getLatestFeed(q);
    return this.getFollowingFeed(q);
  }

  private async getForYouFeed(q: HomeFeedQuery): Promise<FeedResult> {
    this.getRepos();
    const cohortKey = `home:for_you:${q.language}:${q.country}`;
    const offset = q.cursor ? Number.parseInt(q.cursor, 10) : 0;
    const candidateIds = await this.cache.getCohort(cohortKey, offset, offset + q.limit * 3);

    // When the cohort cache is empty, fall back to a direct DB query
    if (candidateIds.length === 0) {
      const qb = this.reelRepo
        .createQueryBuilder("r")
        .where("r.status = :status", { status: ReelStatus.approved })
        .andWhere("r.deleted_at IS NULL")
        .orderBy("r.ranking_score", "DESC")
        .addOrderBy("r.published_at", "DESC")
        .limit(q.limit + 1);
      if (q.cursor) qb.andWhere("r.published_at < :cursor", { cursor: new Date(q.cursor) });
      const rows = await qb.getMany();
      const items = rows.slice(0, q.limit);
      return {
        reels: items,
        nextCursor:
          rows.length > q.limit ? items[items.length - 1]!.published_at!.toISOString() : null,
      };
    }

    let unseenIds = candidateIds;
    if (q.userId && candidateIds.length > 0) {
      const seenRows = await this.viewRepo
        .createQueryBuilder("v")
        .select("v.reel_id", "reel_id")
        .where("v.user_id = :uid", { uid: q.userId })
        .andWhere("v.reel_id IN (:...ids)", { ids: candidateIds })
        .getRawMany();
      const seenSet = new Set(seenRows.map((r: any) => r.reel_id));
      unseenIds = candidateIds.filter((id) => !seenSet.has(id));
    }

    const slice = unseenIds.slice(0, q.limit);
    const reels = slice.length > 0 ? await (this.reelRepo as any).findByIds(slice as any) : [];
    const reelMap = new Map((reels as Reel[]).map((r: Reel) => [r.id, r] as const));
    const ordered = slice.map((id) => reelMap.get(id)).filter(Boolean) as Reel[];

    const nextCursor = candidateIds.length > 0 ? String(offset + candidateIds.length) : null;
    return { reels: ordered, nextCursor };
  }

  private async getLatestFeed(q: HomeFeedQuery): Promise<FeedResult> {
    this.getRepos();
    const qb = this.reelRepo
      .createQueryBuilder("r")
      .where("r.status = :status", { status: ReelStatus.approved })
      .andWhere("r.deleted_at IS NULL")
      .andWhere("r.language_code = :lang", { lang: q.language })
      .orderBy("r.published_at", "DESC")
      .limit(q.limit + 1);
    if (q.cursor) qb.andWhere("r.published_at < :cursor", { cursor: new Date(q.cursor) });
    const rows = await qb.getMany();
    const items = rows.slice(0, q.limit);
    const nextCursor =
      rows.length > q.limit ? items[items.length - 1]!.published_at!.toISOString() : null;
    return { reels: items, nextCursor };
  }

  private async getFollowingFeed(q: HomeFeedQuery): Promise<FeedResult> {
    if (!q.userId) return { reels: [], nextCursor: null };
    this.getRepos();
    const followRepo = AppDataSource.getRepository(UserFollow);
    const followees = await followRepo.find({
      where: { follower_id: q.userId },
      select: ["followee_id"],
    });
    const followeeIds = followees.map((f) => f.followee_id);
    if (followeeIds.length === 0) return { reels: [], nextCursor: null };

    const qb = this.reelRepo
      .createQueryBuilder("r")
      .where("r.user_id IN (:...ids)", { ids: followeeIds })
      .andWhere("r.status = :status", { status: ReelStatus.approved })
      .andWhere("r.deleted_at IS NULL")
      .orderBy("r.published_at", "DESC")
      .limit(q.limit + 1);
    if (q.cursor) qb.andWhere("r.published_at < :cursor", { cursor: new Date(q.cursor) });
    const rows = await qb.getMany();
    const items = rows.slice(0, q.limit);
    const nextCursor =
      rows.length > q.limit ? items[items.length - 1]!.published_at!.toISOString() : null;
    return { reels: items, nextCursor };
  }

  /** Reels linked to a vendor (licence grant, delivered collab or team
   *  upload — see reelLinkedToVendorSql). Served from the precomputed
   *  `vendor:<id>` cohort when warm, else a live query. */
  async getVendorFeed(
    vendorId: string,
    q: { userId: string | null; cursor?: string; limit: number },
  ): Promise<FeedResult> {
    this.getRepos();
    const cohortKey = `vendor:${vendorId}`;
    const offset = q.cursor ? Number.parseInt(q.cursor, 10) : 0;
    const candidateIds = await this.cache.getCohort(cohortKey, offset, offset + q.limit * 3);
    if (candidateIds.length === 0) {
      const rows = await this.reelRepo
        .createQueryBuilder("r")
        .where(reelLinkedToVendorSql("r", ":vendorId"), { vendorId })
        .andWhere("r.status = :status", { status: ReelStatus.approved })
        .andWhere("r.deleted_at IS NULL")
        .orderBy("r.ranking_score", "DESC")
        .offset(offset)
        .limit(q.limit + 1)
        .getMany();
      const items = rows.slice(0, q.limit);
      return {
        reels: items,
        nextCursor: rows.length > q.limit ? String(offset + items.length) : null,
      };
    }
    return this.dedupAndFetch(candidateIds, q.userId, q.limit, offset, candidateIds.length);
  }

  async getUserFeed(userId: string, q: { cursor?: string; limit: number }): Promise<FeedResult> {
    this.getRepos();
    const qb = this.reelRepo
      .createQueryBuilder("r")
      .where("r.user_id = :uid", { uid: userId })
      .andWhere("r.status = :status", { status: ReelStatus.approved })
      .andWhere("r.deleted_at IS NULL")
      .orderBy("r.published_at", "DESC")
      .limit(q.limit + 1);
    if (q.cursor) qb.andWhere("r.published_at < :c", { c: new Date(q.cursor) });
    const rows = await qb.getMany();
    const items = rows.slice(0, q.limit);
    const nextCursor =
      rows.length > q.limit ? items[items.length - 1]!.published_at!.toISOString() : null;
    return { reels: items, nextCursor };
  }

  private async dedupAndFetch(
    candidateIds: string[],
    userId: string | null,
    limit: number,
    offset: number,
    cohortLen: number,
  ): Promise<FeedResult> {
    this.getRepos();
    let unseenIds = candidateIds;
    if (userId && candidateIds.length > 0) {
      const seenRows = await this.viewRepo
        .createQueryBuilder("v")
        .select("v.reel_id", "reel_id")
        .where("v.user_id = :uid", { uid: userId })
        .andWhere("v.reel_id IN (:...ids)", { ids: candidateIds })
        .getRawMany();
      const seenSet = new Set(seenRows.map((r: any) => r.reel_id));
      unseenIds = candidateIds.filter((id) => !seenSet.has(id));
    }
    const slice = unseenIds.slice(0, limit);
    const reels = slice.length > 0 ? await (this.reelRepo as any).findByIds(slice as any) : [];
    const reelMap = new Map((reels as Reel[]).map((r: Reel) => [r.id, r] as const));
    const ordered = slice.map((id) => reelMap.get(id)).filter(Boolean) as Reel[];
    return {
      reels: ordered,
      nextCursor: cohortLen > 0 ? String(offset + cohortLen) : null,
    };
  }
}
