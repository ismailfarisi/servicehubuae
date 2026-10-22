import {
  Column,
  CreateDateColumn,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

// Mirrors order_status_history — an immutable audit trail of booking lifecycle
// transitions (spec §4.3). from_status/to_status are kept as free-text rather
// than the bookings_status_enum type, same rationale as OrderStatusHistory:
// decouples the history table from enum-type ALTERs.
@Entity("booking_status_history")
@Index(["booking_id", "created_at"])
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("User", ["actor_id"], ["id"], { name: "fk_booking_status_history_actor" })
@ForeignKey("Booking", ["booking_id"], ["id"], {
  name: "fk_booking_status_history_booking",
  onDelete: "CASCADE",
})
export class BookingStatusHistory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  booking_id!: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  from_status!: string | null;

  @Column({ type: "varchar", length: 50 })
  to_status!: string;

  @Column({ type: "uuid", nullable: true })
  actor_id!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  actor_role!: string | null;

  @Column({ type: "text", nullable: true })
  reason!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}
