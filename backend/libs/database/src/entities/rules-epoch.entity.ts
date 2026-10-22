import { Check, Column, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity("rules_epoch")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@Check("rules_epoch_id_check", "id = 1")
export class RulesEpoch {
  @PrimaryColumn({ type: "smallint", default: 1 })
  id!: 1;

  @Column({
    type: "bigint",
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
  })
  epoch!: number;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;
}
