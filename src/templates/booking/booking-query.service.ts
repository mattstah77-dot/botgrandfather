import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { ProviderAvailability } from './entities/provider-availability.entity';
import { Bot } from '../../bot/entities/bot.entity';
import {
  DashboardCapabilityProvider,
  CapabilityMetrics,
} from '../../dashboard/interfaces/dashboard-capability-provider.interface';
import { WorkingHours } from './booking.types';

/**
 * BookingQueryService — operational data access for the booking template.
 *
 * RESPONSIBILITY:
 * - Read-only queries for Mini App dashboards
 * - Booking lists, counts, calendar data
 * - Slot availability checks
 * - Dashboard capability metrics (implements DashboardCapabilityProvider)
 *
 * DOES NOT:
 * - Handle Telegram conversations
 * - Manage user state
 * - Create or modify bookings (see BookingRuntimeService)
 * - Send messages
 * - Orchestrate workflows
 * - Emit events
 *
 * USED BY:
 * - BookingDashboardController (Mini App)
 * - DashboardService (via DashboardCapabilityRegistry)
 * - BookingRuntimeService (slot availability checks)
 * - CustomerBookingService (customer Mini App)
 */
@Injectable()
export class BookingQueryService implements DashboardCapabilityProvider {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(ProviderAvailability)
    private readonly providerAvailabilityRepository: Repository<ProviderAvailability>,
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
  ) {}

  /**
   * DashboardCapabilityProvider: capability key.
   */
  getCapabilityKey(): string {
    return 'booking';
  }

  /**
   * DashboardCapabilityProvider: owner-level metrics.
   * Returns total booking count across all owner's bots.
   *
   * MULTI-TENANT: Joins with Bot entity to filter by ownerId.
   */
  async getOwnerMetrics(ownerId: string): Promise<CapabilityMetrics> {
    const count = await this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoin('bot', 'bot', 'booking.botId = bot.id')
      .where('bot.ownerId = :ownerId', { ownerId })
      .getCount();

    return {
      capability: this.getCapabilityKey(),
      total: count,
    };
  }

  /**
   * DashboardCapabilityProvider: bot-level metrics.
   * Returns booking count for a specific bot.
   */
  async getBotMetrics(botId: string): Promise<CapabilityMetrics> {
    const count = await this.bookingRepository.count({ where: { botId } });
    return {
      capability: this.getCapabilityKey(),
      total: count,
    };
  }

  /**
   * Get bookings for a bot with pagination, filtering, and sorting.
   *
   * OPERATIONAL FILTERING:
   * - status: filter by booking status
   * - search: filter by service name or username (case-insensitive)
   * - sort: 'date-asc' | 'date-desc' (default: date-desc)
   *
   * WHY explicit params (not a query DSL):
   * - Simple, debuggable, no recursion.
   * - Each parameter has clear semantics.
   * - No dynamic query builder needed at this scale.
   */
  async getBotBookings(
    botId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
    sort?: string,
  ): Promise<{ items: Booking[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const skip = (page - 1) * limit;

    const queryBuilder = this.bookingRepository.createQueryBuilder('b')
      .where('b.botId = :botId', { botId });

    if (status) {
      queryBuilder.andWhere('b.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(b.serviceName) LIKE :search OR LOWER(b.username) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    // Sorting
    if (sort === 'date-asc') {
      queryBuilder.orderBy('b.date', 'ASC').addOrderBy('b.timeSlot', 'ASC');
    } else {
      // Default: date-desc (newest first)
      queryBuilder.orderBy('b.date', 'DESC').addOrderBy('b.timeSlot', 'DESC');
    }

    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

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
      where: { botId, date, status: In(['pending', 'confirmed']) },
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

  /**
   * Get available time slots for a specific date.
   *
   * NEW: Uses ProviderAvailability entity if configured, falls back to bot config.
   *
   * Reads bot config (working hours, slot duration) and subtracts booked slots.
   * Pure query-layer logic — no runtime state, no Telegram interaction.
   *
   * Returns array of available slot strings (e.g., ["09:00", "09:30", ...]).
   */
  async getAvailableSlots(botId: string, date: string): Promise<string[]> {
    // Determine day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

    // Try to get ProviderAvailability first
    const providerAvailability = await this.providerAvailabilityRepository.findOne({
      where: { botId, providerId: IsNull(), weekday: dayOfWeek },
    });

    let workingHours: WorkingHours | null = null;

    if (providerAvailability && providerAvailability.isWorkingDay && providerAvailability.startTime && providerAvailability.endTime) {
      workingHours = {
        enabled: true,
        startTime: providerAvailability.startTime,
        endTime: providerAvailability.endTime,
      };
    } else {
      // Fallback to bot config
      const bot = await this.botRepository.findOne({
        where: { id: botId },
        select: ['config'],
      });

      if (!bot) {
        return [];
      }

      const config = bot.config || {};
      workingHours = config.workingHours?.[dayOfWeek] || null;
    }

    if (!workingHours || !workingHours.enabled || !workingHours.startTime || !workingHours.endTime) {
      return []; // Closed on this day
    }

    // Check for excluded dates
    if (providerAvailability?.excludedDates?.includes(date)) {
      return []; // Holiday/break
    }

    // Get slot duration from config
    const bot = await this.botRepository.findOne({
      where: { id: botId },
      select: ['config'],
    });
    const config = bot?.config || {};
    const slotDuration = (config.slotDuration as number) || 30;

    // Generate all possible slots
    const slots = this.generateTimeSlots(workingHours.startTime, workingHours.endTime, slotDuration);

    // Get booked slots for this date
    const bookedSlots = await this.getBookedSlots(botId, date);
    const bookedSet = new Set(bookedSlots.map((b) => b.timeSlot));

    // Filter out booked slots
    return slots.filter((slot) => !bookedSet.has(slot));
  }

  /**
   * Get upcoming bookings for a bot (next 7 days).
   * Read-only operational query.
   */
  async getUpcomingBookings(botId: string): Promise<Booking[]> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    return this.bookingRepository
      .createQueryBuilder('b')
      .where('b.botId = :botId', { botId })
      .andWhere('b.date >= :today', { today: todayStr })
      .andWhere('b.date <= :nextWeek', { nextWeek: nextWeekStr })
      .andWhere('b.status IN (:...statuses)', { statuses: ['pending', 'confirmed'] })
      .orderBy('b.date', 'ASC')
      .addOrderBy('b.timeSlot', 'ASC')
      .getMany();
  }

  /**
   * Get booking status distribution for a bot.
   * Read-only operational query.
   */
  async getStatusDistribution(botId: string): Promise<Record<string, number>> {
    const results = await this.bookingRepository
      .createQueryBuilder('b')
      .select('b.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('b.botId = :botId', { botId })
      .groupBy('b.status')
      .getRawMany();

    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.status] = parseInt(row.count, 10);
    }

    return counts;
  }

  /**
   * Get a single booking by ID (read-only operational query).
   * Does NOT verify ownership — caller must ensure botId matches.
   */
  async getBookingById(botId: string, bookingId: string): Promise<Booking | null> {
    return this.bookingRepository.findOne({
      where: { id: bookingId, botId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get available owner actions for a booking based on its status.
   *
   * CANONICAL: Per booking-temporal-semantics.md §6.
   * This is operational metadata, NOT business logic execution.
   * Frontend uses this to decide which buttons to render.
   */
  getBookingAvailableActions(status: string): string[] {
    switch (status) {
      case 'pending':
        return ['confirm', 'cancel'];
      case 'confirmed':
        return ['cancel', 'complete', 'no-show'];
      case 'cancelled':
      case 'completed':
      case 'no-show':
        return [];
      default:
        return [];
    }
  }

  /**
   * Generate time slots between start and end times.
   */
  private generateTimeSlots(start: string, end: string, durationMinutes: number): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let current = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    while (current + durationMinutes <= endTime) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      current += durationMinutes;
    }

    return slots;
  }
}
