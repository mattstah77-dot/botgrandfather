import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bot } from '../bot/entities/bot.entity';
import { Booking } from '../templates/booking/entities/booking.entity';
import { BookingModule } from '../templates/booking/booking.module';
import { CustomerModule } from '../customer/customer.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { CustomerAuthGuard } from './auth/customer-auth.guard';
import { CustomerBookingController } from './controllers/customer-booking.controller';
import { CustomerBookingService } from './services/customer-booking.service';

/**
 * CustomerMiniappModule — customer-facing Mini App API layer.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This module is COMPLETELY ISOLATED from the owner operational layer.
 *
 * ISOLATION RULES:
 * - Does NOT import MiniappModule (owner dashboard)
 * - Does NOT import OwnerModule
 * - Does NOT import DashboardService
 * - Does NOT use MiniAppAuthGuard (owner auth)
 * - Uses CustomerAuthGuard (customer auth with child bot token)
 *
 * DEPENDENCIES:
 * - BookingModule: for BookingQueryService (query-layer reads)
 * - CustomerModule: for CustomerService (customer lifecycle)
 * - AnalyticsModule: for AnalyticsService (event tracking)
 * - TypeOrmModule: for BotRepository (auth guard) and BookingRepository (writes)
 *
 * ROUTES:
 * - /customer/bot/:botId/slots
 * - /customer/bot/:botId/bookings
 * - /customer/bot/:botId/bookings/:bookingId
 *
 * AUTH:
 * - CustomerAuthGuard validates initData using child bot token.
 * - CustomerSession attached to request.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Bot, Booking]),
    BookingModule,
    CustomerModule,
    AnalyticsModule,
  ],
  controllers: [CustomerBookingController],
  providers: [CustomerAuthGuard, CustomerBookingService],
  exports: [CustomerAuthGuard, CustomerBookingService],
})
export class CustomerMiniappModule {}
