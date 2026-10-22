import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

// Recurring weekly availability rule (expanded to concrete UTC windows by the
// Phase 3 availability engine, DST-correct via the location timezone).
@Entity("staff_working_hours")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("VendorLocation", ["location_id"], ["id"], {
  name: "fk_swh_location",
  onDelete: "CASCADE",
})
@ForeignKey("StaffMember", ["staff_member_id"], ["id"], {
  name: "fk_swh_staff",
  onDelete: "CASCADE",
})
export class StaffWorkingHours {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("idx_swh_staff", { where: "deleted_at IS NULL" })
  @Column({ type: "uuid" })
  staff_member_id!: string;

  // null = mobile / home-visit (no fixed branch).
  @Column({ type: "uuid", nullable: true })
  location_id!: string | null;

  @Column({ type: "smallint" })
  day_of_week!: number;

  @Column({ type: "time" })
  start_time!: string;

  @Column({ type: "time" })
  end_time!: string;

  @Column({ type: "date", nullable: true })
  effective_from!: string | null;

  @Column({ type: "date", nullable: true })
  effective_to!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
