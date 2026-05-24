import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { MiniAppAuthGuard } from '../../../miniapp/auth/miniapp-auth.guard';
import { BotOwnershipGuard } from '../../../ownership/bot-ownership.guard';
import { SupportRuntimeService } from '../support-runtime.service';

/**
 * Support Lifecycle Controller — runtime endpoints for owner-triggered transitions.
 *
 * ARCHITECTURAL PRINCIPLE:
 * These endpoints execute support desk business logic (state transitions).
 * They are NOT operational read-only endpoints.
 * They live in the runtime module (templates/support/), NOT the miniapp module.
 *
 * WHY runtime module:
 * - Ticket lifecycle is business logic, not operational visibility.
 * - Operational layer (miniapp) is read-only per ROS.1.
 * - Owner-triggered transitions are still runtime behavior.
 *
 * SECURITY:
 * - MiniAppAuthGuard: validates Telegram initData
 * - BotOwnershipGuard: verifies owner owns the bot
 * - SupportRuntimeService: verifies ticket belongs to bot
 * No cross-tenant operations possible.
 *
 * CANONICAL TRANSITIONS (per support-desk-semantics.md §4):
 * - open → in-progress (take)
 * - open → in-progress (assign)
 * - open → resolved
 * - open → closed
 * - in-progress → resolved
 * - in-progress → closed
 * - resolved → closed
 * - resolved → in-progress (reopen)
 * - closed → in-progress (reopen)
 */
@Controller('miniapp/bots')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
export class SupportLifecycleController {
  constructor(
    private readonly supportRuntimeService: SupportRuntimeService,
  ) {}

  /**
   * POST /miniapp/bots/:id/tickets/:ticketId/take
   *
   * Take (self-assign) an open ticket.
   * Allowed: open → in-progress
   */
  @Post(':id/tickets/:ticketId/take')
  async takeTicket(
    @Param('id') botId: string,
    @Param('ticketId') ticketId: string,
    @Body('ownerId') ownerId: string,
  ) {
    try {
      const ticket = await this.supportRuntimeService.takeTicket(
        botId,
        ticketId,
        ownerId,
      );
      return { success: true, ticket };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to take ticket',
      );
    }
  }

  /**
   * POST /miniapp/bots/:id/tickets/:ticketId/assign
   *
   * Assign ticket to an agent/owner.
   * Allowed: open → in-progress, in-progress → in-progress
   */
  @Post(':id/tickets/:ticketId/assign')
  async assignTicket(
    @Param('id') botId: string,
    @Param('ticketId') ticketId: string,
    @Body('assigneeId') assigneeId: string,
    @Body('assignedBy') assignedBy: string,
  ) {
    try {
      const ticket = await this.supportRuntimeService.assignTicket(
        botId,
        ticketId,
        assigneeId,
        assignedBy,
      );
      return { success: true, ticket };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to assign ticket',
      );
    }
  }

  /**
   * POST /miniapp/bots/:id/tickets/:ticketId/reply
   *
   * Reply to a ticket (send message to customer).
   * Allowed: any except closed
   */
  @Post(':id/tickets/:ticketId/reply')
  async replyToTicket(
    @Param('id') botId: string,
    @Param('ticketId') ticketId: string,
    @Body('message') message: string,
    @Body('senderId') senderId: string,
    @Body('botToken') botToken: string,
  ) {
    try {
      const ticket = await this.supportRuntimeService.replyToTicket(
        botId,
        ticketId,
        message,
        senderId,
        botToken,
      );
      return { success: true, ticket };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to reply to ticket',
      );
    }
  }

  /**
   * POST /miniapp/bots/:id/tickets/:ticketId/resolve
   *
   * Resolve a ticket.
   * Allowed: open → resolved, in-progress → resolved
   */
  @Post(':id/tickets/:ticketId/resolve')
  async resolveTicket(
    @Param('id') botId: string,
    @Param('ticketId') ticketId: string,
    @Body('resolvedBy') resolvedBy: string,
    @Body('botToken') botToken: string,
  ) {
    try {
      const ticket = await this.supportRuntimeService.resolveTicket(
        botId,
        ticketId,
        resolvedBy,
        botToken,
      );
      return { success: true, ticket };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to resolve ticket',
      );
    }
  }

  /**
   * POST /miniapp/bots/:id/tickets/:ticketId/close
   *
   * Close a ticket.
   * Allowed: any → closed
   */
  @Post(':id/tickets/:ticketId/close')
  async closeTicket(
    @Param('id') botId: string,
    @Param('ticketId') ticketId: string,
    @Body('closedBy') closedBy: string,
    @Body('botToken') botToken: string,
  ) {
    try {
      const ticket = await this.supportRuntimeService.closeTicket(
        botId,
        ticketId,
        closedBy,
        botToken,
      );
      return { success: true, ticket };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to close ticket',
      );
    }
  }

  /**
   * POST /miniapp/bots/:id/tickets/:ticketId/reopen
   *
   * Reopen a resolved/closed ticket.
   * Allowed: resolved → in-progress, closed → in-progress
   */
  @Post(':id/tickets/:ticketId/reopen')
  async reopenTicket(
    @Param('id') botId: string,
    @Param('ticketId') ticketId: string,
    @Body('reopenedBy') reopenedBy: string,
  ) {
    try {
      const ticket = await this.supportRuntimeService.reopenTicketOwner(
        botId,
        ticketId,
        reopenedBy,
      );
      return { success: true, ticket };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to reopen ticket',
      );
    }
  }
}
