import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * TicketMessage entity — stores ticket message history.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Messages are template-specific data. They belong to a ticket
 * and reference the ticket via ticketId.
 *
 * Multi-tenant: messages inherit tenancy from parent ticket.
 *
 * CONSTRAINTS:
 * - Index on (ticketId, createdAt) for message history retrieval
 */
@Entity('ticket_messages')
@Index(['ticketId', 'createdAt'])
export class TicketMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  @Index()
  ticketId: string;

  /**
   * Sender type.
   *
   * CANONICAL: Per support-desk-semantics.md Section 6.
   * - customer: Message from Telegram user
   * - owner: Message from bot owner/agent
   * - system: System-generated message (e.g., status change)
   */
  @Column({ type: 'varchar' })
  senderType: 'customer' | 'owner' | 'system';

  @Column({ type: 'bigint' })
  senderId: bigint;

  @Column({ type: 'text' })
  message: string;

  /**
   * Internal note flag.
   *
   * If true, message is visible only to owner/agents, NOT to customer.
   * Used for internal team communication.
   */
  @Column({ type: 'boolean', default: false })
  isInternal: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
