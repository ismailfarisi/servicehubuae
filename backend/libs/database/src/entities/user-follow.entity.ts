import {
  Check,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./user.entity.ts";

@Entity("user_follows")
@Check(`"follower_id" <> "followee_id"`)
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@Index("idx_user_follows_followee", ["followee_id", "followed_at"])
export class UserFollow {
  @PrimaryColumn("uuid")
  follower_id!: string;

  @PrimaryColumn("uuid")
  followee_id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "follower_id" })
  follower?: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "followee_id" })
  followee?: User;

  @CreateDateColumn({ name: "followed_at", type: "timestamptz" })
  followed_at!: Date;
}
