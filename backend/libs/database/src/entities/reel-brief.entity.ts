import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ReelBriefStatus, ReelLicenseRightsScope } from "../enums.ts";

/** A vendor's open request for a UGC reel to be produced (Slice 3 brief/bid marketplace). */
@Entity("reel_briefs")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@Index("idx_brief_status_open", ["status", "bids_close_at"], { where: "deleted_at IS NULL" })
@Index("idx_brief_vendor", ["vendor_id"], { where: "deleted_at IS NULL" })
export class ReelBrief {
  @PrimaryGeneratedColumn("uuid") id!: string;

  @Column({ type: "uuid" }) vendor_id!: string;
  @Column({ type: "varchar", length: 200 }) title!: string;
  @Column({ type: "text" }) brief!: string;
  @Column({ type: "enum", enum: ReelLicenseRightsScope }) rights_scope!: ReelLicenseRightsScope;
  @Column({ type: "bigint", nullable: true }) budget_guide_fils!: string | null;
  @Column({ type: "uuid", nullable: true }) target_product_id!: string | null;
  @Column({ type: "varchar", length: 100, nullable: true }) target_category!: string | null;
  @Column({ type: "timestamptz" }) bids_close_at!: Date;
  @Column({ type: "enum", enum: ReelBriefStatus, default: ReelBriefStatus.open })
  status!: ReelBriefStatus;
  @Column({ type: "uuid", nullable: true }) awarded_bid_id!: string | null;

  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;
  @UpdateDateColumn({ type: "timestamptz" }) updated_at!: Date;
  @DeleteDateColumn({ type: "timestamptz", nullable: true }) deleted_at!: Date | null;
}
