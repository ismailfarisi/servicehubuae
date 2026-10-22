import {
  Column,
  CreateDateColumn,
  Entity,
  ForeignKey,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import type { LayoutSection } from "./layout-section.entity.ts";
import type { PageLayout } from "./page-layout.entity.ts";

@Entity("layout_versions")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("User", ["created_by"], ["id"], { name: "layout_versions_created_by_fkey" })
@Unique("uq_layout_version", ["layout_id", "version_number"])
export class LayoutVersion {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ type: "uuid" }) layout_id!: string;
  @ManyToOne("PageLayout", "versions", { onDelete: "CASCADE" })
  @JoinColumn({ name: "layout_id" })
  layout!: PageLayout;
  @Column({ type: "integer" }) version_number!: number;
  @Column({ type: "timestamptz", nullable: true }) publish_at!: Date | null;
  @Column({ type: "timestamptz", nullable: true }) published_at!: Date | null;
  @Column({ type: "uuid" }) created_by!: string;
  @OneToMany("LayoutSection", "version") sections!: LayoutSection[];
  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;
}
