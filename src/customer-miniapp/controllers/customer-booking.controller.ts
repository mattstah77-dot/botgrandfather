import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { CustomerAuthGuard } from '../auth/customer-auth.guard';
import { CustomerBookingService } from '../services/customer-booking.service';
import { CustomerSession } from '../auth/customer-session.interface';

/**
 * DTOs
 */
class CreateBookingDto {
  serviceId!: string;
  date!: string;
  timeSlot!: string;
}

/**
 * CustomerBookingController — customer-facing booking API.
 *
 * Routes: /api/customer/bot/:botId/*
 *
 * AUTH:
 * - CustomerAuthGuard validates Telegram initData using the child bot's token.
 * - CustomerSession is attached to request (telegramUserId, botId).
 *
 * ISOLATION:
 * - Every endpoint is scoped to :botId.
 * - Customer can only access their own bookings.
 * - No owner dashboard logic.
 * - No operational aggregation.
 *
 * DIFFERENT from owner endpoints (/miniapp/*):
 * - These are runtime UX APIs, not operational CRUD.
 * - Auth uses child bot token, not platform bot token.
 */
@Controller('api/customer/bot/:botId')
@UseGuards(CustomerAuthGuard)
export class CustomerBookingController {
  constructor(private readonly customerBookingService: CustomerBookingService) {}

  /**
   * GET /api/customer/bot/:botId/slots?date=YYYY-MM-DD
   *
   * Returns available time slots for the specified date.
   */
  @Get('slots')
  async getSlots(
    @Param('botId') botId: string,
    @Query('date') date: string,
  ) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
    }

    const slots = await this.customerBookingService.getAvailableSlots(botId, date);
    return { date, slots };
  }

  /**
   * POST /api/customer/bot/:botId/bookings
   *
   * Creates a new booking from the customer Mini App.
   */
  @Post('bookings')
  async createBooking(
    @Param('botId') botId: string,
    @Body() dto: CreateBookingDto,
    @Req() req: { customerSession: CustomerSession },
  ) {
    const { telegramUserId } = req.customerSession;

    if (!dto.serviceId || !dto.date || !dto.timeSlot) {
      throw new BadRequestException('serviceId, date, and timeSlot are required');
    }

    const booking = await this.customerBookingService.createBooking({
      botId,
      telegramUserId,
      serviceId: dto.serviceId,
      date: dto.date,
      timeSlot: dto.timeSlot,
    });

    return {
      id: booking.id,
      serviceId: booking.serviceId,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      createdAt: booking.createdAt,
    };
  }

  /**
   * GET /api/customer/bot/:botId/bookings/:bookingId
   *
   * Returns a single booking (customer-scoped).
   */
  @Get('bookings/:bookingId')
  async getBooking(
    @Param('botId') botId: string,
    @Param('bookingId') bookingId: string,
    @Req() req: { customerSession: CustomerSession },
  ) {
    const { telegramUserId } = req.customerSession;

    const booking = await this.customerBookingService.getBooking(
      botId,
      bookingId,
      telegramUserId,
    );

    return {
      id: booking.id,
      serviceId: booking.serviceId,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      createdAt: booking.createdAt,
    };
  }
}
