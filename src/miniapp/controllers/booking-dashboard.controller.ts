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
import {
  BookingOperationalProjection,
  BookingDashboardProjection,
  BookingCalendarProjection,
} from '../../templates/booking/projections';

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
   * Returns BookingOperationalProjection — read-only projection.
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
  ): Promise<{ items: BookingOperationalProjection[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    return this.bookingQueryService.getOperationalBookings(botId, page, limit, status, search, sort);
  }

  /**
   * GET /miniapp/bots/:id/bookings/metrics
   *
   * Dashboard metrics for booking template.
   * Returns BookingDashboardProjection — simple recomputation only.
   */
  @Get(':id/bookings/metrics')
  async getBookingMetrics(
    @Param('id') botId: string,
  ): Promise<BookingDashboardProjection> {
    return this.bookingQueryService.getDashboardMetrics(botId);
  }

  /**
   * GET /miniapp/bots/:id/bookings/calendar
   *
   * Calendar view data for a bot.
   * Returns BookingCalendarProjection — observational only.
   * Date range required: from, to (YYYY-MM-DD).
   */
  @Get(':id/bookings/calendar')
  async getBotBookingsCalendar(
    @Param('id') botId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<BookingCalendarProjection[]> {
    // Default to current month if no range provided
    // FIX: Use UTC consistently to avoid timezone drift in non-UTC environments.
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // 1-based

    const defaultFrom = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const defaultTo = `${year}-${String(month).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

    const resolvedFrom = from || defaultFrom;
    const resolvedTo = to || defaultTo;

    return this.bookingQueryService.getCalendarProjection(botId, resolvedFrom, resolvedTo);
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
      userId: String(booking.userId),
      availableActions,
    };
  }
}
