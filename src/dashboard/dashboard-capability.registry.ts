import { Injectable } from '@nestjs/common';
import { DashboardCapabilityProvider } from './interfaces/dashboard-capability-provider.interface';
import { BookingQueryService } from '../templates/booking/booking-query.service';
import { LeadFunnelQueryService } from '../templates/lead-funnel/lead-funnel-query.service';
import { SupportQueryService } from '../templates/support/support-query.service';

/**
 * DashboardCapabilityRegistry — explicit capability registration.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This is NOT dynamic discovery. It is NOT a plugin registry.
 * It is NOT metadata-driven. It is NOT auto-registration.
 *
 * It is: explicit constructor-based registration of known providers.
 *
 * WHY explicit registration:
 * - No hidden dependencies
 * - No runtime magic
 * - Clear to new engineers: "these are the capabilities"
 * - Type-safe: TypeScript validates all providers at compile time
 * - Debuggable: set breakpoint in constructor, see all providers
 *
 * WHY NOT dynamic discovery:
 * - We have 3 capabilities, not 50
 * - Dynamic discovery adds complexity without benefit at this scale
 * - Reflection and decorators are framework-building, NOT platform development
 * - Explicit is better than implicit for monolithic clarity
 *
 * SCALING:
 * Adding a new capability requires:
 * 1. Create QueryService implementing DashboardCapabilityProvider
 * 2. Add it to DashboardCapabilityRegistry constructor
 * 3. Add it to DashboardModule providers
 *
 * DashboardService does NOT change.
 */
@Injectable()
export class DashboardCapabilityRegistry {
  private readonly providers = new Map<string, DashboardCapabilityProvider>();

  constructor(
    // EXPLICIT registration of all capability providers.
    // Each new capability adds ONE parameter here.
    // This is the ONLY place that knows about all capabilities.
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
        `Duplicate capability provider registered: ${key}. ` +
          'Each capability key must be unique.',
      );
    }
    this.providers.set(key, provider);
  }

  /**
   * Get all registered capability providers.
   */
  getAll(): DashboardCapabilityProvider[] {
    return [...this.providers.values()];
  }

  /**
   * Get a specific provider by capability key.
   */
  get(key: string): DashboardCapabilityProvider | undefined {
    return this.providers.get(key);
  }

  /**
   * Get all registered capability keys.
   */
  getKeys(): string[] {
    return [...this.providers.keys()];
  }

  /**
   * Check if a capability is registered.
   */
  has(key: string): boolean {
    return this.providers.has(key);
  }
}
