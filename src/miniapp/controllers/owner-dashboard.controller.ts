import { Controller, Get, Param, Query, Req, UseGuards, ParseIntPipe, DefaultValuePipe, UseInterceptors } from '@nestjs/common';
import type { Request } from 'express';
import { MiniAppAuthGuard } from '../auth/miniapp-auth.guard';
import { BotOwnershipGuard } from '../../ownership/bot-ownership.guard';
import { DashboardService } from '../services/dashboard.service';
import { OwnerViewService } from '../services/owner-view.service';

/**
 * Owner Dashboard Controller — bot-specific operational endpoints.
 *
 * ARCHITECTURAL PRINCIPLE:
 * These endpoints serve bot-specific operational data.
 * They are template-agnostic — the same endpoints work for lead-funnel,
 * booking, AI assistant, etc.
 *
 * SECURITY:
 * All bot-scoped endpoints enforce ownership via BotOwnershipGuard.
 * Cross-tenant access is impossible.
 */
@Controller('miniapp/bots')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
export class OwnerDashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly ownerViewService: OwnerViewService,
  ) {}

  /**
   * GET /miniapp/bots/:id/overview
   *
   * Universal bot overview — works for ANY template.
   * Returns: customers, leads, events, status breakdown.
   */
  @Get(':id/overview')
  async getBotOverview(@Param('id') botId: string) {
    const stats = await this.dashboardService.getBotStats(botId);

    return {
      botId: stats.id,
      template: stats.template,
      createdAt: stats.createdAt,
      stats: {
        customers: stats.customerCount,
        customersByStatus: stats.customersByStatus,
        leads: stats.leadCount,
        events: stats.eventCount,
      },
    };
  }

  /**
   * GET /miniapp/bots/:id/view
   *
   * Composed operational view for a bot.
   * Includes template-specific widgets and navigation.
   */
  @Get(':id/view')
  async getBotView(@Param('id') botId: string) {
    const stats = await this.dashboardService.getBotStats(botId);

    const view = this.ownerViewService.composeBotView(
      botId,
      stats.template,
      {
        customerCount: stats.customerCount,
        leadCount: stats.leadCount,
        bookingCount: stats.bookingCount,
        eventCount: stats.eventCount,
      },
    );

    return view;
  }

  /**
   * GET /miniapp/bots/:id/customers
   *
   * Universal customer list — reusable across ALL templates.
   */
  @Get(':id/customers')
  async getBotCustomers(
    @Param('id') botId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.dashboardService.getBotCustomers(botId, page, limit);
  }

  /**
   * GET /miniapp/bots/:id/analytics
   *
   * Analytics events for a bot.
   */
  @Get(':id/analytics')
  async getBotAnalytics(@Param('id') botId: string) {
    return this.dashboardService.getBotAnalytics(botId);
  }
}
