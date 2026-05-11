import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Customer — universal platform entity representing any bot user.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Customer is the shared CRM-like layer across ALL templates.
 * Lead, Booking, Subscriber are template-specific views on top of Customer.
 *
 * Multi-tenant: every Customer belongs to exactly one bot.
 */
@Entity('customers')
@Index(['botId', 'telegramUserId'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column({ type: 'bigint' })
  @Index()
  telegramUserId: bigint;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  /**
   * Universal lifecycle status.
   * new      — first interaction, no conversion yet
   * active   — ongoing engagement
   * converted — completed a goal (lead, booking, purchase, etc.)
   */
  @Column({ type: 'varchar', default: 'new' })
  status: 'new' | 'active' | 'converted';

  /**
   * Owner-managed tags for lightweight CRM segmentation.
   * Stored as simple text array. No complex taxonomy for MVP.
   */
  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  /**
   * Owner-managed notes.
   */
  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
