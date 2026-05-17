import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';

/**
 * BookingQueryService — operational data access for the booking template.
 *
 * RESPONSIBILITY:
 * - Read-only queries for Mini App dashboards
 * - Booking lists, counts, calendar data
 * - Slot availability checks
 *
 * DOES NOT:
 * - Handle Telegram conversations
 * - Manage user state
 * - Create or modify bookings (see BookingRuntimeService)
 * - Send messages
 *
 * USED BY:
 * - BookingDashboardController (Mini App)
 * - DashboardService (owner stats aggregation)
 * - BookingRuntimeService (slot availability checks)
 */
@Injectable()
export class BookingQueryService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

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
}
