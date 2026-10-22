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
} from "typeorm";
import { ReelLicenseFundingSource, ReelLicenseHoldStatus } from "../enums.ts";
import type { ReelLicenseOffer } from "./reel-license-offer.entity.ts";

@Entity("reel_license_escrow_holds")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("ReelBriefBid", ["bid_id"], ["id"], {
  name: "fk_reel_license_escrow_holds_bid",
  onDelete: "CASCADE",
})
@ForeignKey("CollabApplication", ["collab_application_id"], ["id"], {
  name: "fk_reel_license_escrow_holds_collab_app",
  onDelete: "CASCADE",
})
@Check(
  "chk_reel_license_escrow_holds_link",
  "num_nonnulls(offer_id, bid_id, collab_application_id) = 1",
)
@Index("idx_reel_license_escrow_holds_bid", ["bid_id"], { where: "bid_id IS NOT NULL" })
@Index("idx_reel_license_escrow_holds_collab_app", ["collab_application_id"], {
  where: "collab_application_id IS NOT NULL",
})
@Index("idx_rleh_vendor_payout_active", ["vendor_id"], {
  where:
    "funding_source = 'payout_balance' AND status IN ('held', 'captured') AND deleted_at IS NULL",
})
@Index("uq_rleh_idem", ["idempotency_key"], { unique: true })
export class ReelLicenseEscrowHold {
  @PrimaryGeneratedColumn("uuid") id!: string;

  @Column({ type: "uuid", nullable: true }) offer_id!: string | null;
  @ManyToOne("ReelLicenseOffer", { onDelete: "CASCADE" })
  @JoinColumn({ name: "offer_id" })
  offer?: ReelLicenseOffer;

  @Column({ type: "uuid", nullable: true }) bid_id!: string | null;
  /** Third DealLink arm (spec §7). Exactly one of offer_id / bid_id /
   *  collab_application_id is set, enforced by chk_..._link. */
  @Column({ type: "uuid", nullable: true }) collab_application_id!: string | null;

  @Column({ type: "uuid" }) vendor_id!: string;
  @Column({ type: "enum", enum: ReelLicenseFundingSource })
  funding_source!: ReelLicenseFundingSource;
  @Column({ type: "bigint" }) amount_fils!: string;
  @Column({ type: "enum", enum: ReelLicenseHoldStatus, default: ReelLicenseHoldStatus.held })
  status!: ReelLicenseHoldStatus;

  @Column({ type: "text", nullable: true }) stripe_payment_intent_id!: string | null;
  @Column({ type: "text" }) idempotency_key!: string;

  // Payout-balance settlement tracking: set when a captured payout-balance hold
  // has been netted into a vendor payout (see order-service payout.service).
  @Column({ type: "uuid", nullable: true }) settled_payout_id!: string | null;

  @Column({ type: "timestamptz", nullable: true }) captured_at!: Date | null;
  @Column({ type: "timestamptz", nullable: true }) released_at!: Date | null;

  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;
  @DeleteDateColumn({ type: "timestamptz", nullable: true }) deleted_at!: Date | null;
}
