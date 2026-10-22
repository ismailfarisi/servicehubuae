import { Column, Entity, ForeignKey, PrimaryColumn } from "typeorm";

@Entity("vendor_ai_usage")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("Vendor", ["vendor_id"], ["id"], {
  name: "vendor_ai_usage_vendor_id_fkey",
  onDelete: "CASCADE",
})
export class VendorAiUsage {
  @PrimaryColumn({ type: "uuid" })
  vendor_id!: string;

  @PrimaryColumn({ type: "char", length: 7 })
  month!: string;

  @Column({ type: "integer", default: 0 })
  count!: number;
}
