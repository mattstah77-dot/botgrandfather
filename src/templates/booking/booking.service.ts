import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, DataSource } from 'typeorm';
import { TelegramService } from '../../telegram/telegram.service';
import { TemplateContext, TemplateService } from '../template.interface';
import { UserState } from '../../bot/entities/user-state.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { CustomerService } from '../../customer/customer.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { Booking } from './entities/booking.entity';
import { BookingConfig, BookingProgress, BookingServiceItem } from './booking.types';

/**
 * Booking Service — all business logic for the booking template.
 *
 * Flow: /start → select service → select date → select time → confirm → booking created
 *
 * TRANSACTION SAFETY:
 * Booking creation, customer status update, and slot reservation
 * are wrapped in a transaction to prevent inconsistent state.
 *
 * RACE CONDITIONS:
 * Unique constraint (botId, date, timeSlot) prevents double-booking.
 * Concurrent customer creation handled by CustomerService.ensureCustomer().
 */
@Injectable()
export class BookingService implements TemplateService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly customerService: CustomerService,
    private readonly analyticsService: AnalyticsService,
    private readonly dataSource: DataSource,
    @InjectRepository(UserState)
    private readonly userStateRepository: Repository<UserState>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  // ─── Entry Points ─────────────────────────────────────────────

  async handleStart(context: TemplateContext): Promise<void> {
    // Ensure universal customer exists for this user
    await this.customerService.ensureCustomer(context.botId, context.userId, {
      username: context.username,
      firstName: context.firstName,
      lastName: context.lastName,
    });

    // Track session start analytics (template-agnostic)
    await this.analyticsService.trackEvent(context.botId, 'session:started', {
      template: 'booking',
      userId: context.userId,
      flowType: 'booking',
    });

    const state = await this.getUserState(context);

    // If user already has active booking flow, warn instead of silently resetting
    if (state.currentStep !== 'idle') {
      await this.telegramService.sendMessage(
        context.botToken,
        context.chatId,
        'You already have a booking in progress. Continue or send /restart to start over.',
      );
      return;
    }

    const config = context.botConfig as BookingConfig;

    // Reset user state and start booking flow
    await this.setUserState(context, 'select_service', {
      currentStep: 'select_service',
      selectedServiceId: null,
      selectedDate: null,
      selectedTime: null,
    });

    // Send welcome + service selection
    await this.sendServiceSelection(context, config);
  }

  async handleDefault(context: TemplateContext): Promise<void> {
    const text = context.messageText ?? '';

    // Handle restart command explicitly
    if (text === '/restart') {
      await this.clearUserState(context);
      await this.handleStart(context);
      return;
    }

    const state = await this.getUserState(context);
    const progress = state.payload as BookingProgress;

    if (!progress || progress.currentStep === 'completed') {
      // Unknown state — restart booking flow
      await this.handleStart(context);
      return;
    }

    switch (progress.currentStep) {
      case 'select_service':
        // Service selection is via callback only
        await this.telegramService.sendMessage(
          context.botToken,
          context.chatId,
          'Please select a service from the options above.',
        );
        break;

      case 'select_date':
        await this.handleDateSelection(context, progress);
        break;

      case 'select_time':
        await this.handleTimeSelection(context, progress);
        break;

      case 'confirm':
        await this.handleConfirmation(context, progress);
        break;

      default:
        await this.handleStart(context);
    }
  }

  /**
   * Handle inline button callback.
   * Called by handler when callback_data starts with "booking:"
   */
  async handleCallback(context: TemplateContext, callbackData: string): Promise<void> {
    const state = await this.getUserState(context);
    const progress = state.payload as BookingProgress;

    // Parse callback: booking:<action>:<value>
    const parts = callbackData.split(':');
    if (parts.length < 2 || parts[0] !== 'booking') {
      this.logger.warn(`Invalid callback format ignored: bot=${context.botId} user=${context.userId}`);
      return;
    }

    const action = parts[1];
    const value = parts[2];

    switch (action) {
      case 'service':
        await this.handleServiceSelected(context, progress, value);
        break;

      case 'date':
        await this.handleDateSelected(context, progress, value);
        break;

      case 'time':
        await this.handleTimeSelected(context, progress, value);
        break;

      case 'confirm':
        await this.handleConfirmBooking(context, progress);
        break;

      case 'cancel':
        await this.handleCancelBooking(context);
        break;

      default:
        this.logger.warn(`Unknown booking callback action: ${action}`);
    }
  }

  // ─── Service Selection ────────────────────────────────────────

  private async sendServiceSelection(context: TemplateContext, config: BookingConfig): Promise<void> {
    const services = config.services;

    if (services.length === 0) {
      await this.telegramService.sendMessage(
        context.botToken,
        context.chatId,
        'Sorry, no services are available for booking at this time.',
      );
      return;
    }

    const lines: string[] = [`Welcome to ${config.businessName}!`];
    lines.push('');
    lines.push('Please select a service:');

    const buttons = services.map((service) => ({
      text: `${service.name}${service.price ? ` — $${service.price}` : ''}`,
      callback_data: `booking:service:${service.id}`,
    }));

    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      lines.join('\n'),
      { inline_keyboard: [buttons] },
    );
  }

  private async handleServiceSelected(
    context: TemplateContext,
    progress: BookingProgress,
    serviceId: string,
  ): Promise<void> {
    const config = context.botConfig as BookingConfig;
    const service = config.services.find((s) => s.id === serviceId);

    if (!service) {
      this.logger.warn(`Invalid service selected: ${serviceId}`);
      await this.telegramService.sendMessage(
        context.botToken,
        context.chatId,
        'Invalid service selected. Please try again.',
      );
      return;
    }

    // Update progress
    await this.setUserState(context, 'select_date', {
      ...progress,
      currentStep: 'select_date',
      selectedServiceId: serviceId,
    });

    // Show date selection
    await this.sendDateSelection(context, config);
  }

  // ─── Date Selection ───────────────────────────────────────────

  private async sendDateSelection(context: TemplateContext, config: BookingConfig): Promise<void> {
    const today = new Date();
    const dates: string[] = [];

    // Offer next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
    }

    const buttons = dates.map((date) => {
      const displayDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      return {
        text: displayDate,
        callback_data: `booking:date:${date}`,
      };
    });

    // Split into rows of 3
    const rows: typeof buttons[] = [];
    for (let i = 0; i < buttons.length; i += 3) {
      rows.push(buttons.slice(i, i + 3));
    }

    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      'Please select a date:',
      { inline_keyboard: rows },
    );
  }

  private async handleDateSelection(context: TemplateContext, progress: BookingProgress): Promise<void> {
    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      'Please select a date from the options above.',
    );
  }

  private async handleDateSelected(
    context: TemplateContext,
    progress: BookingProgress,
    date: string,
  ): Promise<void> {
    const config = context.botConfig as BookingConfig;

    // Validate date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      await this.telegramService.sendMessage(
        context.botToken,
        context.chatId,
        'Please select a future date.',
      );
      return;
    }

    // Check if day has working hours enabled
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, ...
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const dayConfig = config.workingHours[dayNames[dayOfWeek]];

    if (!dayConfig || !dayConfig.enabled || dayConfig.slots.length === 0) {
      await this.telegramService.sendMessage(
        context.botToken,
        context.chatId,
        'Sorry, no available slots for this date. Please select another date.',
      );
      return;
    }

    // Update progress
    await this.setUserState(context, 'select_time', {
      ...progress,
      currentStep: 'select_time',
      selectedDate: date,
    });

    // Show time selection
    await this.sendTimeSelection(context, config, date, dayConfig.slots);
  }

  // ─── Time Selection ───────────────────────────────────────────

  private async sendTimeSelection(
    context: TemplateContext,
    config: BookingConfig,
    date: string,
    slots: { time: string; durationMinutes: number }[],
  ): Promise<void> {
    // Get already booked slots for this date
    const bookedSlots = await this.getBookedSlots(context.botId, date);
    const bookedTimes = new Set(bookedSlots.map((b) => b.timeSlot));

    const availableSlots = slots.filter((slot) => !bookedTimes.has(slot.time));

    if (availableSlots.length === 0) {
      await this.telegramService.sendMessage(
        context.botToken,
        context.chatId,
        'Sorry, all slots for this date are booked. Please select another date.',
      );
      // Go back to date selection
      await this.setUserState(context, 'select_date', {
        ...(await this.getUserState(context)).payload as BookingProgress,
        currentStep: 'select_date',
      });
      return;
    }

    const buttons = availableSlots.map((slot) => ({
      text: slot.time,
      callback_data: `booking:time:${slot.time}`,
    }));

    // Split into rows of 3
    const rows: typeof buttons[] = [];
    for (let i = 0; i < buttons.length; i += 3) {
      rows.push(buttons.slice(i, i + 3));
    }

    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      `Available slots for ${date}:`,
      { inline_keyboard: rows },
    );
  }

  private async handleTimeSelection(context: TemplateContext, progress: BookingProgress): Promise<void> {
    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      'Please select a time slot from the options above.',
    );
  }

  private async handleTimeSelected(
    context: TemplateContext,
    progress: BookingProgress,
    time: string,
  ): Promise<void> {
    const config = context.botConfig as BookingConfig;

    // Update progress
    await this.setUserState(context, 'confirm', {
      ...progress,
      currentStep: 'confirm',
      selectedTime: time,
    });

    // Show confirmation
    const service = config.services.find((s) => s.id === progress.selectedServiceId);
    const lines: string[] = ['📅 Booking Summary'];
    lines.push('');
    lines.push(`Service: ${service?.name || 'Unknown'}`);
    lines.push(`Date: ${progress.selectedDate}`);
    lines.push(`Time: ${time}`);
    lines.push('');
    lines.push('Please confirm your booking:');

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Confirm', callback_data: 'booking:confirm:yes' },
          { text: '❌ Cancel', callback_data: 'booking:cancel:yes' },
        ],
      ],
    };

    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      lines.join('\n'),
      keyboard,
    );
  }

  // ─── Confirmation & Booking Creation ──────────────────────────

  private async handleConfirmation(context: TemplateContext, progress: BookingProgress): Promise<void> {
    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      'Please confirm or cancel your booking using the buttons above.',
    );
  }

  /**
   * Handle booking confirmation.
   *
   * TRANSACTION SAFETY:
   * Booking creation and customer status update are wrapped
   * in a transaction. Slot uniqueness is enforced by database constraint.
   */
  private async handleConfirmBooking(
    context: TemplateContext,
    progress: BookingProgress,
  ): Promise<void> {
    const config = context.botConfig as BookingConfig;
    const service = config.services.find((s) => s.id === progress.selectedServiceId);

    if (!service || !progress.selectedDate || !progress.selectedTime) {
      this.logger.error(`Invalid booking state: ${JSON.stringify(progress)}`);
      await this.telegramService.sendMessage(
        context.botToken,
        context.chatId,
        'Something went wrong. Please start over with /start.',
      );
      await this.clearUserState(context);
      return;
    }

    // Check if slot is still available (race condition protection)
    const existingBooking = await this.bookingRepository.findOne({
      where: {
        botId: context.botId,
        date: progress.selectedDate,
        timeSlot: progress.selectedTime,
        status: 'pending',
      },
    });

    if (existingBooking) {
      await this.telegramService.sendMessage(
        context.botToken,
        context.chatId,
        'Sorry, this slot was just booked by someone else. Please select another time.',
      );
      // Go back to time selection
      await this.setUserState(context, 'select_time', {
        ...progress,
        currentStep: 'select_time',
      });
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let booking: Booking | null = null;

    try {
      // Create booking within transaction
      booking = this.bookingRepository.create({
        botId: context.botId,
        userId: BigInt(context.userId),
        username: context.username || null,
        serviceId: service.id,
        serviceName: service.name,
        date: progress.selectedDate,
        timeSlot: progress.selectedTime,
        durationMinutes: service.durationMinutes,
        price: service.price || null,
        status: 'pending',
        timezone: config.timezone,
      });
      await queryRunner.manager.save(booking);

      // Update universal customer status within transaction
      await queryRunner.manager.update(
        Customer,
        { botId: context.botId, telegramUserId: BigInt(context.userId) },
        { status: 'converted' },
      );

      await queryRunner.commitTransaction();
      this.logger.log(`Booking created: bot=${context.botId} user=${context.userId} date=${progress.selectedDate} time=${progress.selectedTime}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Check if this is a unique constraint violation (slot already taken)
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError;
        const isUniqueViolation =
          driverError?.code === '23505' ||
          (driverError?.message && driverError.message.includes('unique'));

        if (isUniqueViolation) {
          this.logger.warn(`Slot race condition: bot=${context.botId} date=${progress.selectedDate} time=${progress.selectedTime}`);
          await this.telegramService.sendMessage(
            context.botToken,
            context.chatId,
            'Sorry, this slot was just booked by someone else. Please select another time.',
          );
          // Go back to time selection
          await this.setUserState(context, 'select_time', {
            ...progress,
            currentStep: 'select_time',
          });
          return;
        }
      }

      this.logger.error(`Booking creation failed: bot=${context.botId} user=${context.userId} error=${(error as Error).message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Track analytics (non-critical, outside transaction)
    await this.analyticsService.trackEvent(context.botId, 'session:completed', {
      template: 'booking',
      userId: context.userId,
      flowType: 'booking',
    });

    await this.analyticsService.trackEvent(context.botId, 'conversion:achieved', {
      template: 'booking',
      userId: context.userId,
      conversionType: 'booking',
      serviceId: service.id,
      date: progress.selectedDate,
      timeSlot: progress.selectedTime,
    });

    // Send confirmation message
    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      config.confirmationMessage,
    );

    // Notify owner
    await this.notifyOwner(context, booking);

    // Clear user state
    await this.clearUserState(context);

    this.logger.log(`Booking flow completed: bot=${context.botId} user=${context.userId}`);
  }

  private async handleCancelBooking(context: TemplateContext): Promise<void> {
    const config = context.botConfig as BookingConfig;

    await this.analyticsService.trackEvent(context.botId, 'session:abandoned', {
      template: 'booking',
      userId: context.userId,
      flowType: 'booking',
    });

    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      config.cancellationMessage,
    );

    await this.clearUserState(context);
  }

  // ─── Owner Notification ───────────────────────────────────────

  /**
   * Send booking notification to business owner via Telegram.
   */
  private async notifyOwner(context: TemplateContext, booking: Booking): Promise<void> {
    const config = context.botConfig as BookingConfig;
    const ownerChatId = config.ownerChatId;

    if (!ownerChatId) {
      this.logger.warn(`Owner notification skipped: no ownerChatId configured for bot=${context.botId}`);
      return;
    }

    const chatId = parseInt(ownerChatId, 10);
    if (isNaN(chatId)) {
      this.logger.warn(`Owner notification skipped: invalid ownerChatId=${ownerChatId}`);
      return;
    }

    const lines: string[] = ['📅 New Booking'];
    lines.push('');
    lines.push(`Service: ${booking.serviceName}`);
    lines.push(`Date: ${booking.date}`);
    lines.push(`Time: ${booking.timeSlot}`);
    if (booking.price) {
      lines.push(`Price: $${booking.price}`);
    }
    lines.push('');
    if (context.username) {
      lines.push(`User: @${context.username}`);
    } else if (context.firstName) {
      lines.push(`User: ${context.firstName}${context.lastName ? ' ' + context.lastName : ''}`);
    }
    lines.push(`User ID: ${context.userId}`);

    const text = lines.join('\n');

    await this.telegramService.sendMessage(context.botToken, chatId, text);
  }

  // ─── Operational Queries ──────────────────────────────────────

  /**
   * Get bookings for a bot (for Mini App).
   */
  async getBotBookings(
    botId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: Booking[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.bookingRepository.findAndCount({
      where: { botId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const pages = Math.ceil(total / limit);

    return {
      items,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get booked slots for a specific date.
   */
  async getBookedSlots(botId: string, date: string): Promise<{ timeSlot: string }[]> {
    const bookings = await this.bookingRepository.find({
      where: { botId, date, status: 'pending' },
      select: ['timeSlot'],
    });

    return bookings.map((b) => ({ timeSlot: b.timeSlot }));
  }

  /**
   * Count bookings for MULTIPLE bots in a single query.
   * Scalability fix: replaces N+1 queries with one aggregate query.
   */
  async countBookingsByBotIds(botIds: string[]): Promise<Record<string, number>> {
    if (botIds.length === 0) {
      return {};
    }

    const results = await this.bookingRepository
      .createQueryBuilder('b')
      .select('b.botId', 'botId')
      .addSelect('COUNT(*)', 'count')
      .where('b.botId IN (:...botIds)', { botIds })
      .groupBy('b.botId')
      .getRawMany();

    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.botId] = parseInt(row.count, 10);
    }

    return counts;
  }

  // ─── User State Helpers ───────────────────────────────────────

  private async getUserState(context: TemplateContext): Promise<UserState> {
    let state = await this.userStateRepository.findOne({
      where: { botId: context.botId, userId: BigInt(context.userId) },
    });

    if (!state) {
      state = this.userStateRepository.create({
        botId: context.botId,
        userId: BigInt(context.userId),
        currentStep: 'idle',
        payload: {},
      });

      try {
        await this.userStateRepository.save(state);
      } catch (error) {
        // Unique constraint violation — another webhook created the state first
        if (error instanceof QueryFailedError) {
          const driverError = error.driverError;
          const isUniqueViolation =
            driverError?.code === '23505' ||
            (driverError?.message && driverError.message.includes('unique'));

          if (isUniqueViolation) {
            this.logger.debug(
              `UserState race resolved: bot=${context.botId} user=${context.userId}`,
            );
            state = await this.userStateRepository.findOne({
              where: { botId: context.botId, userId: BigInt(context.userId) },
            });
            if (!state) {
              this.logger.error(
                `Unexpected: UserState not found after unique violation: bot=${context.botId} user=${context.userId}`,
              );
              throw error;
            }
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    return state;
  }

  private async setUserState(
    context: TemplateContext,
    step: string,
    payload: Record<string, any>,
  ): Promise<void> {
    await this.userStateRepository.update(
      { botId: context.botId, userId: BigInt(context.userId) },
      { currentStep: step, payload },
    );
  }

  private async clearUserState(context: TemplateContext): Promise<void> {
    await this.setUserState(context, 'idle', {});
  }
}
