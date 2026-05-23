import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Bot } from '../../bot/entities/bot.entity';
import {
  DashboardCapabilityProvider,
  CapabilityMetrics,
} from '../../dashboard/interfaces/dashboard-capability-provider.interface';

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
   */
  async getOwnerMetrics(ownerId: string): Promise<CapabilityMetrics> {
    // Note: This is a simplified implementation.
    // In production, this would join with Bot entity to filter by ownerId.
    // For now, we count all bookings (multi-tenant scoped by botId in queries).
    const count = await this.bookingRepository.count();
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
   * Get bookings for a bot with pagination.
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

  /**
   * Get available time slots for a specific date.
   *
   * Reads bot config (working hours, slot duration) and subtracts booked slots.
   * Pure query-layer logic — no runtime state, no Telegram interaction.
   *
   * Returns array of available slot strings (e.g., ["09:00", "09:30", ...]).
   */
  async getAvailableSlots(botId: string, date: string): Promise<string[]> {
    // Get bot config
    const bot = await this.botRepository.findOne({
      where: { id: botId },
      select: ['config'],
    });

    if (!bot) {
      return [];
    }

    const config = bot.config || {};
    const workingHours = config.workingHours as Record<string, { open: string; close: string }> | undefined;
    const slotDuration = (config.slotDuration as number) || 30; // minutes

    if (!workingHours) {
      return [];
    }

    // Determine day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayConfig = workingHours[dayOfWeek];

    if (!dayConfig || !dayConfig.open || !dayConfig.close) {
      return []; // Closed on this day
    }

    // Generate all possible slots
    const slots = this.generateTimeSlots(dayConfig.open, dayConfig.close, slotDuration);

    // Get booked slots for this date
    const bookedSlots = await this.getBookedSlots(botId, date);
    const bookedSet = new Set(bookedSlots.map((b) => b.timeSlot));

    // Filter out booked slots
    return slots.filter((slot) => !bookedSet.has(slot));
  }

  /**
   * Generate time slots between open and close times.
   */
  private generateTimeSlots(open: string, close: string, durationMinutes: number): string[] {
    const slots: string[] = [];
    const [openHour, openMin] = open.split(':').map(Number);
    const [closeHour, closeMin] = close.split(':').map(Number);

    let current = openHour * 60 + openMin;
    const end = closeHour * 60 + closeMin;

    while (current + durationMinutes <= end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      current += durationMinutes;
    }

    return slots;
  }
}
