import { Injectable, Logger } from '@nestjs/common';
import { BotService } from '../../bot/bot.service';
import { CustomerService } from '../../customer/customer.service';
import { OwnerService } from '../../owner/owner.service';
import { AnalyticsService } from '../../analytics/analytics.service';

/**
 * DashboardService — aggregates data for Mini App operational views.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This service ONLY reads data from other services.
 * It does NOT contain business logic, runtime logic, or template logic.
 *
 * It is the data aggregation layer for the Mini App.
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly ownerService: OwnerService,
    private readonly botService: BotService,
    private readonly customerService: CustomerService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Get owner profile for Mini App.
   * Excludes sensitive fields (telegramUserId).
   */
  async getOwnerProfile(ownerId: string) {
    const owner = await this.ownerService.getOwnerById(ownerId);

    if (!owner) {
      return null;
    }

    return {
      id: owner.id,
      username: owner.username,
      firstName: owner.firstName,
      lastName: owner.lastName,
      subscriptionPlan: owner.subscriptionPlan,
      createdAt: owner.createdAt,
    };
  }

  /**
   * Get all bots for an owner.
   * Excludes sensitive fields.
   */
  async getOwnerBots(ownerId: string) {
    return this.botService.getOwnerBots(ownerId);
  }

  /**
   * Get universal stats for an owner across all bots.
   */
  async getOwnerStats(ownerId: string) {
    const bots = await this.botService.getOwnerBots(ownerId);

    let totalCustomers = 0;
    let totalLeads = 0;

    for (const bot of bots) {
      const customerCount = await this.customerService.countByStatus(bot.id);
      const leadCount = await this.getBotLeadCount(bot.id);

      totalCustomers += Object.values(customerCount).reduce((a, b) => a + b, 0);
      totalLeads += leadCount;
    }

    return {
      totalBots: bots.length,
      totalCustomers,
      totalLeads,
    };
  }

  /**
   * Get stats for a specific bot.
   */
  async getBotStats(botId: string) {
    const overview = await this.botService.getBotOverview(botId);
    const statusCounts = await this.customerService.countByStatus(botId);
    const customerCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    return {
      ...overview,
      customerCount,
      customersByStatus: statusCounts,
    };
  }

  /**
   * Get analytics events for a bot.
   */
  async getBotAnalytics(botId: string) {
    return this.analyticsService.getBotStats(botId);
  }

  /**
   * Get customers for a bot.
   */
  async getBotCustomers(botId: string, page: number, limit: number) {
    return this.customerService.getBotCustomers(botId, page, limit);
  }

  /**
   * Private helper: count leads for a bot.
   */
  private async getBotLeadCount(botId: string): Promise<number> {
    const result = await this.botService.getBotLeads(botId, 1, 1);
    return result.pagination.total;
  }
}
