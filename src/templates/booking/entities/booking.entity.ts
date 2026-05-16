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
   * pending   — booking created, awaiting confirmation (if manual confirmation needed)
   * confirmed — booking is active
   * cancelled — booking was cancelled
   * completed — appointment was fulfilled
   */
  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';

  @Column({ type: 'varchar', default: 'UTC' })
  timezone: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
