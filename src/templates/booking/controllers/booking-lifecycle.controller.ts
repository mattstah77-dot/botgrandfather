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

/**
 * Booking Lifecycle Controller — runtime endpoints for owner-triggered transitions.
 *
 * ARCHITECTURAL PRINCIPLE:
 * These endpoints execute booking business logic (state transitions).
 * They are NOT operational read-only endpoints.
 * They live in the runtime module (templates/booking/), NOT the miniapp module.
 *
 * WHY runtime module:
 * - Booking lifecycle is business logic, not operational visibility.
 * - Operational layer (miniapp) is read-only per ROS.1 and temporal semantics §8.
 * - Owner-triggered transitions are still runtime behavior.
 *
 * SECURITY:
 * - MiniAppAuthGuard: validates Telegram initData
 * - BotOwnershipGuard: verifies owner owns the bot
 * - BookingRuntimeService: verifies booking belongs to bot
 * No cross-tenant operations possible.
 *
 * CANONICAL TRANSITIONS (per booking-temporal-semantics.md §6):
 * - pending → confirmed
 * - pending → cancelled
 * - confirmed → cancelled
 * - confirmed → completed
 * - confirmed → no-show
 */
@Controller('miniapp/bots')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
export class BookingLifecycleController {
  constructor(
    private readonly bookingRuntimeService: BookingRuntimeService,
  ) {}

  /**
   * POST /miniapp/bots/:id/bookings/:bookingId/confirm
   *
   * Confirm a pending booking.
   * Allowed: pending → confirmed
   */
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
      return { success: true, booking };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to confirm booking',
      );
    }
  }

  /**
   * POST /miniapp/bots/:id/bookings/:bookingId/cancel
   *
   * Cancel a booking.
   * Allowed: pending → cancelled, confirmed → cancelled
   */
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
      return { success: true, booking };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to cancel booking',
      );
    }
  }

  /**
   * POST /miniapp/bots/:id/bookings/:bookingId/complete
   *
   * Mark a confirmed booking as completed.
   * Allowed: confirmed → completed
   */
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
      return { success: true, booking };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to complete booking',
      );
    }
  }

  /**
   * POST /miniapp/bots/:id/bookings/:bookingId/no-show
   *
   * Mark a confirmed booking as no-show.
   * Allowed: confirmed → no-show
   */
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
      return { success: true, booking };
    } catch (error) {
      throw new BadRequestException(
        (error as Error).message || 'Failed to mark no-show',
      );
    }
  }
}
