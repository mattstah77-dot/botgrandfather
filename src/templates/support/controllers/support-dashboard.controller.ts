import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MiniAppAuthGuard } from '../../../miniapp/auth/miniapp-auth.guard';
import { BotOwnershipGuard } from '../../../ownership/bot-ownership.guard';
import { SupportQueryService } from '../support-query.service';

/**
 * Support Dashboard Controller — operational endpoints for Mini App.
 *
 * ARCHITECTURAL PRINCIPLE:
 * These endpoints are READ-ONLY operational queries.
 * They serve data to the Mini App for owner visibility.
 * They do NOT execute business logic or state transitions.
 *
 * WHY operational endpoints:
 * - Ticket lists, detail views, metrics — all read-only.
 * - No state changes, no Telegram messages.
 * - Separated from lifecycle controller (runtime).
 *
 * SECURITY:
 * - MiniAppAuthGuard: validates Telegram initData
 * - BotOwnershipGuard: verifies owner owns the bot
 * - SupportQueryService: filters by botId
 */
@Controller('miniapp/bots')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
export class SupportDashboardController {
  constructor(
    private readonly supportQueryService: SupportQueryService,
  ) {}

  /**
   * GET /miniapp/bots/:id/tickets
   *
   * Get tickets for a bot with pagination, filtering, and sorting.
   */
  @Get(':id/tickets')
  async getBotTickets(
    @Param('id') botId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.supportQueryService.getBotTickets(
      botId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
      search,
      sort,
    );
  }

  /**
   * GET /miniapp/bots/:id/tickets/:ticketId
   *
   * Get a single ticket detail with message history.
   */
  @Get(':id/tickets/:ticketId')
  async getTicketDetail(
    @Param('id') botId: string,
    @Param('ticketId') ticketId: string,
  ) {
    const ticket = await this.supportQueryService.getTicketById(botId, ticketId);

    if (!ticket) {
      return { error: 'Ticket not found' };
    }

    return ticket;
  }

  /**
   * GET /miniapp/bots/:id/tickets/stats
   *
   * Get ticket statistics for a bot.
   */
  @Get(':id/tickets/stats')
  async getTicketStats(
    @Param('id') botId: string,
  ) {
    const [total, open, statusDistribution] = await Promise.all([
      this.supportQueryService.getBotMetrics(botId).then((m) => m.total),
      this.supportQueryService.getOpenTicketCount(botId),
      this.supportQueryService.getStatusDistribution(botId),
    ]);

    return {
      total,
      open,
      statusDistribution,
    };
  }
}
