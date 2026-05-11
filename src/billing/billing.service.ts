import { Injectable, Logger } from '@nestjs/common';
import { PLAN_DEFINITIONS, PlanLimits, planAllowsTemplate } from './plan-limits';

/**
 * BillingService — placeholder for future payment integration.
 *
 * Currently provides:
 * - Plan limit lookups
 * - Feature access checks
 * - Usage quota validation
 *
 * Future:
 * - Stripe integration
 * - Invoice generation
 * - Subscription lifecycle management
 */
@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  /**
   * Get plan limits for a subscription plan.
   */
  getPlanLimits(plan: string): PlanLimits | null {
    return PLAN_DEFINITIONS[plan] || null;
  }

  /**
   * Check if a plan allows connecting a specific template.
   */
  canUseTemplate(plan: string, template: string): boolean {
    return planAllowsTemplate(plan, template);
  }

  /**
   * Check if owner is within bot quota.
   * Future: query actual bot count from DB.
   */
  canAddBot(plan: string, currentBotCount: number): boolean {
    const limits = this.getPlanLimits(plan);
    if (!limits) return false;
    return currentBotCount < limits.maxBots;
  }

  /**
   * Check if owner is within interaction quota.
   */
  canAddInteraction(plan: string, currentInteractionCount: number): boolean {
    const limits = this.getPlanLimits(plan);
    if (!limits) return false;
    return currentInteractionCount < limits.maxInteractionsPerMonth;
  }

  /**
   * Check if owner is within flow quota.
   */
  canAddFlow(plan: string, currentFlowCount: number): boolean {
    const limits = this.getPlanLimits(plan);
    if (!limits) return false;
    return currentFlowCount < limits.maxFlows;
  }

  /**
   * Check if analytics feature is available on the plan.
   */
  hasAnalytics(plan: string): boolean {
    const limits = this.getPlanLimits(plan);
    return limits?.analyticsEnabled ?? false;
  }
}
