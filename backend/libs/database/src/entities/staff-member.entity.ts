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

// A bookable resource (stylist/therapist). Staff = capacity.
@Entity("staff_members")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("User", ["user_id"], ["id"], { name: "fk_staff_members_user" })
@ForeignKey("Vendor", ["vendor_id"], ["id"], { name: "fk_staff_members_vendor" })
export class StaffMember {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index("idx_staff_members_vendor", { where: "deleted_at IS NULL" })
  @Column({ type: "uuid" })
  vendor_id!: string;

  // Nullable — a stylist need not be a MyPickUAE login user.
  @Column({ type: "uuid", nullable: true })
  user_id!: string | null;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "text", nullable: true })
  avatar_url!: string | null;

  @Column({ type: "text", nullable: true })
  bio!: string | null;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @Column({ type: "numeric", precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column({ type: "integer", default: 0 })
  rating_count!: number;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
