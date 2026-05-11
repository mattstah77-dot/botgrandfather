import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * AnalyticsEvent — lightweight event tracking for bot statistics.
 * PostgreSQL-first approach. No separate analytics DB.
 */
@Entity('analytics_events')
@Index(['botId', 'eventType'])
@Index(['createdAt'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column({ type: 'varchar', nullable: true })
  ownerId: string | null;

  @Column()
  eventType: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
