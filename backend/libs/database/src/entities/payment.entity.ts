import {
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
import { PaymentMethod, PaymentStatus } from "../enums.ts";
import type { User } from "./user.entity.ts";

@Entity("payments")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("Booking", ["booking_id"], ["id"], { name: "fk_payments_booking" })
@Index("idx_payments_booking", ["booking_id"], { where: "booking_id IS NOT NULL" })
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // Booking this payment belongs to. Kept as a plain uuid (no relation) so the
  // payment and booking entity modules stay independent.
  @Column({ type: "uuid", nullable: true })
  booking_id!: string | null;

  @Column({ type: "uuid" })
  user_id!: string;

  @ManyToOne("User")
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.pending })
  status!: PaymentStatus;

  @Column({ type: "enum", enum: PaymentMethod })
  payment_method!: PaymentMethod;

  @Column({ type: "integer" })
  amount!: number;

  @Column({ type: "char", length: 3, default: "AED" })
  currency!: string;

  @Column({ type: "varchar", length: 50 })
  gateway!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  gateway_transaction_id!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  gateway_payment_id!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  gateway_order_id!: string | null;

  @Column({ type: "jsonb", nullable: true })
  gateway_response!: Record<string, unknown> | null;

  @Column({ type: "char", length: 4, nullable: true })
  card_last4!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  card_brand!: string | null;

  @Column({ type: "varchar", length: 7, nullable: true })
  card_expiry!: string | null;

  @Column({ type: "integer", default: 0 })
  refunded_amount!: number;

  @Column({ type: "text", nullable: true })
  refund_reason!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  refunded_at!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  authorized_at!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  captured_at!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  failed_at!: Date | null;

  @Column({ type: "text", nullable: true })
  failure_reason!: string | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip_address!: string | null;

  @Column({ type: "boolean", default: false })
  is_test!: boolean;

  @Column({ type: "varchar", length: 50, nullable: true })
  three_ds_status!: string | null;

  @Column({ type: "varchar", length: 1024, nullable: true })
  three_ds_redirect_url!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
