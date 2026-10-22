import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ReelFeaturePlacement } from "../enums.ts";
import type { ReelLicenseGrant } from "./reel-license-grant.entity.ts";

/** A vendor's pin of a licensed reel onto a product PDP or their storefront. Soft delete = unpin. */
@Entity("reel_license_features")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@Index("idx_rlf_product", ["product_id", "position"], { where: "deleted_at IS NULL" })
@Index("idx_rlf_vendor", ["vendor_id", "placement", "position"], { where: "deleted_at IS NULL" })
@Index("uq_rlf_storefront", ["grant_id", "placement"], {
  unique: true,
  where: "product_id IS NULL AND deleted_at IS NULL",
})
@Index("uq_rlf_surface", ["grant_id", "placement", "product_id"], {
  unique: true,
  where: "deleted_at IS NULL",
})
export class ReelLicenseFeature {
  @PrimaryGeneratedColumn("uuid") id!: string;

  @Column({ type: "uuid" }) grant_id!: string;
  @ManyToOne("ReelLicenseGrant", { onDelete: "CASCADE" })
  @JoinColumn({ name: "grant_id" })
  grant?: ReelLicenseGrant;

  @Column({ type: "uuid" }) reel_id!: string;
  @Column({ type: "uuid" }) vendor_id!: string;

  @Column({ type: "enum", enum: ReelFeaturePlacement }) placement!: ReelFeaturePlacement;
  @Column({ type: "uuid", nullable: true }) product_id!: string | null;
  @Column({ type: "int", default: 0 }) position!: number;

  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;
  @DeleteDateColumn({ type: "timestamptz", nullable: true }) deleted_at!: Date | null;
}
