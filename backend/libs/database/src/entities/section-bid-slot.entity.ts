import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { SectionType } from "./section-type.entity.ts";

@Entity("section_bid_slots")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@Check("section_bid_slots_max_slots_check", "max_slots > 0")
@Check("section_bid_slots_min_bid_fils_check", "min_bid_fils > 0")
export class SectionBidSlot {
  @PrimaryGeneratedColumn("uuid") id!: string;
  @Column({ type: "uuid" }) section_type_id!: string;
  @ManyToOne("SectionType") @JoinColumn({ name: "section_type_id" }) section_type!: SectionType;
  @Column({ type: "smallint" }) max_slots!: number;
  @Column({ type: "integer" }) min_bid_fils!: number;
  @Column({ type: "varchar", length: 20, default: "per_day" }) billing_model!: string;
  @CreateDateColumn({ type: "timestamptz" }) created_at!: Date;
  @UpdateDateColumn({ type: "timestamptz" }) updated_at!: Date;
}
