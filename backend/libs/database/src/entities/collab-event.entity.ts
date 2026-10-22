import {
  Column,
  CreateDateColumn,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CollabEventType } from "../enums.ts";

/**
 * Append-only audit of collab opportunity and application transitions (mirrors
 * reel_brief_events). No updated_at and no deleted_at — events are immutable.
 */
@Entity("collab_events")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("CollabApplication", ["application_id"], ["id"], {
  name: "fk_collab_event_application",
  onDelete: "CASCADE",
})
@ForeignKey("CollabOpportunity", ["opportunity_id"], ["id"], {
  name: "fk_collab_event_opportunity",
  onDelete: "CASCADE",
})
@Index("idx_collab_events_opp", ["opportunity_id", "created_at"])
export class CollabEvent {
  @PrimaryGeneratedColumn("uuid") id!: string;

  @Column({ type: "uuid" }) opportunity_id!: string;
  /** Null for opportunity-level events (created, published, cancelled, expired). */
  @Column({ type: "uuid", nullable: true }) application_id!: string | null;
  /** CollabActor value. Varchar rather than a Postgres enum, matching
   *  reel_brief_events.actor. */
  @Column({ type: "varchar", length: 10 }) actor!: string;
  /** Null when the actor is `system` (the scheduled expiry and sweep jobs). */
  @Column({ type: "uuid", nullable: true }) actor_user_id!: string | null;
  @Column({ type: "enum", enum: CollabEventType }) event_type!: CollabEventType;
  @Column({ type: "bigint", nullable: true }) amount_fils_snapshot!: string | null;
  @Column({ type: "text", nullable: true }) note!: string | null;
  @Column({ type: "jsonb", nullable: true }) metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;
}
