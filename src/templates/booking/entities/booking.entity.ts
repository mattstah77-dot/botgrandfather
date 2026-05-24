import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

/**
 * Booking entity — stores booking data from the booking template.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Booking is template-specific data. It references users via botId + userId
 * but does NOT modify the universal Customer entity.
 *
 * Multi-tenant: every booking belongs to exactly one bot.
 *
 * CONSTRAINTS:
 * - Unique (botId, date, timeSlot) prevents double-booking
 * - Index on (botId, status) for operational queries
 * - Index on (botId, date) for calendar views
 */
@Entity('bookings')
@Index(['botId', 'status'])
@Index(['botId', 'date'])
@Unique(['botId', 'date', 'timeSlot'])
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

  @Column({ type: 'varchar', default: 'UTC' })
  timezone: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
