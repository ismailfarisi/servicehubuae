import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

// A UAE locality customers pick on the storefront ("Dubai Marina", "Al Reem
// Island"). Vendor branches (vendor_locations.area_id) and home-visit coverage
// (service_areas.area_id) point at these rows, and the service search index
// resolves area names/slugs from here.
@Entity("areas")
export class Area {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Index("uq_areas_slug", { unique: true, where: "deleted_at IS NULL" })
  @Column({ type: "varchar", length: 255 })
  slug!: string;

  @Column({ type: "varchar", length: 100 })
  city!: string;

  @Column({ type: "varchar", length: 50 })
  emirate!: string;

  @Column({ type: "char", length: 2, default: "AE" })
  country_code!: string;

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @Column({ type: "integer", default: 0 })
  sort_order!: number;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
