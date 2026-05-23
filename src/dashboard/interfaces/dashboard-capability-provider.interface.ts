/**
 * DashboardCapabilityProvider — lightweight operational query interface.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Each template capability exposes a read-only provider for dashboard aggregation.
 * This is NOT a plugin interface, NOT a framework contract, NOT dynamic discovery.
 *
 * It is ONLY: an internal operational composition boundary.
 *
 * PURPOSE:
 * - Prevent DashboardService god-class growth
 * - Keep capability aggregation explicit and composable
 * - Allow new capabilities to register WITHOUT modifying DashboardService
 *
 * CONSTRAINTS:
 * - Read-only. Providers MUST NOT mutate runtime state.
 * - No orchestration. Providers MUST NOT trigger workflows.
 * - No events. Providers MUST NOT emit platform events.
 * - Explicit registration. No auto-discovery, no decorators, no reflection.
 */

export interface CapabilityMetrics {
  /** Capability identifier (e.g., 'booking', 'lead-funnel') */
  capability: string;

  /** Primary metric (total count for this capability) */
  total: number;

  /** Optional additional metrics (e.g., by status, by type) */
  additional?: Record<string, number>;
}

export interface DashboardCapabilityProvider {
  /**
   * Return the capability key for this provider.
   * Used by DashboardCapabilityRegistry for explicit registration.
   */
  getCapabilityKey(): string;

  /**
   * Get metrics for a specific owner across all their bots.
   *
   * Returns total count and optional breakdowns.
   * Used by DashboardService for owner-level aggregation.
   */
  getOwnerMetrics(ownerId: string): Promise<CapabilityMetrics>;

  /**
   * Get metrics for a specific bot.
   *
   * Returns total count and optional breakdowns.
   * Used by DashboardService for bot-level aggregation.
   */
  getBotMetrics(botId: string): Promise<CapabilityMetrics>;
}
