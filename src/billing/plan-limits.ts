/**
 * Plan limits definition.
 * Used by SubscriptionGuard to enforce feature/usage limits.
 */
export interface PlanLimits {
  maxBots: number;
  // Generic interaction quota (replaces lead/funnel specific limits)
  maxInteractionsPerMonth: number;
  maxFlows: number;
  allowedTemplates: string[];
  analyticsEnabled: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
}

/**
 * Built-in plan definitions.
 * Stripe integration will reference these plan IDs.
 */
export const PLAN_DEFINITIONS: Record<string, PlanLimits> = {
  free: {
    maxBots: 1,
    maxInteractionsPerMonth: 50,
    maxFlows: 1,
    allowedTemplates: ['lead-funnel'],
    analyticsEnabled: false,
    customBranding: false,
    prioritySupport: false,
  },
  starter: {
    maxBots: 3,
    maxInteractionsPerMonth: 500,
    maxFlows: 5,
    allowedTemplates: ['lead-funnel', 'booking'],
    analyticsEnabled: true,
    customBranding: false,
    prioritySupport: false,
  },
  pro: {
    maxBots: 10,
    maxInteractionsPerMonth: 5000,
    maxFlows: 20,
    allowedTemplates: ['*'], // all templates
    analyticsEnabled: true,
    customBranding: true,
    prioritySupport: true,
  },
};

/**
 * Check if a plan allows a specific template.
 */
export function planAllowsTemplate(plan: string, template: string): boolean {
  const limits = PLAN_DEFINITIONS[plan];
  if (!limits) return false;
  if (limits.allowedTemplates.includes('*')) return true;
  return limits.allowedTemplates.includes(template);
}
