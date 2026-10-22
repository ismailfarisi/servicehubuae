import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ReelBriefBidStatus } from "../enums.ts";
import type { ReelBrief } from "./reel-brief.entity.ts";

/** A creator's auction bid on a brief; once accepted, the delivery vehicle. */
@Entity("reel_brief_bids")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@Index("idx_bid_brief", ["brief_id", "status"])
@Index("idx_bid_creator", ["creator_id"])
@Index("uq_bid_awarded", ["brief_id"], {
  unique: true,
  where: "status IN ('accepted', 'delivered', 'revision_requested')",
})
export class ReelBriefBid {
  @PrimaryGeneratedColumn("uuid") id!: string;

  @Column({ type: "uuid" }) brief_id!: string;
  @ManyToOne("ReelBrief", { onDelete: "CASCADE" })
  @JoinColumn({ name: "brief_id" })
  brief?: ReelBrief;

  @Column({ type: "uuid" }) creator_id!: string;
  @Column({ type: "bigint" }) amount_fils!: string;
  @Column({ type: "text" }) pitch!: string;
  @Column({ type: "enum", enum: ReelBriefBidStatus, default: ReelBriefBidStatus.pending })
  status!: ReelBriefBidStatus;

  @Column({ type: "uuid", nullable: true }) delivered_reel_id!: string | null;
  @Column({ type: "uuid", nullable: true }) grant_id!: string | null;
  @Column({ type: "timestamptz", nullable: true }) delivery_deadline_at!: Date | null;
  @Column({ type: "int", default: 0 }) delivery_round!: number;

  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;
  @UpdateDateColumn({ type: "timestamptz" }) updated_at!: Date;
}
