import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { MiniAppAuthGuard } from '../../../miniapp/auth/miniapp-auth.guard';
import { BotOwnershipGuard } from '../../../ownership/bot-ownership.guard';
import { BookingRuntimeService } from '../booking-runtime.service';
import { Booking } from '../entities/booking.entity';

// ... existing comments ...

@Controller('miniapp/bots')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
export class BookingLifecycleController {
  constructor(
    private readonly bookingRuntimeService: BookingRuntimeService,
  ) {}

  /**
   * Serialize booking for API response.
   * CRITICAL: bigint userId must be converted to string for JSON serialization.
   */
  private serializeBooking(booking: Booking): Record<string, unknown> {
    return {
      id: booking.id,
      botId: booking.botId,
      userId: String(booking.userId),
      username: booking.username,
      providerId: booking.providerId,
      serviceId: booking.serviceId,
      serviceName: booking.serviceName,
      date: booking.date,
      timeSlot: booking.timeSlot,
      durationMinutes: booking.durationMinutes,
      price: booking.price,
      status: booking.status,
      notes: booking.notes,
      timezone: booking.timezone,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  @Post(':id/bookings/:bookingId/confirm')
  async confirmBooking(
    @Param('id') botId: string,
    @Param('bookingId') bookingId: string,
  ) {
    try {
      const booking = await this.bookingRuntimeService.confirmBooking(
        botId,
        bookingId,
      );
      return { success: true, booking: this.serializeBooking(booking) };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to confirm booking',
      );
    }
  }

  @Post(':id/bookings/:bookingId/cancel')
  async cancelBooking(
    @Param('id') botId: string,
    @Param('bookingId') bookingId: string,
    @Body() body?: { reason?: string },
  ) {
    try {
      const booking = await this.bookingRuntimeService.cancelBooking(
        botId,
        bookingId,
        body?.reason,
      );
      return { success: true, booking: this.serializeBooking(booking) };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to cancel booking',
      );
    }
  }

  @Post(':id/bookings/:bookingId/complete')
  async completeBooking(
    @Param('id') botId: string,
    @Param('bookingId') bookingId: string,
  ) {
    try {
      const booking = await this.bookingRuntimeService.completeBooking(
        botId,
        bookingId,
      );
      return { success: true, booking: this.serializeBooking(booking) };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to complete booking',
      );
    }
  }

  @Post(':id/bookings/:bookingId/no-show')
  async markNoShow(
    @Param('id') botId: string,
    @Param('bookingId') bookingId: string,
  ) {
    try {
      const booking = await this.bookingRuntimeService.markNoShow(
        botId,
        bookingId,
      );
      return { success: true, booking: this.serializeBooking(booking) };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to mark no-show',
      );
    }
  }

  @Post(':id/bookings/:bookingId/reschedule')
  async rescheduleBooking(
    @Param('id') botId: string,
    @Param('bookingId') bookingId: string,
    @Body() body: { date: string; time: string },
  ) {
    try {
      const { date, time } = body;

      if (!date || !time) {
        throw new BadRequestException('Date and time are required');
      }

      const booking = await this.bookingRuntimeService.rescheduleBooking(
        botId,
        bookingId,
        date,
        time,
      );
      return { success: true, booking: this.serializeBooking(booking) };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to reschedule booking',
      );
    }
  }
}
