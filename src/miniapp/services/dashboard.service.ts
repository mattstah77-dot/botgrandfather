import { Injectable, Logger } from '@nestjs/common';
import { BotService } from '../../bot/bot.service';
import { CustomerService } from '../../customer/customer.service';
import { OwnerService } from '../../owner/owner.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { BookingQueryService } from '../../templates/booking/booking-query.service';
import { LeadFunnelQueryService } from '../../templates/lead-funnel/lead-funnel-query.service';

/**
 * DashboardService — aggregates data for Mini App operational views.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This service ONLY reads data from other services.
 * It does NOT contain business logic, runtime logic, or template logic.
 *
 * It is the data aggregation layer for the Mini App.
 *
 * TEMPLATE ISOLATION:
 * Template-specific counts come from query services (BookingQueryService),
 * NOT from BotService. BotService must remain template-agnostic.
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly ownerService: OwnerService,
    private readonly botService: BotService,
    private readonly customerService: CustomerService,
    private readonly analyticsService: AnalyticsService,
    private readonly bookingQueryService: BookingQueryService,
    private readonly leadFunnelQueryService: LeadFunnelQueryService,
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

    // Single query: all lead counts for all bots (template-specific)
    // NOTE: Uses LeadFunnelQueryService directly, NOT BotService.
    // BotService must remain template-agnostic.
    const leadCountsByBot = await this.leadFunnelQueryService.countLeadsByBotIds(botIds);

    // Single query: all booking counts for all bots (template-specific interactions)
    // NOTE: Uses BookingQueryService directly, NOT BotService.
    // BotService must remain template-agnostic.
    const bookingCountsByBot = await this.bookingQueryService.countBookingsByBotIds(botIds);

    let totalCustomers = 0;
    for (const botCounts of Object.values(customerCountsByBot)) {
      totalCustomers += Object.values(botCounts).reduce((a, b) => a + b, 0);
    }

    let totalInteractions = 0;
    for (const count of Object.values(leadCountsByBot)) {
      totalInteractions += count;
    }
    for (const count of Object.values(bookingCountsByBot)) {
      totalInteractions += count;
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
   * Template-specific counts come from query services, NOT BotService.
   * BotService must remain template-agnostic.
   */
  async getBotStats(botId: string) {
    const overview = await this.botService.getBotOverview(botId);
    const statusCounts = await this.customerService.countByStatus(botId);
    const customerCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    // Template-specific counts from query services
    const bookingCounts = await this.bookingQueryService.countBookingsByBotIds([botId]);
    const bookingCount = bookingCounts[botId] || 0;

    const leadCounts = await this.leadFunnelQueryService.countLeadsByBotIds([botId]);
    const leadCount = leadCounts[botId] || 0;

    return {
      ...overview,
      customerCount,
      customersByStatus: statusCounts,
      leadCount,
      bookingCount,
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

