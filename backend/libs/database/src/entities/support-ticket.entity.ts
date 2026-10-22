import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { TicketPriority, TicketStatus } from "../enums.ts";
import type { User } from "./user.entity.ts";

@Entity("support_tickets")
// Restored NoorLuna hand-written constraints (1792700000200-RestoreForkConstraints).
@Check("support_tickets_owner_present", "user_id IS NOT NULL OR guest_session IS NOT NULL")
export class SupportTicket {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true, where: "deleted_at IS NULL" })
  @Column({ type: "varchar", length: 30, unique: true })
  ticket_number!: string;

  @Column({ type: "uuid", nullable: true })
  user_id!: string | null;

  @ManyToOne("User", { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User | null;

  @Index("idx_support_tickets_guest_session", { where: "deleted_at IS NULL" })
  @Column({ type: "varchar", length: 255, nullable: true })
  guest_session!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  guest_email!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  guest_name!: string | null;

  @Index("idx_support_tickets_slack_thread", { where: "deleted_at IS NULL" })
  @Column({ type: "varchar", length: 64, nullable: true })
  slack_thread_ts!: string | null;

  @Column({ type: "varchar", length: 64, nullable: true })
  slack_channel_id!: string | null;

  @Column({ type: "uuid", nullable: true })
  assigned_to!: string | null;

  @ManyToOne("User", { nullable: true })
  @JoinColumn({ name: "assigned_to" })
  assignedToUser!: User | null;

  // Booking this ticket is about, if any (plain uuid, no relation).
  @Column({ type: "uuid", nullable: true })
  booking_id!: string | null;

  @Column({ type: "varchar", length: 255 })
  subject!: string;

  @Column({ type: "enum", enum: TicketStatus, default: TicketStatus.open })
  status!: TicketStatus;

  @Column({ type: "enum", enum: TicketPriority, default: TicketPriority.medium })
  priority!: TicketPriority;

  @Column({ type: "varchar", length: 100, nullable: true })
  category!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  resolved_at!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  @DeleteDateColumn({ type: "timestamptz", nullable: true })
  deleted_at!: Date | null;
}
