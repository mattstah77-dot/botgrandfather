import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common';
import { MiniAppAuthGuard } from '../auth/miniapp-auth.guard';
import { BotOwnershipGuard } from '../../ownership/bot-ownership.guard';
import { BookingQueryService } from '../../templates/booking/booking-query.service';

/**
 * Booking Dashboard Controller — bot-specific booking operational endpoints.
 *
 * ARCHITECTURAL PRINCIPLE:
 * These endpoints serve booking operational data.
 * They use BookingQueryService (NOT runtime service) — read-only operational layer.
 *
 * SECURITY:
 * All bot-scoped endpoints enforce ownership via BotOwnershipGuard.
 * Cross-tenant access is impossible.
 */
@Controller('miniapp/bots')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
export class BookingDashboardController {
  constructor(private readonly bookingQueryService: BookingQueryService) {}

  /**
   * GET /miniapp/bots/:id/bookings
   *
   * Booking list for a bot.
   * Supports: status filter, search query, date sorting.
   */
  @Get(':id/bookings')
  async getBotBookings(
    @Param('id') botId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.bookingQueryService.getBotBookings(botId, page, limit, status, search, sort);
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
    const bookings = await this.bookingQueryService.getBotBookings(botId, 1, 100);
    return bookings;
  }

  /**
   * GET /miniapp/bots/:id/bookings/:bookingId
   *
   * Single booking detail view.
   * Includes available owner actions (operational metadata).
   */
  @Get(':id/bookings/:bookingId')
  async getBookingDetail(
    @Param('id') botId: string,
    @Param('bookingId') bookingId: string,
  ) {
    const booking = await this.bookingQueryService.getBookingById(botId, bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const availableActions = this.bookingQueryService.getBookingAvailableActions(booking.status);

    return {
      ...booking,
      availableActions,
    };
  }
}
