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
 * ProviderAvailability — booking-template-specific working hours configuration.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This entity is booking-template-specific. It is NOT a universal scheduling
 * entity. It represents explicit weekly availability ONLY.
 *
 * FORBIDDEN:
 * - RRULE recurrence
 * - Universal calendar abstractions
 * - Metadata-driven scheduling
 * - Cross-template sharing
 *
 * PURPOSE:
 * - Store provider working hours per weekday
 * - Support excluded dates (holidays, breaks)
 * - Enable explicit slot generation
 *
 * DESIGN DECISIONS:
 * - Weekly availability ONLY (no recurrence engine)
 * - Simple startTime/endTime per day
 * - Excluded dates as JSON array (rarely changed)
 * - Optional providerId (null = default provider)
 *
 * TEMPORAL INVARIANTS:
 * - startTime/endTime are in provider timezone (HH:MM format)
 * - timezone stored on Bot entity, not here
 * - No DST handling — timezone-aware library handles display
 */
@Entity('provider_availability')
@Unique(['botId', 'providerId', 'weekday'])
@Index(['botId'])
export class ProviderAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  /**
   * Provider identifier.
   * null = default provider (single-provider setup)
   * string = specific provider (multi-provider setup)
   */
  @Column({ nullable: true })
  providerId: string | null;

  @Column()
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

  @Column({ nullable: true })
  startTime: string | null;  // HH:MM in provider timezone

  @Column({ nullable: true })
  endTime: string | null;  // HH:MM in provider timezone

  @Column({ default: true })
  isWorkingDay: boolean;

  /**
   * Excluded dates for this weekday.
   * Array of YYYY-MM-DD strings representing holidays/breaks.
   * Example: ['2024-12-25', '2025-01-01']
   */
  @Column({ type: 'jsonb', default: [] })
  excludedDates: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
