import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingRuntimeService } from './booking-runtime.service';
import { BookingQueryService } from './booking-query.service';
import { BookingLifecycleController } from './controllers/booking-lifecycle.controller';
import { Booking } from './entities/booking.entity';
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
 * NOTE: Runtime and Query services are separated.
 * - BookingRuntimeService: runtime conversation flow (used by TemplateFactory)
 * - BookingQueryService: operational data access (used by MiniappModule)
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
    TypeOrmModule.forFeature([Booking, Bot, UserState]),
    TelegramModule,
    CustomerModule,
    AnalyticsModule,
    MiniAppAuthModule,
    OwnershipModule,
  ],
  controllers: [BookingLifecycleController],
  providers: [BookingRuntimeService, BookingQueryService],
  exports: [BookingRuntimeService, BookingQueryService],
})
export class BookingModule {}
