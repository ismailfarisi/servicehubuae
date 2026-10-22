import {
  Column,
  CreateDateColumn,
  Entity,
  ForeignKey,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("daily_vendor_reel_metrics")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("Vendor", ["vendor_id"], ["id"], {
  name: "daily_vendor_reel_metrics_vendor_id_fkey",
  onDelete: "CASCADE",
})
@Index("idx_dvrm_bucket_date", ["bucket_date"])
export class DailyVendorReelMetrics {
  @PrimaryColumn({ type: "uuid" })
  vendor_id!: string;

  @PrimaryColumn({ type: "date" })
  bucket_date!: string;

  @Column({ type: "int", default: 0 })
  reel_count!: number;

  @Column({ type: "int", default: 0 })
  impressions!: number;

  @Column({ type: "int", default: 0 })
  product_taps!: number;

  @Column({ type: "int", default: 0 })
  attributed_orders!: number;

  @Column({ type: "bigint", default: 0 })
  attributed_gmv_fils!: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;
}
