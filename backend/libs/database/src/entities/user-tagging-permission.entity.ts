import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ForeignKey,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ReelTaggingScope } from "../enums.ts";
import type { User } from "./user.entity.ts";

@Entity("user_tagging_permissions")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("User", ["granted_by"], ["id"], { name: "user_tagging_permissions_granted_by_fkey" })
@ForeignKey("Vendor", ["vendor_id"], ["id"], { name: "user_tagging_permissions_vendor_id_fkey" })
@Check(
  "ck_tagging_perm_scope",
  "scope = 'any_product' OR (scope = 'specific_brand' AND brand_id IS NOT NULL) OR (scope = 'specific_vendor' AND vendor_id IS NOT NULL) OR (scope = 'specific_products' AND product_ids IS NOT NULL)",
)
@Index("idx_tagging_permissions_user", ["user_id"])
export class UserTaggingPermission {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  user_id!: string;

  @ManyToOne("User")
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "enum", enum: ReelTaggingScope })
  scope!: ReelTaggingScope;

  @Column({ type: "uuid", nullable: true })
  brand_id!: string | null;

  @Column({ type: "uuid", nullable: true })
  vendor_id!: string | null;

  @Column({ type: "uuid", array: true, nullable: true })
  product_ids!: string[] | null;

  @Column({ type: "uuid" })
  granted_by!: string;

  @CreateDateColumn({ type: "timestamptz", name: "granted_at" })
  granted_at!: Date;

  @Column({ type: "timestamptz", nullable: true })
  expires_at!: Date | null;

  @Column({ type: "text", nullable: true })
  reason!: string | null;
}
