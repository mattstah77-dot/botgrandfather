import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingRuntimeService } from './booking-runtime.service';
import { BookingQueryService } from './booking-query.service';
import { Booking } from './entities/booking.entity';
import { UserState } from '../../bot/entities/user-state.entity';
import { TelegramModule } from '../../telegram/telegram.module';
import { CustomerModule } from '../../customer/customer.module';
import { AnalyticsModule } from '../../analytics/analytics.module';

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
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, UserState]),
    TelegramModule,
    CustomerModule,
    AnalyticsModule,
  ],
  providers: [BookingRuntimeService, BookingQueryService],
  exports: [BookingRuntimeService, BookingQueryService],
})
export class BookingModule {}
