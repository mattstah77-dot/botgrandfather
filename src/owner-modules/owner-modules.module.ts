import { Module } from '@nestjs/common';
import { OwnerModulesController } from './owner-modules.controller';

/**
 * Owner Modules Module
 *
 * Aggregates all template-specific owner module registrations.
 * Importing this module triggers registration of all owner module definitions.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Every template can define its owner-facing capabilities.
 * The mini app reads from the central registry to render UI dynamically.
 */

// Side-effect: registers lead-funnel owner module
import './lead-funnel/lead-funnel.owner-module';

// Side-effect: registers booking owner module
import '../templates/booking/booking.owner-module';

@Module({
  controllers: [OwnerModulesController],
  providers: [],
  exports: [],
})
export class OwnerModulesModule {}
