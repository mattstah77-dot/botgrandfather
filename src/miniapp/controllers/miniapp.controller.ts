import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { MiniAppAuthGuard } from '../auth/miniapp-auth.guard';
import { DashboardService } from '../services/dashboard.service';
import { OwnerViewService } from '../services/owner-view.service';
import { NavigationService } from '../services/navigation.service';

/**
 * MiniApp Controller — authenticated Mini App endpoints.
 *
 * ARCHITECTURAL PRINCIPLE:
 * All endpoints require Telegram initData authentication.
 * No public access. No mock auth.
 */
@Controller('miniapp')
@UseGuards(MiniAppAuthGuard)
export class MiniappController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly ownerViewService: OwnerViewService,
    private readonly navigationService: NavigationService,
  ) {}

  /**
   * GET /miniapp/dashboard
   *
   * Universal operational overview for the owner.
   * Returns:
   * - Owner profile
   * - Bot statistics
   * - Customer metrics
   * - Navigation structure
   * - Dashboard widgets
   */
  @Get('dashboard')
  async getDashboard(@Req() req: Request) {
    const session = req.miniAppSession!;
    const ownerId = session.ownerId;

    // Aggregate data
    const profile = await this.dashboardService.getOwnerProfile(ownerId);
    const bots = await this.dashboardService.getOwnerBots(ownerId);
    const stats = await this.dashboardService.getOwnerStats(ownerId);

    // Compose view
    const view = this.ownerViewService.composeDashboardView(
      ownerId,
      stats.totalBots,
      stats.totalCustomers,
      stats.totalLeads,
      bots.map((b) => ({ id: b.id, template: b.template })),
    );

    return {
      owner: profile,
      stats,
      bots: bots.map((bot) => ({
        id: bot.id,
        template: bot.template,
        status: 'active',
        createdAt: bot.createdAt,
      })),
      view,
    };
  }

  /**
   * GET /miniapp/navigation
   *
   * Returns dynamic navigation structure.
   * Merges universal + template-specific navigation.
   */
  @Get('navigation')
  async getNavigation(@Req() req: Request) {
    const session = req.miniAppSession!;
    const bots = await this.dashboardService.getOwnerBots(session.ownerId);
    const templates = bots.map((b) => b.template);

    return {
      navigation: this.navigationService.composeNavigation(templates),
    };
  }

  /**
   * GET /miniapp/me
   *
   * Returns current owner profile.
   */
  @Get('me')
  async getMe(@Req() req: Request) {
    const session = req.miniAppSession!;
    const profile = await this.dashboardService.getOwnerProfile(session.ownerId);

    return {
      session: {
        ownerId: session.ownerId,
        telegramUserId: session.telegramUserId,
        username: session.username,
      },
      profile,
    };
  }
}
