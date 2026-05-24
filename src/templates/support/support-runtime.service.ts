import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TelegramService } from '../../telegram/telegram.service';
import { TemplateContext, TemplateService } from '../template.interface';
import { CustomerService } from '../../customer/customer.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { Ticket } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { SupportDeskConfig, defaultSupportDeskConfig, TicketStatus } from './support.types';

/**
 * SupportRuntimeService — runtime conversation flow for the support desk template.
 *
 * RESPONSIBILITY:
 * - Telegram conversation orchestration
 * - Ticket creation and message handling
 * - Customer-initiated ticket lifecycle
 * - Owner notification on new tickets
 * - Auto-reply to customers
 *
 * DOES NOT:
 * - Serve operational queries (see SupportQueryService)
 * - Expose data to Mini App controllers
 * - Implement SLA tracking
 * - Implement assignment algorithms
 * - Implement workflow engines
 *
 * LIFECYCLE LOGIC:
 * All state transitions are EXPLICIT methods.
 * NO generic state machine. NO metadata-driven transitions.
 */
@Injectable()
export class SupportRuntimeService implements TemplateService {
  private readonly logger = new Logger(SupportRuntimeService.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly customerService: CustomerService,
    private readonly analyticsService: AnalyticsService,
    private readonly dataSource: DataSource,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketMessage)
    private readonly ticketMessageRepository: Repository<TicketMessage>,
  ) {}

  // ─── Entry Points ─────────────────────────────────────────────

  async handleStart(context: TemplateContext): Promise<void> {
    await this.customerService.ensureCustomer(context.botId, context.userId, {
      username: context.username,
      firstName: context.firstName,
      lastName: context.lastName,
    });

    await this.analyticsService.trackEvent(context.botId, 'session.started', {
      template: 'support',
      userId: context.userId,
    });

    const config = this.getConfig(context);

    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      config.autoReplyMessage || defaultSupportDeskConfig.autoReplyMessage,
    );
  }

  async handleDefault(context: TemplateContext): Promise<void> {
    const text = context.messageText ?? '';

    if (!text.trim()) {
      return;
    }

    // Ensure customer exists
    const customer = await this.customerService.ensureCustomer(
      context.botId,
      context.userId,
      {
        username: context.username,
        firstName: context.firstName,
        lastName: context.lastName,
      },
    );

    // Find existing open ticket for this customer
    const existingTicket = await this.findExistingTicket(
      context.botId,
      customer.id,
    );

    if (existingTicket) {
      // Append message to existing ticket
      await this.appendMessage(existingTicket, text, context);

      // If ticket was resolved or closed, reopen it
      if (existingTicket.status === 'resolved' || existingTicket.status === 'closed') {
        await this.reopenTicket(existingTicket, context);
      }
    } else {
      // Create new ticket
      await this.createTicket(context, customer.id, text);
    }
  }

  async handleCallback(context: TemplateContext, callbackData: string): Promise<void> {
    // Support desk does not use callback queries in MVP
    this.logger.debug(`Support callback ignored: ${callbackData}`);
  }

  // ─── Ticket Lifecycle Methods ─────────────────────────────────

  /**
   * Create a new ticket from customer message.
   */
  private async createTicket(
    context: TemplateContext,
    customerId: string,
    message: string,
  ): Promise<Ticket> {
    const config = this.getConfig(context);

    const ticket = this.ticketRepository.create({
      botId: context.botId,
      customerId,
      status: 'open',
      subject: message.slice(0, 100), // First 100 chars as subject
      priority: 'medium',
      category: null,
      assignedTo: config.defaultAssignee || null,
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    // Store the initial message
    const initialMessage = this.ticketMessageRepository.create({
      ticketId: savedTicket.id,
      senderType: 'customer',
      senderId: BigInt(context.userId),
      message,
      isInternal: false,
    });
    await this.ticketMessageRepository.save(initialMessage);

    // Track event
    await this.analyticsService.trackEvent(context.botId, 'ticket.created', {
      ticketId: savedTicket.id,
      customerId,
      priority: savedTicket.priority,
      category: savedTicket.category,
    });

    // Send auto-reply
    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      `Thank you! Your ticket #${savedTicket.id.slice(0, 8)} has been created. We'll get back to you soon.`,
    );

    // Notify owner if configured
    if (config.notifyOnNewTicket && config.ownerChatId) {
      await this.notifyOwnerNewTicket(context, savedTicket, config.ownerChatId);
    }

    this.logger.log(`Ticket created: ${savedTicket.id} for bot ${context.botId}`);
    return savedTicket;
  }

  /**
   * Append a message to an existing ticket.
   */
  private async appendMessage(
    ticket: Ticket,
    message: string,
    context: TemplateContext,
  ): Promise<void> {
    const msg = this.ticketMessageRepository.create({
      ticketId: ticket.id,
      senderType: 'customer',
      senderId: BigInt(context.userId),
      message,
      isInternal: false,
    });
    await this.ticketMessageRepository.save(msg);

    // Update ticket updatedAt
    ticket.updatedAt = new Date();
    await this.ticketRepository.save(ticket);

    this.logger.debug(`Message appended to ticket ${ticket.id}`);
  }

  /**
   * Reopen a resolved/closed ticket.
   */
  private async reopenTicket(ticket: Ticket, context: TemplateContext): Promise<void> {
    const previousStatus = ticket.status;

    ticket.status = 'in-progress';
    ticket.updatedAt = new Date();
    ticket.closedAt = null;
    ticket.resolvedAt = null;

    await this.ticketRepository.save(ticket);

    // Add system message
    const reopenMsg = this.ticketMessageRepository.create({
      ticketId: ticket.id,
      senderType: 'system',
      senderId: 0n,
      message: `Ticket reopened by customer. Previous status: ${previousStatus}`,
      isInternal: false,
    });
    await this.ticketMessageRepository.save(reopenMsg);

    // Track event
    await this.analyticsService.trackEvent(context.botId, 'ticket.reopened', {
      ticketId: ticket.id,
      reopenedBy: 'customer',
      previousStatus,
    });

    this.logger.log(`Ticket reopened: ${ticket.id}`);
  }

  // ─── Owner-Triggered Lifecycle Methods ────────────────────────

  /**
   * Take (self-assign) an open ticket.
   */
  async takeTicket(
    botId: string,
    ticketId: string,
    ownerId: string,
  ): Promise<Ticket> {
    const ticket = await this.findTicketOrThrow(botId, ticketId);

    if (ticket.status !== 'open') {
      throw new Error(`Cannot take ticket with status: ${ticket.status}`);
    }

    ticket.status = 'in-progress';
    ticket.assignedTo = ownerId;
    ticket.updatedAt = new Date();

    const saved = await this.ticketRepository.save(ticket);

    // Add system message
    const takeMsg = this.ticketMessageRepository.create({
      ticketId: ticket.id,
      senderType: 'system',
      senderId: BigInt(ownerId),
      message: `Ticket taken by owner`,
      isInternal: false,
    });
    await this.ticketMessageRepository.save(takeMsg);

    await this.analyticsService.trackEvent(botId, 'ticket.assigned', {
      ticketId: ticket.id,
      assignedTo: ownerId,
      assignedBy: ownerId,
    });

    this.logger.log(`Ticket taken: ${ticket.id} by ${ownerId}`);
    return saved;
  }

  /**
   * Assign ticket to an agent/owner.
   */
  async assignTicket(
    botId: string,
    ticketId: string,
    assigneeId: string,
    assignedBy: string,
  ): Promise<Ticket> {
    const ticket = await this.findTicketOrThrow(botId, ticketId);

    if (ticket.status === 'closed') {
      throw new Error('Cannot assign closed ticket');
    }

    ticket.assignedTo = assigneeId;
    if (ticket.status === 'open') {
      ticket.status = 'in-progress';
    }
    ticket.updatedAt = new Date();

    const saved = await this.ticketRepository.save(ticket);

    // Add system message
    const assignMsg = this.ticketMessageRepository.create({
      ticketId: ticket.id,
      senderType: 'system',
      senderId: BigInt(assignedBy),
      message: `Ticket assigned to ${assigneeId}`,
      isInternal: false,
    });
    await this.ticketMessageRepository.save(assignMsg);

    await this.analyticsService.trackEvent(botId, 'ticket.assigned', {
      ticketId: ticket.id,
      assignedTo: assigneeId,
      assignedBy,
    });

    this.logger.log(`Ticket assigned: ${ticket.id} to ${assigneeId}`);
    return saved;
  }

  /**
   * Reply to a ticket (send message to customer).
   */
  async replyToTicket(
    botId: string,
    ticketId: string,
    message: string,
    senderId: string,
    botToken: string,
  ): Promise<Ticket> {
    const ticket = await this.findTicketOrThrow(botId, ticketId);

    if (ticket.status === 'closed') {
      throw new Error('Cannot reply to closed ticket');
    }

    // Store owner message
    const ownerMsg = this.ticketMessageRepository.create({
      ticketId: ticket.id,
      senderType: 'owner',
      senderId: BigInt(senderId),
      message,
      isInternal: false,
    });
    await this.ticketMessageRepository.save(ownerMsg);

    // Update ticket
    ticket.updatedAt = new Date();
    if (ticket.status === 'open') {
      ticket.status = 'in-progress';
    }
    const saved = await this.ticketRepository.save(ticket);

    // Send message to customer via Telegram
    // Get customer Telegram user ID from customerId
    const customer = await this.customerService.getCustomerById(ticket.customerId);
    if (customer) {
      await this.telegramService.sendMessage(
        botToken,
        Number(customer.telegramUserId),
        message,
      );
    }

    await this.analyticsService.trackEvent(botId, 'ticket.replied', {
      ticketId: ticket.id,
      senderType: 'owner',
    });

    this.logger.log(`Ticket reply sent: ${ticket.id}`);
    return saved;
  }

  /**
   * Resolve a ticket.
   */
  async resolveTicket(
    botId: string,
    ticketId: string,
    resolvedBy: string,
    botToken: string,
  ): Promise<Ticket> {
    const ticket = await this.findTicketOrThrow(botId, ticketId);

    if (ticket.status !== 'open' && ticket.status !== 'in-progress') {
      throw new Error(`Cannot resolve ticket with status: ${ticket.status}`);
    }

    ticket.status = 'resolved';
    ticket.resolvedAt = new Date();
    ticket.updatedAt = new Date();

    const saved = await this.ticketRepository.save(ticket);

    // Add system message
    const resolveMsg = this.ticketMessageRepository.create({
      ticketId: ticket.id,
      senderType: 'system',
      senderId: BigInt(resolvedBy),
      message: `Ticket resolved by owner`,
      isInternal: false,
    });
    await this.ticketMessageRepository.save(resolveMsg);

    // Notify customer
    const customer = await this.customerService.getCustomerById(ticket.customerId);
    if (customer) {
      await this.telegramService.sendMessage(
        botToken,
        Number(customer.telegramUserId),
        `Your ticket #${ticket.id.slice(0, 8)} has been resolved. Reply if you need more help.`,
      );
    }

    await this.analyticsService.trackEvent(botId, 'ticket.resolved', {
      ticketId: ticket.id,
      resolvedBy,
    });

    this.logger.log(`Ticket resolved: ${ticket.id}`);
    return saved;
  }

  /**
   * Close a ticket.
   */
  async closeTicket(
    botId: string,
    ticketId: string,
    closedBy: string,
    botToken: string,
  ): Promise<Ticket> {
    const ticket = await this.findTicketOrThrow(botId, ticketId);

    if (ticket.status === 'closed') {
      throw new Error('Ticket is already closed');
    }

    ticket.status = 'closed';
    ticket.closedAt = new Date();
    ticket.updatedAt = new Date();

    const saved = await this.ticketRepository.save(ticket);

    // Add system message
    const closeMsg = this.ticketMessageRepository.create({
      ticketId: ticket.id,
      senderType: 'system',
      senderId: BigInt(closedBy),
      message: `Ticket closed by owner`,
      isInternal: false,
    });
    await this.ticketMessageRepository.save(closeMsg);

    // Notify customer
    const customer = await this.customerService.getCustomerById(ticket.customerId);
    if (customer) {
      await this.telegramService.sendMessage(
        botToken,
        Number(customer.telegramUserId),
        `Your ticket #${ticket.id.slice(0, 8)} has been closed.`,
      );
    }

    await this.analyticsService.trackEvent(botId, 'ticket.closed', {
      ticketId: ticket.id,
      closedBy,
    });

    this.logger.log(`Ticket closed: ${ticket.id}`);
    return saved;
  }

  /**
   * Reopen a closed/resolved ticket (owner-initiated).
   */
  async reopenTicketOwner(
    botId: string,
    ticketId: string,
    reopenedBy: string,
  ): Promise<Ticket> {
    const ticket = await this.findTicketOrThrow(botId, ticketId);

    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      throw new Error(`Cannot reopen ticket with status: ${ticket.status}`);
    }

    const previousStatus = ticket.status;

    ticket.status = 'in-progress';
    ticket.closedAt = null;
    ticket.resolvedAt = null;
    ticket.updatedAt = new Date();

    const saved = await this.ticketRepository.save(ticket);

    // Add system message
    const reopenOwnerMsg = this.ticketMessageRepository.create({
      ticketId: ticket.id,
      senderType: 'system',
      senderId: BigInt(reopenedBy),
      message: `Ticket reopened by owner. Previous status: ${previousStatus}`,
      isInternal: false,
    });
    await this.ticketMessageRepository.save(reopenOwnerMsg);

    await this.analyticsService.trackEvent(botId, 'ticket.reopened', {
      ticketId: ticket.id,
      reopenedBy: 'owner',
      previousStatus,
    });

    this.logger.log(`Ticket reopened by owner: ${ticket.id}`);
    return saved;
  }

  // ─── Helper Methods ───────────────────────────────────────────

  /**
   * Find existing open/in-progress/resolved ticket for customer.
   */
  private async findExistingTicket(
    botId: string,
    customerId: string,
  ): Promise<Ticket | null> {
    return this.ticketRepository.findOne({
      where: [
        { botId, customerId, status: 'open' },
        { botId, customerId, status: 'in-progress' },
        { botId, customerId, status: 'resolved' },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find ticket by ID or throw.
   */
  private async findTicketOrThrow(botId: string, ticketId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, botId },
    });

    if (!ticket) {
      throw new Error(`Ticket not found: ${ticketId}`);
    }

    return ticket;
  }

  /**
   * Get support desk config from bot config.
   */
  private getConfig(context: TemplateContext): SupportDeskConfig {
    const config = context.botConfig || {};
    return {
      ...defaultSupportDeskConfig,
      ...(config.supportDesk || {}),
    };
  }

  /**
   * Notify owner about new ticket.
   */
  private async notifyOwnerNewTicket(
    context: TemplateContext,
    ticket: Ticket,
    ownerChatId: string,
  ): Promise<void> {
    try {
      await this.telegramService.sendMessage(
        context.botToken,
        Number(ownerChatId),
        `🎫 New ticket #${ticket.id.slice(0, 8)}\nSubject: ${ticket.subject || 'No subject'}`,
      );
    } catch (error) {
      this.logger.warn(`Failed to notify owner about ticket ${ticket.id}: ${error}`);
    }
  }
}
