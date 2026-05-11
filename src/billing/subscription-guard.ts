import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { BillingService } from './billing.service';

/**
 * SubscriptionGuard — enforces plan limits and feature access.
 *
 * Used by:
 * - BotService (can owner connect another bot?)
 * - TemplateFactory (can owner use this template?)
 * - AnalyticsService (can owner view analytics?)
 *
 * Throws ForbiddenException when limits are exceeded.
 */
@Injectable()
export class SubscriptionGuard {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(private readonly billingService: BillingService) {}

  /**
   * Assert that owner can connect a bot with the given template.
   */
  assertCanConnectBot(
    plan: string,
    template: string,
    currentBotCount: number,
  ): void {
    const limits = this.billingService.getPlanLimits(plan);
    if (!limits) {
      throw new ForbiddenException('Invalid subscription plan');
    }

    if (!this.billingService.canUseTemplate(plan, template)) {
      throw new ForbiddenException(
        `Template "${template}" is not available on your plan. Upgrade to access it.`,
      );
    }

    if (!this.billingService.canAddBot(plan, currentBotCount)) {
      throw new ForbiddenException(
        `Bot limit reached (${limits.maxBots}). Upgrade your plan to add more bots.`,
      );
    }
  }

  /**
   * Assert that owner can access analytics.
   */
  assertCanAccessAnalytics(plan: string): void {
    if (!this.billingService.hasAnalytics(plan)) {
      throw new ForbiddenException(
        'Analytics is not available on your plan. Upgrade to access it.',
      );
    }
  }
}
