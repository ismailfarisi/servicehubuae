import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ForeignKey,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Reel } from "./reel.entity.ts";
import { User } from "./user.entity.ts";

@Entity("reel_views")
@Check('"completion_percentage" BETWEEN 0 AND 1')
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@ForeignKey("GuestSession", ["session_id"], ["id"], {
  name: "reel_views_session_id_fkey",
  onDelete: "SET NULL",
})
@Check("ck_reel_views_user_or_session", "user_id IS NOT NULL OR session_id IS NOT NULL")
@Index("idx_reel_views_user_recent", ["user_id", "viewed_at"], { where: "user_id IS NOT NULL" })
@Index("idx_reel_views_user_seen", ["user_id"], {
  where: "completion_percentage >= 0.5 AND user_id IS NOT NULL",
})
@Index("uq_reel_views_session_reel", ["session_id", "reel_id"], {
  unique: true,
  where: "user_id IS NULL AND session_id IS NOT NULL",
})
@Index("uq_reel_views_user_reel", ["user_id", "reel_id"], {
  unique: true,
  where: "user_id IS NOT NULL",
})
export class ReelView {
  @PrimaryColumn({ type: "uuid", default: () => "gen_random_uuid()" })
  id!: string;

  @Column({ type: "uuid", nullable: true })
  user_id!: string | null;

  @Column("uuid")
  reel_id!: string;

  @Column({ type: "uuid", nullable: true })
  session_id!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user?: User | null;

  @ManyToOne(() => Reel, { onDelete: "CASCADE" })
  @JoinColumn({ name: "reel_id" })
  reel?: Reel;

  @CreateDateColumn({ name: "viewed_at", type: "timestamptz" })
  viewed_at!: Date;

  @Column({ type: "numeric", precision: 6, scale: 2 })
  watch_duration_seconds!: string;

  @Column({ type: "numeric", precision: 5, scale: 4 })
  completion_percentage!: string;

  @Column({ type: "text", nullable: true })
  device_type?: string | null;
}
