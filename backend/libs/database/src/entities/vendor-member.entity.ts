import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ForeignKey,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { VendorMemberRole, VendorMemberStatus } from "../enums.ts";
import type { User } from "./user.entity.ts";
import type { Vendor } from "./vendor.entity.ts";

@Entity("vendor_members")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("User", ["invited_by_user_id"], ["id"], {
  name: "FK_vendor_members_invited_by",
  onDelete: "SET NULL",
})
@ForeignKey("User", ["revoked_by_user_id"], ["id"], {
  name: "FK_vendor_members_revoked_by",
  onDelete: "SET NULL",
})
@Index("idx_vendor_members_user_status", ["user_id", "status"], { where: "deleted_at IS NULL" })
@Index("uq_vendor_members_active", ["vendor_id", "user_id"], {
  unique: true,
  where: "status = 'active' AND deleted_at IS NULL",
})
@Index("uq_vendor_members_active_owner", ["vendor_id"], {
  unique: true,
  where: "role = 'owner' AND status = 'active' AND deleted_at IS NULL",
})
@Index("uq_vendor_members_invite_token", ["invite_token"], {
  unique: true,
  where: "invite_token IS NOT NULL",
})
@Index("uq_vendor_members_pending_email", { synchronize: false })
export class VendorMember {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  vendor_id!: string;

  @ManyToOne("Vendor", { onDelete: "CASCADE" })
  @JoinColumn({ name: "vendor_id" })
  vendor!: Vendor;

  @Column({ type: "uuid", nullable: true })
  user_id!: string | null;

  @ManyToOne("User", { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "user_id" })
  user!: User | null;

  @Column({ type: "varchar", length: 255 })
  email!: string;

  @Column({ type: "enum", enum: VendorMemberRole })
  role!: VendorMemberRole;

  @Column({ type: "enum", enum: VendorMemberStatus, default: VendorMemberStatus.pending })
  status!: VendorMemberStatus;

  @Column({ type: "varchar", length: 64, nullable: true })
  invite_token!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  invite_expires_at!: Date | null;

  @Column({ type: "uuid", nullable: true })
  invited_by_user_id!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  accepted_at!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  revoked_at!: Date | null;

  @Column({ type: "uuid", nullable: true })
  revoked_by_user_id!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
