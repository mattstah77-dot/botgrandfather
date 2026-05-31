import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking } from '../../templates/booking/entities/booking.entity';
import { Bot } from '../../bot/entities/bot.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { BookingQueryService } from '../../templates/booking/booking-query.service';
import { BookingValidationService, BookingValidationError } from '../../templates/booking/services/booking-validation.service';
import { CustomerService } from '../../customer/customer.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { TelegramService } from '../../telegram/telegram.service';
import { BookingConfig } from '../../templates/booking/booking.types';
import { WEBHOOK_HOST } from '../../config/env.config';

// ... existing comments ...

@Injectable()
export class CustomerBookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
    private readonly bookingQueryService: BookingQueryService,
    private readonly bookingValidationService: BookingValidationService,
    private readonly customerService: CustomerService,
    private readonly analyticsService: AnalyticsService,
    private readonly telegramService: TelegramService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get available slots for a specific date.
   * Delegates to BookingQueryService (query-layer logic).
   */
  async getAvailableSlots(botId: string, date: string): Promise<string[]> {
    return this.bookingQueryService.getAvailableSlots(botId, date);
  }

  /**
   * Get services configured for a bot.
   * Reads from bot config — services are owner-configured truth.
   */
  async getServices(botId: string): Promise<Array<{
    id: string;
    name: string;
    durationMinutes: number;
    price?: number;
  }>> {
    const bot = await this.botRepository.findOne({
      where: { id: botId },
      select: ['config'],
    });

    return (bot?.config?.services || []) as Array<{
      id: string;
      name: string;
      durationMinutes: number;
      price?: number;
    }>;
  }

  /**
   * Create a booking from the customer Mini App.
   *
   * Flow:
   * 1. Ensure customer exists
   * 2. Lookup service details from bot config
   * 3. CANONICAL write-time validation (re-reads truth from DB)
   * 4. Create booking
   * 5. Mark customer as converted
   * 6. Track analytics
   * 7. Send chat confirmation (hybrid UX)
   * 8. Return booking
   *
   * NOTE: Write-time validation is authoritative. DB constraint is final guard.
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
      select: ['token', 'config'],
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

    // CANONICAL: Write-time validation (Phase 2 BookingValidationService)
    // Re-reads truth from DB. Not trusting read-time projections.
    try {
      await this.bookingValidationService.validateBookingCreation(botId, date, timeSlot);
    } catch (error) {
      if (error instanceof BookingValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    // ATOMIC: Booking creation + customer conversion must succeed or fail together.
    // Analytics and Telegram are side effects — executed after transaction commit.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedBooking: Booking;

    try {
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

      savedBooking = await queryRunner.manager.save(booking);

      // Mark customer as converted — using queryRunner for atomicity
      await queryRunner.manager.update(
        Customer,
        { botId, telegramUserId: BigInt(userIdNum) },
        { status: 'converted' },
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // SIDE EFFECTS: Executed after successful transaction. Failures do not rollback booking.

    // Emit customer.converted event (bypassed CustomerService due to transaction)
    await this.analyticsService.trackEvent(botId, 'customer.converted', {
      userId: userIdNum,
      source: 'miniapp',
    });

    // CANONICAL: Emit booking.created event per temporal semantics
    await this.analyticsService.trackEvent(
      botId,
      'booking.created',
      {
        template: 'booking',
        channel: 'miniapp',
        serviceId,
        date,
        timeSlot,
        userId: userIdNum,
      },
    );

    // Track conversion
    await this.analyticsService.trackEvent(
      botId,
      'conversion.completed',
      {
        template: 'booking',
        channel: 'miniapp',
        serviceId,
        date,
        timeSlot,
      },
    );

    // HYBRID UX: Send chat confirmation with MiniApp reopen button
    // Chat = access layer. MiniApp = execution layer.
    if (bot?.token) {
      const webAppUrl = `${WEBHOOK_HOST}/customer?botId=${botId}`;
      await this.telegramService.sendMessage(
        bot.token,
        userIdNum,
        `✅ Booking confirmed!\n\n📅 ${date} at ${timeSlot}\n🛎️ ${service.name}`,
        {
          inline_keyboard: [
            [{ text: '📅 Open Booking', web_app: { url: webAppUrl } }],
          ],
        },
      );

      // Notify owner (parity with runtime flow)
      const bookingConfig = bot.config as BookingConfig | undefined;
      const ownerChatId = bookingConfig?.ownerChatId;
      if (ownerChatId) {
        const ownerChatIdNum = parseInt(ownerChatId, 10);
        if (!isNaN(ownerChatIdNum)) {
          const lines: string[] = ['📅 New Booking (MiniApp)'];
          lines.push('');
          lines.push(`Service: ${service.name}`);
          lines.push(`Date: ${date}`);
          lines.push(`Time: ${timeSlot}`);
          if (service.price) {
            lines.push(`Price: $${service.price}`);
          }
          lines.push('');
          lines.push(`User ID: ${userIdNum}`);

          await this.telegramService.sendMessage(
            bot.token,
            ownerChatIdNum,
            lines.join('\n'),
          );
        }
      }
    }

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
