import { Injectable } from '@nestjs/common';
import { DashboardCapabilityProvider } from './interfaces/dashboard-capability-provider.interface';
import { BookingQueryService } from '../templates/booking/booking-query.service';
import { LeadFunnelQueryService } from '../templates/lead-funnel/lead-funnel-query.service';
import { SupportQueryService } from '../templates/support/support-query.service';

/**
 * DashboardCapabilityRegistry — explicit template provider registration.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This registry is the ONLY place that knows about all template query providers.
 * It does NOT contain business logic. It does NOT query the database.
 * It ONLY registers providers and routes calls to them.
 *
 * WHY explicit registration:
 * - No auto-discovery (avoids accidental coupling)
 * - No decorators (avoids magic)
 * - No reflection (avoids implicit dependencies)
 * - Adding a template requires ONE line change here
 *
 * SCALING:
 * Adding a new template requires:
 * 1. Create QueryService implementing DashboardCapabilityProvider
 * 2. Add it to DashboardCapabilityRegistry constructor
 * 3. Add it to DashboardModule providers
 *
 * This is the ONLY place that needs modification for new templates.
 */
@Injectable()
export class DashboardCapabilityRegistry {
  private readonly providers = new Map<string, DashboardCapabilityProvider>();

  constructor(
    // EXPLICIT registration of all template query providers.
    // Each new template adds ONE parameter here.
    // This is the ONLY place that knows about all templates.
    bookingQueryService: BookingQueryService,
    leadFunnelQueryService: LeadFunnelQueryService,
    supportQueryService: SupportQueryService,
  ) {
    this.register(bookingQueryService);
    this.register(leadFunnelQueryService);
    this.register(supportQueryService);
  }

  private register(provider: DashboardCapabilityProvider): void {
    const key = provider.getCapabilityKey();
    if (this.providers.has(key)) {
      throw new Error(
        `Duplicate template provider registered: ${key}. ` +
          'Each template key must be unique.',
      );
    }
    this.providers.set(key, provider);
  }

  /**
   * Get all registered template providers.
   */
  getAll(): DashboardCapabilityProvider[] {
    return [...this.providers.values()];
  }

  /**
   * Get a specific provider by template key.
   */
  get(key: string): DashboardCapabilityProvider | undefined {
    return this.providers.get(key);
  }

  /**
   * Get all registered template keys.
   */
  getKeys(): string[] {
    return [...this.providers.keys()];
  }

  /**
   * Check if a template is registered.
   */
  has(key: string): boolean {
    return this.providers.has(key);
  }
}
