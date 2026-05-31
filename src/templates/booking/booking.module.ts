import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingRuntimeService } from './booking-runtime.service';
import { BookingQueryService } from './booking-query.service';
import { BookingLifecycleController } from './controllers/booking-lifecycle.controller';
import { Booking } from './entities/booking.entity';
import { ProviderAvailability } from './entities/provider-availability.entity';
import { AvailabilityExclusion } from './entities/availability-exclusion.entity';
import { BookingRepository } from './repositories/booking.repository';
import { ProviderAvailabilityRepository } from './repositories/provider-availability.repository';
import { AvailabilityExclusionRepository } from './repositories/availability-exclusion.repository';
import { BookingValidationService } from './services/booking-validation.service';
import { AvailabilityService } from './services/availability.service';
import { Bot } from '../../bot/entities/bot.entity';
import { UserState } from '../../bot/entities/user-state.entity';
import { TelegramModule } from '../../telegram/telegram.module';
import { CustomerModule } from '../../customer/customer.module';
import { AnalyticsModule } from '../../analytics/analytics.module';
import { MiniAppAuthModule } from '../../miniapp/auth/miniapp-auth.module';
import { OwnershipModule } from '../../ownership/ownership.module';

/**
 * Booking Template Module — NestJS module for booking template.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This module is self-contained. It imports only universal platform modules.
 * No cross-template imports. No operational layer imports.
 *
 * DOMAIN LAYER:
 * - Entities: Booking, ProviderAvailability, AvailabilityExclusion
 * - Repositories: BookingRepository, ProviderAvailabilityRepository, AvailabilityExclusionRepository
 * - Services: AvailabilityService (computation from truth)
 *
 * RUNTIME LAYER:
 * - BookingRuntimeService: runtime conversation flow (used by TemplateFactory)
 * - BookingHandler: Telegram webhook handler
 *
 * OPERATIONAL LAYER (exposed via BookingQueryService):
 * - BookingQueryService: read-only data access (used by MiniappModule)
 * - BookingLifecycleController: owner-triggered state transitions
 *
 * DI NOTE: TypeOrmModule.forFeature([Bot]) is required for
 * BookingQueryService.getAvailableSlots() to read bot config (working hours).
 * This is query-layer data access, NOT runtime flow.
 *
 * AUTH NOTE: MiniAppAuthModule and OwnershipModule are imported for
 * BookingLifecycleController. This is a cross-cutting security concern,
 * NOT an operational layer import. No circular dependencies exist.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      ProviderAvailability,
      AvailabilityExclusion,
      Bot,
      UserState,
    ]),
    TelegramModule,
    CustomerModule,
    AnalyticsModule,
    MiniAppAuthModule,
    OwnershipModule,
  ],
  controllers: [BookingLifecycleController],
  providers: [
    // Domain layer
    BookingRepository,
    ProviderAvailabilityRepository,
    AvailabilityExclusionRepository,
    AvailabilityService,
    BookingValidationService,
    // Runtime layer
    BookingRuntimeService,
    // Operational layer
    BookingQueryService,
  ],
  exports: [
    BookingRuntimeService,
    BookingQueryService,
    AvailabilityService,
    BookingValidationService,
    BookingRepository,
    ProviderAvailabilityRepository,
    AvailabilityExclusionRepository,
  ],
})
export class BookingModule {}
