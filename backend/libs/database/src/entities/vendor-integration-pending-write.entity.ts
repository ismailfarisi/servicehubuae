import {
  Column,
  CreateDateColumn,
  Entity,
  ForeignKey,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("vendor_integration_pending_writes")
@Index("vipw_status_idx", ["integration_id", "status"])
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("VendorIntegrationDelivery", ["delivery_id"], ["id"], {
  name: "vendor_integration_pending_writes_delivery_id_fkey",
  onDelete: "CASCADE",
})
@ForeignKey("VendorIntegration", ["integration_id"], ["id"], {
  name: "vendor_integration_pending_writes_integration_id_fkey",
  onDelete: "CASCADE",
})
export class VendorIntegrationPendingWrite {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  integration_id!: string;

  @Column({ type: "uuid" })
  delivery_id!: string;

  @Column({ type: "varchar", length: 32 })
  kind!: string;

  @Column({ type: "jsonb" })
  payload!: Record<string, unknown>;

  @Column({ type: "varchar", length: 16, default: "pending" })
  status!: string;

  @Column({ type: "boolean", default: false })
  auto_apply_threshold_breached!: boolean;

  @Column({ type: "uuid", nullable: true })
  reviewed_by!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  reviewed_at!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  applied_at!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}
