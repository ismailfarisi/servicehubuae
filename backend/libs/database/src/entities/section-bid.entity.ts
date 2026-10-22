import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ForeignKey,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BidStatus } from "../enums.ts";
import type { LayoutSection } from "./layout-section.entity.ts";

@Entity("section_bids")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("Vendor", ["vendor_id"], ["id"], { name: "section_bids_vendor_id_fkey" })
@Check("chk_bid_dates", "expires_at > starts_at")
@Check("section_bids_bid_amount_fils_check", "bid_amount_fils > 0")
@Index("idx_section_bids_active", ["section_id", "status", "expires_at"], {
  where: "status = 'won'",
})
@Index("idx_section_bids_section", ["section_id", "status"])
@Index("idx_section_bids_vendor", ["vendor_id", "status"])
export class SectionBid {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ type: "uuid" }) section_id!: string;
  @ManyToOne("LayoutSection", { onDelete: "CASCADE" })
  @JoinColumn({ name: "section_id" })
  section!: LayoutSection;
  @Column({ type: "uuid" }) vendor_id!: string;
  @Column({ type: "integer" }) bid_amount_fils!: number;
  @Column({ type: "enum", enum: BidStatus, default: BidStatus.pending }) status!: BidStatus;
  @Column({ type: "uuid", nullable: true }) product_id!: string | null;
  @Column({ type: "jsonb", nullable: true }) content!: Record<string, unknown> | null;
  @Column({ type: "timestamptz" }) starts_at!: Date;
  @Column({ type: "timestamptz" }) expires_at!: Date;
  @Column({ type: "varchar", length: 50, nullable: true }) cancellation_reason!: string | null;
  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;
  @UpdateDateColumn({ type: "timestamptz" }) updated_at!: Date;
}
