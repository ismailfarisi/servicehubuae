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

// M:N — which offerings a staff member is eligible to perform.
@Entity("staff_services")
@Index(["staff_member_id", "service_offering_id"], { unique: true, where: "deleted_at IS NULL" })
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("ServiceOffering", ["service_offering_id"], ["id"], {
  name: "fk_staff_services_offering",
  onDelete: "CASCADE",
})
@ForeignKey("StaffMember", ["staff_member_id"], ["id"], {
  name: "fk_staff_services_staff",
  onDelete: "CASCADE",
})
export class StaffService {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  staff_member_id!: string;

  @Column({ type: "uuid" })
  service_offering_id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
