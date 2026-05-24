import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { Customer } from '../../customer/entities/customer.entity';
import {
  DashboardCapabilityProvider,
  CapabilityMetrics,
} from '../../dashboard/interfaces/dashboard-capability-provider.interface';
import {
  TicketListItem,
  TicketDetail,
  TicketMessageItem,
  getTicketAvailableActions,
} from './support.types';

/**
 * SupportQueryService — operational data access for the support desk template.
 *
 * RESPONSIBILITY:
 * - Read-only queries for Mini App dashboards
 * - Ticket lists, counts, message history
 * - Dashboard capability metrics (implements DashboardCapabilityProvider)
 *
 * DOES NOT:
 * - Handle Telegram conversations
 * - Create or modify tickets (see SupportRuntimeService)
 * - Send messages
 * - Implement SLA tracking
 *
 * USED BY:
 * - SupportDashboardController (Mini App)
 * - DashboardService (via DashboardCapabilityRegistry)
 */
@Injectable()
export class SupportQueryService implements DashboardCapabilityProvider {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketMessage)
    private readonly ticketMessageRepository: Repository<TicketMessage>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  /**
   * DashboardCapabilityProvider: capability key.
   */
  getCapabilityKey(): string {
    return 'support';
  }

  /**
   * DashboardCapabilityProvider: owner-level metrics.
   * Returns total ticket count across all owner's bots.
   *
   * MULTI-TENANT: Joins with Bot entity to filter by ownerId.
   */
  async getOwnerMetrics(ownerId: string): Promise<CapabilityMetrics> {
    const count = await this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('bot', 'bot', 'ticket.botId = bot.id')
      .where('bot.ownerId = :ownerId', { ownerId })
      .getCount();

    return {
      capability: this.getCapabilityKey(),
      total: count,
    };
  }

  /**
   * DashboardCapabilityProvider: bot-level metrics.
   * Returns ticket count for a specific bot.
   */
  async getBotMetrics(botId: string): Promise<CapabilityMetrics> {
    const count = await this.ticketRepository.count({ where: { botId } });
    return {
      capability: this.getCapabilityKey(),
      total: count,
    };
  }

  /**
   * Get tickets for a bot with pagination, filtering, and sorting.
   *
   * OPERATIONAL FILTERING:
   * - status: filter by ticket status
   * - search: filter by subject or customer username (case-insensitive)
   * - sort: 'newest' | 'oldest' | 'priority' (default: newest)
   */
  async getBotTickets(
    botId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
    sort?: string,
  ): Promise<{ items: TicketListItem[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.ticketRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect(Customer, 'c', 't.customerId = c.id')
      .where('t.botId = :botId', { botId });

    if (status) {
      queryBuilder.andWhere('t.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(t.subject) LIKE :search OR LOWER(c.username) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    // Sorting
    if (sort === 'oldest') {
      queryBuilder.orderBy('t.createdAt', 'ASC');
    } else if (sort === 'priority') {
      queryBuilder.orderBy(
        `CASE t.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END`,
        'ASC',
      );
    } else {
      // Default: newest first
      queryBuilder.orderBy('t.createdAt', 'DESC');
    }

    queryBuilder.skip(skip).take(limit);

    const [tickets, total] = await queryBuilder.getManyAndCount();

    // Get message counts for each ticket
    const ticketIds = tickets.map((t) => t.id);
    const messageCounts = await this.getMessageCounts(ticketIds);

    const items: TicketListItem[] = tickets.map((ticket) => ({
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      assignedTo: ticket.assignedTo,
      customerId: ticket.customerId,
      customerName: null, // Populated below
      customerUsername: null,
      messageCount: messageCounts[ticket.id] || 0,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }));

    // Populate customer info
    await this.populateCustomerInfo(items);

    const pages = Math.ceil(total / limit);

    return {
      items,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get a single ticket by ID with full detail.
   */
  async getTicketById(botId: string, ticketId: string): Promise<TicketDetail | null> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, botId },
    });

    if (!ticket) {
      return null;
    }

    // Get messages
    const messages = await this.ticketMessageRepository.find({
      where: { ticketId: ticket.id },
      order: { createdAt: 'ASC' },
    });

    // Get customer info
    const customer = await this.customerRepository.findOne({
      where: { id: ticket.customerId },
    });

    const messageItems: TicketMessageItem[] = await Promise.all(
      messages.map(async (msg) => {
        let senderName: string | null = null;
        if (msg.senderType === 'customer' && customer) {
          senderName = customer.firstName || customer.username || 'Customer';
        } else if (msg.senderType === 'owner') {
          senderName = 'Agent';
        } else if (msg.senderType === 'system') {
          senderName = 'System';
        }

        return {
          id: msg.id,
          senderType: msg.senderType,
          senderName,
          message: msg.message,
          isInternal: msg.isInternal,
          createdAt: msg.createdAt,
        };
      }),
    );

    return {
      id: ticket.id,
      botId: ticket.botId,
      customerId: ticket.customerId,
      customerName: customer?.firstName || null,
      customerUsername: customer?.username || null,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      subject: ticket.subject,
      assignedTo: ticket.assignedTo,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
      messages: messageItems,
      availableActions: getTicketAvailableActions(ticket.status),
    };
  }

  /**
   * Get open ticket count for a bot.
   */
  async getOpenTicketCount(botId: string): Promise<number> {
    return this.ticketRepository.count({
      where: { botId, status: 'open' },
    });
  }

  /**
   * Get status distribution for a bot.
   */
  async getStatusDistribution(botId: string): Promise<Record<string, number>> {
    const results = await this.ticketRepository
      .createQueryBuilder('t')
      .select('t.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('t.botId = :botId', { botId })
      .groupBy('t.status')
      .getRawMany();

    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.status] = parseInt(row.count, 10);
    }

    return counts;
  }

  // ─── Private Helpers ──────────────────────────────────────────

  private async getMessageCounts(ticketIds: string[]): Promise<Record<string, number>> {
    if (ticketIds.length === 0) {
      return {};
    }

    const results = await this.ticketMessageRepository
      .createQueryBuilder('m')
      .select('m.ticketId', 'ticketId')
      .addSelect('COUNT(*)', 'count')
      .where('m.ticketId IN (:...ticketIds)', { ticketIds })
      .groupBy('m.ticketId')
      .getRawMany();

    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.ticketId] = parseInt(row.count, 10);
    }

    return counts;
  }

  private async populateCustomerInfo(items: TicketListItem[]): Promise<void> {
    const customerIds = [...new Set(items.map((i) => i.customerId))];
    if (customerIds.length === 0) return;

    const customers = await this.customerRepository.find({
      where: customerIds.map((id) => ({ id })),
    });

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    for (const item of items) {
      const customer = customerMap.get(item.customerId);
      if (customer) {
        item.customerName = customer.firstName || null;
        item.customerUsername = customer.username || null;
      }
    }
  }
}
