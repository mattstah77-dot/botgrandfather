import { Injectable, Logger } from '@nestjs/common';
import { BotService } from '../../bot/bot.service';
import { CustomerService } from '../../customer/customer.service';
import { OwnerService } from '../../owner/owner.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { DashboardCapabilityRegistry } from '../../dashboard/dashboard-capability.registry';

/**
 * DashboardService — aggregates data for Mini App operational views.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This service ONLY reads data from other services.
 * It does NOT contain business logic, runtime logic, or template logic.
 *
 * TEMPLATE AGGREGATION:
 * Template-specific metrics come from DashboardCapabilityRegistry,
 * NOT from direct query service injection.
 *
 * WHY registry pattern:
 * - Adding a new template does NOT require modifying this service
 * - DashboardService orchestrates aggregation, does NOT know individual templates
 * - Prevents god-class growth as templates multiply
 *
 * This service is the data aggregation layer for the Mini App.
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly ownerService: OwnerService,
    private readonly botService: BotService,
    private readonly customerService: CustomerService,
    private readonly analyticsService: AnalyticsService,
    private readonly capabilityRegistry: DashboardCapabilityRegistry,
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
   *
   * SCALABILITY: Uses single aggregated queries instead of N+1 per bot.
   *
   * TEMPLATE AGGREGATION:
   * Template-specific metrics aggregated from registry.
   * Adding new templates does NOT require modifying this method.
   */
  async getOwnerStats(ownerId: string) {
    const bots = await this.botService.getOwnerBots(ownerId);

    if (bots.length === 0) {
      return {
        totalBots: 0,
        totalCustomers: 0,
        totalInteractions: 0,
      };
    }

    const botIds = bots.map((b) => b.id);

    // Single query: all customer counts for all bots
    const customerCountsByBot = await this.customerService.countByStatusForBots(botIds);

    // Aggregate template-specific interactions from all registered providers
    // This is the key improvement: no direct injection needed for new templates
    let totalInteractions = 0;
    const capabilityProviders = this.capabilityRegistry.getAll();
    for (const provider of capabilityProviders) {
      const metrics = await provider.getOwnerMetrics(ownerId);
      totalInteractions += metrics.total;
    }

    let totalCustomers = 0;
    for (const botCounts of Object.values(customerCountsByBot)) {
      totalCustomers += Object.values(botCounts).reduce((a, b) => a + b, 0);
    }

    return {
      totalBots: bots.length,
      totalCustomers,
      totalInteractions,
    };
  }

  /**
   * Get stats for a specific bot.
   *
   * TEMPLATE ISOLATION:
   * Template-specific counts aggregated from registry.
   * BotService remains template-agnostic.
   */
  async getBotStats(botId: string) {
    const overview = await this.botService.getBotOverview(botId);
    const statusCounts = await this.customerService.countByStatus(botId);
    const customerCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    // Aggregate template-specific metrics from all registered providers
    // This is the key improvement: no direct injection needed for new templates
    const capabilityProviders = this.capabilityRegistry.getAll();
    const capabilityMetrics: Record<string, number> = {};
    for (const provider of capabilityProviders) {
      const metrics = await provider.getBotMetrics(botId);
      capabilityMetrics[provider.getCapabilityKey()] = metrics.total;
    }

    return {
      ...overview,
      customerCount,
      customersByStatus: statusCounts,
      ...capabilityMetrics,
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
}

