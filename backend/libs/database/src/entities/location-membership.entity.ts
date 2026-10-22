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

// Per-location admin (RBAC), layered on the vendor-wide vendor_members.
@Entity("location_memberships")
@Index(["vendor_location_id", "user_id"], { unique: true, where: "deleted_at IS NULL" })
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("User", ["user_id"], ["id"], { name: "fk_lm_user" })
@ForeignKey("VendorLocation", ["vendor_location_id"], ["id"], {
  name: "fk_lm_location",
  onDelete: "CASCADE",
})
export class LocationMembership {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  vendor_location_id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  // Location-scoped role (e.g. manager, front_desk). Kept as varchar so the
  // location role vocabulary can evolve independently of vendor_member_role.
  @Column({ type: "varchar", length: 32 })
  role!: string;

  @Column({ type: "jsonb", default: [] })
  permissions!: string[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
