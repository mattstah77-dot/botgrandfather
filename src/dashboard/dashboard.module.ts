import { Module } from '@nestjs/common';
import { DashboardCapabilityRegistry } from './dashboard-capability.registry';
import { BookingModule } from '../templates/booking/booking.module';
import { SupportModule } from '../templates/support/support.module';
import { LeadFunnelModule } from '../templates/lead-funnel/lead-funnel.module';

/**
 * Dashboard Module — operational metrics aggregation.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This module owns the DashboardCapabilityRegistry.
 * It does NOT own template providers (they live in template modules).
 * It does NOT own DashboardService (that lives in MiniappModule).
 *
 * WHY separate module:
 * - DashboardCapabilityRegistry is a shared dependency
 * - Both MiniappModule and template modules need visibility
 * - Keeps registry close to its interface definition
 *
 * REGISTRATION PATTERN:
 * Template modules export their query services (which implement DashboardCapabilityProvider).
 * DashboardModule imports template modules directly for query service injection.
 * DashboardCapabilityRegistry receives them via constructor injection.
 * DashboardService uses the registry, NOT individual services.
 *
 * VISIBILITY NOTE:
 * - BookingModule, SupportModule, LeadFunnelModule are imported here
 *   to provide query services to DashboardCapabilityRegistry.
 * - Runtime services within those modules are NOT consumed here.
 * - This is explicit dependency declaration, NOT accidental coupling.
 */
@Module({
  imports: [BookingModule, SupportModule, LeadFunnelModule],
  providers: [DashboardCapabilityRegistry],
  exports: [DashboardCapabilityRegistry],
})
export class DashboardModule {}
