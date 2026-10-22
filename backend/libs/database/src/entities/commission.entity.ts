import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CommissionStatus, CommissionType } from "../enums.ts";
import type { Booking } from "./booking.entity.ts";
import type { VendorPayout } from "./vendor-payout.entity.ts";
import type { Vendor } from "./vendor.entity.ts";

// Spec §5.3 ("commission ... accrued into the vendor_payout pipeline on
// completed"): a commission row is sourced from a booking (booking_id). The
// order-sourced columns and NoorLuna's `chk_commissions_order_or_booking` were
// dropped with the commerce tables; booking_id stays nullable at the column
// level. Payout batching keys on vendor_id + status alone.
//
// vendor_id keeps NO ACTION on delete (NoorLuna cascaded): a hard delete of a
// vendor with commission history must fail rather than erase the ledger.
//
// A booking accrues at most one commission row: `uq_commissions_booking`
// (1792700000100-CommissionBookingUnique) is the conflict target of the
// booking payment gateway's idempotent INSERT ... ON CONFLICT DO NOTHING.
@Entity("commissions")
@Index("uq_commissions_booking", ["booking_id"], {
  unique: true,
  where: '"booking_id" IS NOT NULL',
})
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@Index("idx_commissions_payable", ["vendor_id", "status", "settle_after"], {
  where: "payout_id IS NULL AND deleted_at IS NULL",
})
export class Commission {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  vendor_id!: string;

  @ManyToOne("Vendor")
  @JoinColumn({ name: "vendor_id" })
  vendor!: Vendor;

  // Booking-sourced commission.
  @Column({ type: "uuid", nullable: true })
  booking_id!: string | null;

  @ManyToOne("Booking", { nullable: true })
  @JoinColumn({ name: "booking_id" })
  booking!: Booking | null;

  @Column({ type: "uuid", nullable: true })
  payout_id!: string | null;

  @ManyToOne("VendorPayout", { nullable: true })
  @JoinColumn({ name: "payout_id" })
  payout!: VendorPayout | null;

  @Column({ type: "enum", enum: CommissionType })
  commission_type!: CommissionType;

  @Column({ type: "numeric", precision: 8, scale: 4 })
  commission_rate!: number;

  @Column({ type: "integer" })
  item_total!: number;

  @Column({ type: "integer" })
  commission_amount!: number;

  @Column({ type: "integer", default: 0 })
  tax_on_commission!: number;

  @Column({ type: "integer" })
  vendor_earning!: number;

  @Column({ type: "char", length: 3, default: "AED" })
  currency!: string;

  @Column({ type: "enum", enum: CommissionStatus, default: CommissionStatus.pending })
  status!: CommissionStatus;

  /**
   * When this commission becomes payable. Null = not yet earned (the
   * vendor_order has not been delivered, or was un-delivered). Stamped as
   * delivered_at + the vendor's settlement window; the settlement job flips
   * `held` → `pending` once it matures.
   */
  @Column({ type: "timestamptz", nullable: true })
  settle_after!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  approved_at!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  paid_at!: Date | null;

  @Column({ type: "integer", default: 0 })
  adjustment_amount!: number;

  @Column({ type: "text", nullable: true })
  adjustment_reason!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
