import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { CommissionStatus, CommissionType } from "../enums.ts";
import type { Booking } from "./booking.entity.ts";
import type { VendorPayout } from "./vendor-payout.entity.ts";
import type { Vendor } from "./vendor.entity.ts";

// Phase 4 Task 9 (spec §5.3 "commission ... accrued into the vendor_payout
// pipeline on completed"): a commission row is sourced EITHER from an order
// item (order_id/vendor_order_id/order_item_id, the original shape) OR from a
// booking (booking_id) — never both, never neither. `chk_commissions_order_or_booking`
// (1782300000000-CommissionBookingAccrual) enforces exactly one source is set;
// PayoutService.computePayoutTotals batches on vendor_id + status alone (it
// doesn't require order_id/vendor_order_id to be present — see that file), so a
// booking-sourced row flows through the SAME payout pipeline untouched.
@Entity("commissions")
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
