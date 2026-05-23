import { Module } from '@nestjs/common';
import { DashboardCapabilityRegistry } from './dashboard-capability.registry';

/**
 * DashboardModule — operational aggregation composition.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This module owns the DashboardCapabilityRegistry.
 * It does NOT own capability providers (they live in template modules).
 * It does NOT own DashboardService (that lives in MiniappModule).
 *
 * WHY separate module:
 * - DashboardCapabilityRegistry is a shared dependency
 * - Both MiniappModule and template modules need visibility
 * - Keeps registry close to its interface definition
 *
 * REGISTRATION PATTERN:
 * Template modules export their query services (which implement DashboardCapabilityProvider).
 * MiniappModule imports those query services.
 * DashboardCapabilityRegistry receives them via constructor injection.
 * DashboardService uses the registry, NOT individual services.
 */
@Module({
  providers: [DashboardCapabilityRegistry],
  exports: [DashboardCapabilityRegistry],
})
export class DashboardModule {}
