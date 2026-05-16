import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { MiniAppAuthGuard } from '../auth/miniapp-auth.guard';
import { BotOwnershipGuard } from '../../bot/bot-ownership.guard';
import { BookingService } from '../../templates/booking/booking.service';

/**
 * Booking Dashboard Controller — bot-specific booking operational endpoints.
 *
 * ARCHITECTURAL PRINCIPLE:
 * These endpoints serve booking operational data.
 * They are template-agnostic in structure — the same pattern works for all templates.
 *
 * SECURITY:
 * All bot-scoped endpoints enforce ownership via BotOwnershipGuard.
 * Cross-tenant access is impossible.
 */
@Controller('miniapp/bots')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
export class BookingDashboardController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * GET /miniapp/bots/:id/bookings
   *
   * Booking list for a bot.
   */
  @Get(':id/bookings')
  async getBotBookings(
    @Param('id') botId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.bookingService.getBotBookings(botId, page, limit);
  }

  /**
   * GET /miniapp/bots/:id/bookings/calendar
   *
   * Calendar view data for a bot.
   * Returns bookings grouped by date.
   */
  @Get(':id/bookings/calendar')
  async getBotBookingsCalendar(
    @Param('id') botId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    // TODO: Implement calendar aggregation query
    // For now, return all bookings in date range
    const bookings = await this.bookingService.getBotBookings(botId, 1, 100);
    return bookings;
  }
}
