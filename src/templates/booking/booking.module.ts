import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
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
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, UserState]),
    TelegramModule,
    CustomerModule,
    AnalyticsModule,
  ],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
