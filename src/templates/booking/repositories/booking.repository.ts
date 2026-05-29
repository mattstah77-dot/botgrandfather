import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { OCCUPYING_STATUSES } from '../booking.constants';

/**
 * BookingRepository — explicit data access for Booking entity.
 *
 * ARCHITECTURAL PRINCIPLE:
 * - Explicit methods only. No generic query builder exposure.
 * - All queries are tenant-scoped (botId filter).
 * - No cross-template queries.
 * - No projection logic — raw entity access only.
 *
 * FORBIDDEN:
 * - Generic find(filters) methods
 * - Cross-bot queries
 * - Projection computation
 * - Business logic
 */
@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly repo: Repository<Booking>,
  ) {}

  /**
   * Create a new booking.
   */
  async create(booking: Partial<Booking>): Promise<Booking> {
    const entity = this.repo.create(booking);
    return this.repo.save(entity);
  }

  /**
   * Find booking by ID (no bot scope — use only when botId already verified).
   */
  async findById(id: string): Promise<Booking | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Find booking by botId and ID.
   * ALWAYS use this for tenant-scoped lookups.
   */
  async findByBotAndId(botId: string, id: string): Promise<Booking | null> {
    return this.repo.findOne({ where: { botId, id } });
  }

  /**
   * Find bookings for a specific date.
   */
  async findByDate(botId: string, date: string): Promise<Booking[]> {
    return this.repo.find({
      where: { botId, date },
      order: { timeSlot: 'ASC' },
    });
  }

  /**
   * Find bookings that occupy a specific slot.
   * Used for overlap detection at write time.
   */
  async findOverlappingBookings(
    botId: string,
    date: string,
    timeSlot: string,
    statuses: string[] = OCCUPYING_STATUSES,
  ): Promise<Booking[]> {
    return this.repo.find({
      where: { botId, date, timeSlot, status: In(statuses) },
    });
  }

  /**
   * Check if a slot is occupied.
   * Returns true if ANY booking with occupying status exists for the slot.
   */
  async isSlotOccupied(
    botId: string,
    date: string,
    timeSlot: string,
    statuses: string[] = OCCUPYING_STATUSES,
  ): Promise<boolean> {
    const count = await this.repo.count({
      where: { botId, date, timeSlot, status: In(statuses) },
    });
    return count > 0;
  }

  /**
   * Find bookings for a specific provider.
   */
  async findBookingsForProvider(
    botId: string,
    providerId: string,
    date: string,
  ): Promise<Booking[]> {
    return this.repo.find({
      where: { botId, providerId, date },
      order: { timeSlot: 'ASC' },
    });
  }

  /**
   * Find upcoming bookings (today and forward).
   */
  async findUpcomingBookings(
    botId: string,
    statuses: string[] = OCCUPYING_STATUSES,
    limit: number = 50,
  ): Promise<Booking[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.repo.find({
      where: { botId, status: In(statuses), date: MoreThanOrEqual(today) },
      order: { date: 'ASC', timeSlot: 'ASC' },
      take: limit,
    });
  }

  /**
   * Update booking status.
   */
  async updateStatus(
    id: string,
    status: Booking['status'],
  ): Promise<void> {
    await this.repo.update({ id }, { status });
  }

  /**
   * Save (create or update) a booking.
   */
  async save(booking: Booking): Promise<Booking> {
    return this.repo.save(booking);
  }

  /**
   * Count bookings for a bot.
   */
  async countByBotId(botId: string): Promise<number> {
    return this.repo.count({ where: { botId } });
  }

  /**
   * Count bookings by status for a bot.
   */
  async countByBotAndStatus(
    botId: string,
    status: Booking['status'],
  ): Promise<number> {
    return this.repo.count({ where: { botId, status } });
  }
}
