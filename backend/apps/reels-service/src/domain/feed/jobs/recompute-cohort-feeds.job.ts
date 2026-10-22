/**
 * Scheduled job: recompute Redis ZSET cohort feeds for all (language, country)
 * cohorts every 10 minutes. Injects new reels (<24h, <50 views) into every
 * 10th slot to give freshly-approved content discovery exposure.
 *
 * The cohort key shape matches FeedService: `home:for_you:<lang>:<country>`.
 * Pool size caps at 500 per cohort — FeedService paginates within this pool.
 */
import { config } from "@servicehubuae/config";
import { AppDataSource, Reel, ReelStatus } from "@servicehubuae/database";
import { type Job, Queue, Worker } from "bullmq";
import type { FeedCacheClient } from "../feed-cache.client.ts";

const QUEUE_NAME = "reels-scheduled";
const JOB_NAME = "recomputeCohortFeeds";
const REPEAT_EVERY_MS = 10 * 60 * 1000; // 10 min
const SUPPORTED_LANGUAGES = ["en", "ar", "hi", "ur", "ml"];
const SUPPORTED_COUNTRIES = ["AE"];
const POOL_SIZE = 500;
const NEW_REEL_INJECTION_WINDOW_HOURS = 24;
const NEW_REEL_VIEW_CEILING = 50;

export class RecomputeCohortFeedsJob {
  private worker: Worker | null = null;
  private readonly queue: Queue;

  constructor(private readonly cache: FeedCacheClient) {
    this.queue = new Queue(QUEUE_NAME, {
      connection: { url: config.bullmq.redisUrl },
    });
  }

  /**
   * Register the repeating schedule and start the worker. Idempotent-ish:
   * BullMQ dedupes repeatable jobs by name+pattern, so re-invoking `start`
   * will not create duplicate schedules.
   */
  start(): void {
    void this.queue.add(
      JOB_NAME,
      {},
      {
        repeat: { every: REPEAT_EVERY_MS },
        removeOnComplete: 5,
        removeOnFail: 50,
      },
    );

    this.worker = new Worker(
      QUEUE_NAME,
      async (job: Job) => {
        if (job.name !== JOB_NAME) return;
        await this.runOnce();
      },
      { connection: { url: config.bullmq.redisUrl } },
    );
  }

  /**
   * Recompute every (language, country) cohort exactly once. Exposed for
   * tests and manual triggers.
   */
  async runOnce(): Promise<void> {
    const repo = AppDataSource.getRepository(Reel);
    const newReelSince = new Date(Date.now() - NEW_REEL_INJECTION_WINDOW_HOURS * 3600 * 1000);

    for (const lang of SUPPORTED_LANGUAGES) {
      for (const country of SUPPORTED_COUNTRIES) {
        const rows = await repo
          .createQueryBuilder("r")
          .where("r.status = :s", { s: ReelStatus.approved })
          .andWhere("r.deleted_at IS NULL")
          .andWhere("r.language_code = :l", { l: lang })
          .orderBy("r.ranking_score", "DESC")
          .limit(POOL_SIZE)
          .getMany();

        // New-reel injection: every 10th slot becomes a random recent reel
        // (<24h old, <50 views) to give fresh content discovery exposure.
        const newReels = await repo
          .createQueryBuilder("r")
          .where("r.status = :s", { s: ReelStatus.approved })
          .andWhere("r.deleted_at IS NULL")
          .andWhere("r.language_code = :l", { l: lang })
          .andWhere("r.published_at > :since", { since: newReelSince })
          .andWhere("r.view_count < :vc", { vc: NEW_REEL_VIEW_CEILING })
          .orderBy("RANDOM()")
          .limit(Math.floor(POOL_SIZE / 10))
          .getMany();

        let injectIdx = 0;
        const final: Reel[] = [];
        for (let i = 0; i < rows.length; i++) {
          if (i % 10 === 9 && injectIdx < newReels.length) {
            final.push(newReels[injectIdx++]!);
          } else {
            final.push(rows[i]!);
          }
        }

        const entries = final.map((r, i) => ({
          reelId: r.id,
          // Tie-break by position so the ZSET reproduces insertion order
          // when ranking scores collide.
          score: Number(r.ranking_score) - i * 0.0001,
        }));

        await this.cache.setCohort(`home:for_you:${lang}:${country}`, entries);
      }
    }
  }

  async stop(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }
    await this.queue.close();
  }
}
