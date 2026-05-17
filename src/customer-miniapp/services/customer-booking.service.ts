import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../templates/booking/entities/booking.entity';
import { Bot } from '../../bot/entities/bot.entity';
import { BookingQueryService } from '../../templates/booking/booking-query.service';
import { CustomerService } from '../../customer/customer.service';
import { AnalyticsService } from '../../analytics/analytics.service';

/**
 * CustomerBookingService — customer-facing booking operations for Mini App.
 *
 * RESPONSIBILITY:
 * - Read available slots (delegates to BookingQueryService)
 * - Create bookings from Mini App (NOT from chat flow)
 * - Retrieve customer bookings
 *
 * DIFFERENT from BookingRuntimeService:
 * - BookingRuntimeService: Telegram chat flow, user state, conversation
 * - CustomerBookingService: HTTP API for Mini App, no Telegram interaction
 *
 * DIFFERENT from BookingQueryService:
 * - BookingQueryService: read-only queries
 * - CustomerBookingService: writes (create booking)
 *
 * ARCHITECTURAL NOTE:
 * This service is isolated to the Customer MiniApp layer.
 * It does NOT handle Telegram messages, runtime state, or owner operations.
 */
@Injectable()
export class CustomerBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
    private readonly bookingQueryService: BookingQueryService,
    private readonly customerService: CustomerService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Get available slots for a specific date.
   * Delegates to BookingQueryService (query-layer logic).
   */
  async getAvailableSlots(botId: string, date: string): Promise<string[]> {
    return this.bookingQueryService.getAvailableSlots(botId, date);
  }

  /**
   * Create a booking from the customer Mini App.
   *
   * Flow:
   * 1. Ensure customer exists
   * 2. Lookup service details from bot config
   * 3. Validate slot is still available (race condition check)
   * 4. Create booking
   * 5. Mark customer as converted
   * 6. Track analytics
   * 7. Return booking
   *
   * NOTE: Does NOT send Telegram confirmation messages.
   * The Mini App UI shows confirmation directly.
   */
  async createBooking(params: {
    botId: string;
    telegramUserId: string;
    serviceId: string;
    date: string;
    timeSlot: string;
  }): Promise<Booking> {
    const { botId, telegramUserId, serviceId, date, timeSlot } = params;
    const userIdNum = Number(telegramUserId);

    // Ensure customer exists
    const customer = await this.customerService.ensureCustomer(botId, userIdNum);

    // Lookup service details from bot config
    const bot = await this.botRepository.findOne({
      where: { id: botId },
      select: ['config'],
    });

    const services = (bot?.config?.services || []) as Array<{
      id: string;
      name: string;
      durationMinutes: number;
      price?: number;
    }>;

    const service = services.find((s) => s.id === serviceId);
    if (!service) {
      throw new BadRequestException('Invalid service selected');
    }

    // Validate slot is available (race condition guard)
    const availableSlots = await this.bookingQueryService.getAvailableSlots(botId, date);
    if (!availableSlots.includes(timeSlot)) {
      throw new BadRequestException('Time slot is no longer available');
    }

    // Create booking
    const booking = this.bookingRepository.create({
      botId,
      userId: BigInt(telegramUserId),
      username: customer.username,
      serviceId,
      serviceName: service.name,
      date,
      timeSlot,
      durationMinutes: service.durationMinutes,
      price: service.price ?? null,
      status: 'pending',
      timezone: (bot?.config?.timezone as string) || 'UTC',
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Mark customer as converted
    await this.customerService.updateStatus(botId, userIdNum, 'converted');

    // Track analytics
    await this.analyticsService.trackEvent(
      botId,
      'conversion:achieved',
      {
        template: 'booking',
        channel: 'miniapp',
        serviceId,
        date,
        timeSlot,
      },
    );

    return savedBooking;
  }

  /**
   * Get a booking by ID (customer-scoped).
   * Ensures the booking belongs to the requesting customer.
   */
  async getBooking(
    botId: string,
    bookingId: string,
    telegramUserId: string,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, botId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Ensure customer can only access their own bookings
    if (booking.userId !== BigInt(telegramUserId)) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }
}
