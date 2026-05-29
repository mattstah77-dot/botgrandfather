import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Booking entity — canonical temporal record for the booking capability.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Booking is template-specific data. It references users via botId + userId
 * but does NOT modify the universal Customer entity.
 *
 * Multi-tenant: every booking belongs to exactly one bot.
 *
 * TEMPORAL AUTHORITY:
 * Booking entity is TRUTH. Projections are computed from it.
 * Slots are NEVER persisted. Only bookings are authoritative.
 *
 * CONSTRAINTS:
 * - Partial unique index on (botId, date, timeSlot) WHERE status IN ('pending', 'confirmed')
 *   prevents double-booking while allowing re-booking cancelled slots.
 * - Index on (botId, status) for operational queries
 * - Index on (botId, date) for calendar views
 * - Index on (botId, providerId) for provider queries
 *
 * CANONICAL: Per temporal-truth-contracts.md, occupancy-contracts.md,
 * write-time-validation-contracts.md.
 */
@Entity('bookings')
@Index(['botId', 'status'])
@Index(['botId', 'date'])
@Index(['botId', 'providerId'])
@Index(['botId', 'date', 'timeSlot'], { unique: true, where: "status IN ('pending', 'confirmed')" })
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column({ type: 'bigint' })
  @Index()
  userId: bigint;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  /**
   * Provider identifier.
   * null = default provider (single-provider setup)
   * string = specific provider (multi-provider future)
   */
  @Column({ nullable: true })
  providerId: string | null;

  @Column()
  serviceId: string;

  @Column()
  serviceName: string;

  @Column()
  date: string; // YYYY-MM-DD

  @Column()
  timeSlot: string; // HH:MM

  @Column({ type: 'int' })
  durationMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number | null;

  /**
   * Booking lifecycle status.
   *
   * CANONICAL: Per booking-temporal-semantics.md Section 6.
   * - pending:   Created, awaiting confirmation (if manual confirmation needed)
   * - confirmed: Confirmed and active
   * - cancelled: Cancelled by customer or owner
   * - completed: Appointment occurred (past end time)
   * - no-show:   Customer did not attend (owner-marked)
   *
   * INVARIANT: Once cancelled/completed/no-show, status cannot transition back.
   */
  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

  /**
   * Optional notes for the booking.
   * Customer or owner may add notes.
   */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', default: 'UTC' })
  timezone: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
