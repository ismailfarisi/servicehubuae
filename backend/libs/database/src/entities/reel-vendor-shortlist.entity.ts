import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { Reel } from "./reel.entity.ts";
import type { User } from "./user.entity.ts";
import type { Vendor } from "./vendor.entity.ts";

@Entity("reel_vendor_shortlists")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@Index("idx_reel_vendor_shortlists_vendor", ["vendor_id"], { where: "deleted_at IS NULL" })
@Index("uq_reel_vendor_shortlists_active", ["vendor_id", "reel_id"], {
  unique: true,
  where: "deleted_at IS NULL",
})
export class ReelVendorShortlist {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  vendor_id!: string;

  @ManyToOne("Vendor", { onDelete: "CASCADE" })
  @JoinColumn({ name: "vendor_id" })
  vendor?: Vendor;

  @Column({ type: "uuid" })
  reel_id!: string;

  @ManyToOne("Reel", { onDelete: "CASCADE" })
  @JoinColumn({ name: "reel_id" })
  reel?: Reel;

  @Column({ type: "uuid" })
  saved_by_user_id!: string;

  @ManyToOne("User", { onDelete: "CASCADE" })
  @JoinColumn({ name: "saved_by_user_id" })
  saved_by_user?: User;

  @Column({ type: "text", nullable: true })
  note!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
