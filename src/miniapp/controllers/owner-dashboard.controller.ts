import { Controller, Get, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
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
 * TEMPLATE NEUTRALITY:
 * Template-specific data comes ONLY through DashboardService + DashboardCapabilityRegistry.
 * No direct query service injection. No template-specific branching.
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
   * Returns: customers, interactions (template-agnostic), events, status breakdown.
   *
   * TEMPLATE NEUTRALITY:
   * No template-specific metrics (leads, bookings) in response.
   * Template-specific data available via template-specific endpoints.
   */
  @Get(':id/overview')
  async getBotOverview(@Param('id') botId: string) {
    const stats = await this.dashboardService.getBotStats(botId);

    // Template-specific interactions from capability registry (e.g., bookings for booking template)
    const templateInteractions = (stats as any)[stats.template] || 0;

    return {
      botId: stats.id,
      template: stats.template,
      createdAt: stats.createdAt,
      stats: {
        customers: stats.customerCount,
        customersByStatus: stats.customersByStatus,
        interactions: templateInteractions,
        events: stats.eventCount,
      },
    };
  }

  /**
   * GET /miniapp/bots/:id/view
   *
   * Composed operational view for a bot.
   * Includes template-specific widgets and navigation from OwnerModuleRegistry.
   *
   * TEMPLATE NEUTRALITY:
   * Uses generic interaction count, not template-specific metrics.
   */
  @Get(':id/view')
  async getBotView(@Param('id') botId: string) {
    const stats = await this.dashboardService.getBotStats(botId);

    // Template-specific interactions from capability registry
    const templateInteractions = (stats as any)[stats.template] || 0;

    const view = this.ownerViewService.composeBotView(
      botId,
      stats.template,
      {
        customerCount: stats.customerCount,
        interactionCount: templateInteractions,
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
