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
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { ReelLicenseRightsScope } from "../enums.ts";
import type { ReelLicenseOffer } from "./reel-license-offer.entity.ts";
import type { Reel } from "./reel.entity.ts";

@Entity("reel_license_grants")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("ReelBriefBid", ["bid_id"], ["id"], {
  name: "fk_reel_license_grants_bid",
  onDelete: "CASCADE",
})
@ForeignKey("CollabApplication", ["collab_application_id"], ["id"], {
  name: "fk_reel_license_grants_collab_app",
  onDelete: "CASCADE",
})
@ForeignKey("User", ["creator_id"], ["id"], { name: "fk_rlg_creator", onDelete: "CASCADE" })
@ForeignKey("Vendor", ["vendor_id"], ["id"], { name: "fk_rlg_vendor", onDelete: "CASCADE" })
@Check("chk_reel_license_grants_link", "num_nonnulls(offer_id, bid_id, collab_application_id) = 1")
@Unique("uq_rlg_offer", ["offer_id"])
@Index("idx_reel_license_grants_bid", ["bid_id"], { where: "bid_id IS NOT NULL" })
@Index("idx_reel_license_grants_collab_app", ["collab_application_id"], {
  where: "collab_application_id IS NOT NULL",
})
@Index("idx_rlg_creator", ["creator_id"], { where: "deleted_at IS NULL" })
@Index("idx_rlg_vendor", ["vendor_id"], { where: "deleted_at IS NULL" })
export class ReelLicenseGrant {
  @PrimaryGeneratedColumn("uuid") id!: string;

  @Column({ type: "uuid", nullable: true }) offer_id!: string | null;
  @ManyToOne("ReelLicenseOffer", { onDelete: "CASCADE" })
  @JoinColumn({ name: "offer_id" })
  offer?: ReelLicenseOffer;

  @Column({ type: "uuid", nullable: true }) bid_id!: string | null;
  /** Third DealLink arm (spec §7). Exactly one of offer_id / bid_id /
   *  collab_application_id is set, enforced by chk_..._link. */
  @Column({ type: "uuid", nullable: true }) collab_application_id!: string | null;

  @Column({ type: "uuid" }) reel_id!: string;
  @ManyToOne("Reel", { onDelete: "CASCADE" }) @JoinColumn({ name: "reel_id" }) reel?: Reel;

  @Column({ type: "uuid" }) vendor_id!: string;
  @Column({ type: "uuid" }) creator_id!: string;

  @Column({ type: "enum", enum: ReelLicenseRightsScope }) scope!: ReelLicenseRightsScope;
  @Column({ type: "bigint" }) gross_fils!: string;
  @Column({ type: "bigint" }) platform_fee_fils!: string;
  @Column({ type: "bigint" }) creator_net_fils!: string;
  @Column({ type: "numeric", precision: 5, scale: 4 }) fee_rate_snapshot!: string;

  @Column({ type: "uuid", nullable: true }) wallet_transaction_id!: string | null;
  @Column({ type: "jsonb", default: () => "'{}'::jsonb" }) terms_snapshot!: Record<string, unknown>;

  @Column({ type: "timestamptz", nullable: true }) expires_at!: Date | null; // null = perpetual (2a default)
  @Column({ type: "timestamptz", nullable: true }) revoked_at!: Date | null;

  @CreateDateColumn({ type: "timestamptz" }) granted_at!: Date;
  @UpdateDateColumn({ type: "timestamptz" }) updated_at!: Date;
  @DeleteDateColumn({ type: "timestamptz", nullable: true }) deleted_at!: Date | null;
}
