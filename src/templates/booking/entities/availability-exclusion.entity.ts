import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * AvailabilityExclusion — explicit date-range exclusions for provider availability.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This entity represents TRUTH about when a provider is explicitly unavailable.
 * It is NOT a projection. It is NOT computed. It is owner-configured.
 *
 * PURPOSE:
 * - Vacations (multi-day unavailability)
 * - Temporary breaks (single-day or partial-day)
 * - Holidays (bot-specific closures)
 * - Emergency closures
 *
 * FORBIDDEN:
 * - RRULE recurrence
 * - Universal calendar abstractions
 * - Metadata-driven scheduling
 * - Cross-template sharing
 *
 * TEMPORAL INVARIANTS:
 * - startAt and endAt are dates (YYYY-MM-DD), not datetimes
 * - Range is inclusive: [startAt, endAt]
 * - Null providerId = default provider
 *
 * CANONICAL: Per temporal-truth-contracts.md — exclusions are truth.
 */
@Entity('availability_exclusions')
@Index(['botId', 'providerId'])
@Index(['botId', 'startAt', 'endAt'])
export class AvailabilityExclusion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  botId: string;

  /**
   * Provider identifier.
   * null = default provider (single-provider setup)
   * string = specific provider (multi-provider setup)
   */
  @Column({ type: 'varchar', nullable: true })
  providerId: string | null;

  /**
   * Start date of exclusion (inclusive).
   * YYYY-MM-DD format.
   */
  @Column('date')
  startAt: string;

  /**
   * End date of exclusion (inclusive).
   * YYYY-MM-DD format.
   */
  @Column('date')
  endAt: string;

  /**
   * Optional reason for exclusion.
   * Examples: "Vacation", "Holiday", "Sick leave"
   */
  @Column({ type: 'varchar', nullable: true })
  reason: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
