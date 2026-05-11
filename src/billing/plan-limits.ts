/**
 * Plan limits definition.
 * Used by SubscriptionGuard to enforce feature/usage limits.
 */
export interface PlanLimits {
  maxBots: number;
  maxLeadsPerMonth: number;
  maxFunnels: number;
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
    maxLeadsPerMonth: 50,
    maxFunnels: 1,
    allowedTemplates: ['lead-funnel'],
    analyticsEnabled: false,
    customBranding: false,
    prioritySupport: false,
  },
  starter: {
    maxBots: 3,
    maxLeadsPerMonth: 500,
    maxFunnels: 5,
    allowedTemplates: ['lead-funnel', 'booking'],
    analyticsEnabled: true,
    customBranding: false,
    prioritySupport: false,
  },
  pro: {
    maxBots: 10,
    maxLeadsPerMonth: 5000,
    maxFunnels: 20,
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
