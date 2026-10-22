import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ForeignKey,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { LayoutStatus } from "../enums.ts";
import type { LayoutVersion } from "./layout-version.entity.ts";
import type { Vendor } from "./vendor.entity.ts";

@Entity("page_layouts")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("User", ["created_by"], ["id"], { name: "page_layouts_created_by_fkey" })
@Index("idx_page_layouts_vendor", ["vendor_id"], { where: "deleted_at IS NULL" })
@Index("uq_page_layouts_admin_slug", ["slug"], {
  unique: true,
  where: "vendor_id IS NULL AND deleted_at IS NULL",
})
@Index("uq_page_layouts_vendor_slug", ["vendor_id", "slug"], {
  unique: true,
  where: "vendor_id IS NOT NULL AND deleted_at IS NULL",
})
export class PageLayout {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ type: "varchar", length: 255, unique: true }) slug!: string;
  @Column({ type: "uuid", nullable: true }) vendor_id!: string | null;
  @ManyToOne("Vendor", { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "vendor_id" })
  vendor!: Vendor | null;
  @Column({ type: "jsonb" }) title!: Record<string, string>;
  @Column({ type: "enum", enum: LayoutStatus, default: LayoutStatus.draft })
  status!: LayoutStatus;
  @Column({ type: "uuid", nullable: true }) published_version_id!: string | null;
  @ManyToOne("LayoutVersion", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "published_version_id" })
  published_version!: LayoutVersion | null;
  @Column({ type: "uuid", nullable: true }) draft_version_id!: string | null;
  @ManyToOne("LayoutVersion", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "draft_version_id" })
  draft_version!: LayoutVersion | null;
  @Column({ type: "uuid" }) created_by!: string;
  @OneToMany("LayoutVersion", "layout") versions!: LayoutVersion[];
  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;
  @UpdateDateColumn({ type: "timestamptz" }) updated_at!: Date;
  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
