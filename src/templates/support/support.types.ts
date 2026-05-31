/**
 * Support Desk Template Types
 *
 * Template-specific types for the support desk template.
 * NO universal abstractions. NO shared ticket types.
 */

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type SenderType = 'customer' | 'owner' | 'system';

/**
 * Support desk template configuration.
 *
 * Stored in bot.config.supportDesk.
 */
export interface SupportDeskConfig {
  /** Business name displayed to customers */
  businessName: string;

  /** Auto-reply message sent when ticket is created */
  autoReplyMessage: string;

  /** Default assignee (Telegram username or owner ID) */
  defaultAssignee?: string;

  /** Ticket categories (comma-separated) */
  categories?: string;

  /** Notify owner on new ticket */
  notifyOnNewTicket: boolean;

  /** Owner Telegram Chat ID for notifications */
  ownerChatId?: string;
}

/**
 * Default support desk configuration.
 */
export const defaultSupportDeskConfig: SupportDeskConfig = {
  businessName: 'Support',
  autoReplyMessage: 'Thank you! Your ticket has been created. We\'ll get back to you soon.',
  notifyOnNewTicket: true,
};

/**
 * Ticket list item for operational views.
 */
export interface TicketListItem {
  id: string;
  subject: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  assignedTo: string | null;
  customerId: string;
  customerName: string | null;
  customerUsername: string | null;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ticket detail for operational views.
 */
export interface TicketDetail {
  id: string;
  botId: string;
  customerId: string;
  customerName: string | null;
  customerUsername: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  subject: string | null;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
  messages: TicketMessageItem[];
  availableActions: string[];
}

/**
 * Ticket message item for operational views.
 */
export interface TicketMessageItem {
  id: string;
  senderType: SenderType;
  senderName: string | null;
  message: string;
  isInternal: boolean;
  createdAt: Date;
}

/**
 * Available actions for a ticket based on its status.
 *
 * CANONICAL: Per support-desk-semantics.md Section 6.
 * Backend returns available actions. Frontend renders them.
 */
export function getTicketAvailableActions(status: TicketStatus): string[] {
  switch (status) {
    case 'open':
      return ['take', 'assign', 'resolve', 'close'];
    case 'in-progress':
      return ['assign', 'resolve', 'close'];
    case 'resolved':
      return ['close'];
    case 'closed':
      return [];
    default:
      return [];
  }
}
