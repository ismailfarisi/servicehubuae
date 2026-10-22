import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ForeignKey,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ReelAuthorKind, ReelStatus } from "../enums.ts";
import type { User } from "./user.entity.ts";

@Entity("reels")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("User", ["moderator_id"], ["id"], { name: "reels_moderator_id_fkey" })
@Check("ck_reels_caption_length", "caption IS NULL OR length(caption) <= 500")
@Check("ck_reels_duration", "video_duration_seconds >= 3 AND video_duration_seconds <= 90")
@Check("ck_reels_language", "language_code IN ('ar', 'en', 'hi', 'ur', 'ml')")
@Check("ck_reels_portrait", "video_height >= video_width")
@Index("idx_reels_author_kind_status_published", ["author_kind", "status", "published_at"], {
  where: "deleted_at IS NULL",
})
@Index("idx_reels_pending_queue", ["created_at"], {
  where: "status = 'pending_review' AND deleted_at IS NULL",
})
@Index("idx_reels_status_published", ["status", "published_at"], { where: "deleted_at IS NULL" })
@Index("idx_reels_user_published", ["user_id", "published_at"], {
  where: "status = 'approved' AND deleted_at IS NULL",
})
export class Reel {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @ManyToOne("User")
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "text", default: "cloudflare_stream" })
  video_provider!: string;

  @Column({ type: "text" })
  video_asset_id!: string;

  @Column({ type: "text" })
  video_playback_url!: string;

  @Column({ type: "int" })
  video_duration_seconds!: number;

  @Column({ type: "int" })
  video_width!: number;

  @Column({ type: "int" })
  video_height!: number;

  @Column({ type: "text" })
  thumbnail_url!: string;

  @Column({ type: "text", nullable: true })
  caption!: string | null;

  @Column({ type: "enum", enum: ReelAuthorKind, default: ReelAuthorKind.customer })
  author_kind!: ReelAuthorKind;

  @Column({ type: "boolean", default: false })
  is_verified_buyer!: boolean;

  @Column({ type: "text" })
  language_code!: string;

  @Column({ type: "boolean", default: false })
  is_sponsored_disclosed!: boolean;

  @Column({ type: "enum", enum: ReelStatus, default: ReelStatus.draft })
  status!: ReelStatus;

  @Column({ type: "text", nullable: true })
  rejection_reason!: string | null;

  @Column({ type: "numeric", precision: 5, scale: 4, nullable: true })
  risk_score!: string | null;

  @Column({ type: "jsonb", default: () => "'{}'::jsonb" })
  auto_flags!: Record<string, unknown>;

  @Column({ type: "text", nullable: true })
  auto_review_result!: string | null;

  @Column({ type: "uuid", nullable: true })
  moderator_id!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  moderated_at!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  published_at!: Date | null;

  @Column({ type: "int", default: 0 })
  like_count!: number;

  @Column({ type: "int", default: 0 })
  view_count!: number;

  @Column({ type: "int", default: 0 })
  save_count!: number;

  @Column({ type: "int", default: 0 })
  share_count!: number;

  @Column({ type: "int", default: 0 })
  unique_viewer_count!: number;

  @Column({ type: "numeric", precision: 12, scale: 4, default: 0 })
  ranking_score!: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
