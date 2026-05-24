import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Ticket entity — stores support desk ticket data.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Ticket is template-specific data. It references customers via customerId
 * but does NOT modify the universal Customer entity.
 *
 * Multi-tenant: every ticket belongs to exactly one bot.
 *
 * CONSTRAINTS:
 * - Index on (botId, status) for operational queries
 * - Index on (botId, createdAt) for list views
 * - Index on (customerId, status) for "existing open ticket" lookups
 */
@Entity('tickets')
@Index(['botId', 'status'])
@Index(['botId', 'createdAt'])
@Index(['customerId', 'status'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column()
  @Index()
  customerId: string;

  /**
   * Ticket lifecycle status.
   *
   * CANONICAL: Per support-desk-semantics.md Section 4.
   * - open:         Created, awaiting first response
   * - in-progress:  Agent is actively working
   * - resolved:     Agent provided solution, awaiting customer confirmation
   * - closed:       Confirmed resolved or auto-closed
   *
   * INVARIANT: resolved/closed can transition back to in-progress via reopen.
   * No persistent 'reopened' state — reopened is a transition event.
   */
  @Column({ type: 'varchar', default: 'open' })
  status: 'open' | 'in-progress' | 'resolved' | 'closed';

  @Column({ type: 'varchar', nullable: true })
  subject: string | null;

  @Column({ type: 'varchar', default: 'medium' })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string | null;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;
}
