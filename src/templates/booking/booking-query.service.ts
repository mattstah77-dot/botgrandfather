import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { ProviderAvailability } from './entities/provider-availability.entity';
import { Bot } from '../../bot/entities/bot.entity';
import {
  DashboardCapabilityProvider,
  CapabilityMetrics,
} from '../../dashboard/interfaces/dashboard-capability-provider.interface';
import { AvailabilityService } from './services/availability.service';
import {
  BookingOperationalProjection,
  BookingDashboardProjection,
  BookingCalendarProjection,
} from './projections';

/**
 * BookingQueryService — operational data access for the booking template.
 *
 * RESPONSIBILITY:
 * - Read-only queries for Mini App dashboards
 * - Booking lists, counts, calendar data
 * - Slot availability checks (delegates to AvailabilityService for truth-based computation)
 * - Dashboard capability metrics (implements DashboardCapabilityProvider)
 * - Operational projections (BookingOperationalProjection, BookingDashboardProjection, BookingCalendarProjection)
 *
 * DOES NOT:
 * - Handle Telegram conversations
 * - Manage user state
 * - Create or modify bookings (see BookingRuntimeService)
 * - Send messages
 * - Orchestrate workflows
 * - Emit events
 * - Compute availability directly (delegates to AvailabilityService)
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
    private readonly availabilityService: AvailabilityService,
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
   * DELEGATES to AvailabilityService for truth-based computation.
   *
   * AvailabilityService computes slots from:
   * - ProviderAvailability (weekly hours)
   * - AvailabilityExclusion (date-range exclusions)
   * - Booking occupancy (pending/confirmed)
   *
   * Pure query-layer logic — no runtime state, no Telegram interaction.
   *
   * Returns array of available slot strings (e.g., ["09:00", "09:30", ...]).
   */
  async getAvailableSlots(
    botId: string,
    date: string,
    providerId?: string | null,
    slotDurationMinutes?: number,
  ): Promise<string[]> {
    return this.availabilityService.getAvailableSlots(
      botId,
      date,
      providerId,
      slotDurationMinutes,
    );
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

  // ─── OPERATIONAL PROJECTIONS ─────────────────────────────────

  /**
   * Get operational booking list projection.
   *
   * Returns BookingOperationalProjection[] — read-only projection for owner list view.
   * Recomputed per request. No caching.
   */
  async getOperationalBookings(
    botId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
    sort?: string,
  ): Promise<{ items: BookingOperationalProjection[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const result = await this.getBotBookings(botId, page, limit, status, search, sort);

    const items: BookingOperationalProjection[] = result.items.map((b) => ({
      id: b.id,
      customerName: b.username ? `@${b.username}` : `User ${b.userId}`,
      serviceName: b.serviceName,
      date: b.date,
      timeSlot: b.timeSlot,
      status: b.status,
      providerName: b.providerId ?? null,
    }));

    return { items, pagination: result.pagination };
  }

  /**
   * Get dashboard metrics projection.
   *
   * Simple recomputation from Booking entity.
   * NO analytics engine. NO aggregation infrastructure.
   */
  async getDashboardMetrics(botId: string): Promise<BookingDashboardProjection> {
    const today = new Date().toISOString().split('T')[0];

    const [totalBookings, upcomingBookings, completedBookings, cancelledBookings] = await Promise.all([
      this.bookingRepository.count({ where: { botId } }),
      this.bookingRepository.count({
        where: { botId, date: MoreThanOrEqual(today), status: In(['pending', 'confirmed']) },
      }),
      this.bookingRepository.count({ where: { botId, status: 'completed' } }),
      this.bookingRepository.count({ where: { botId, status: 'cancelled' } }),
    ]);

    return {
      totalBookings,
      upcomingBookings,
      completedBookings,
      cancelledBookings,
    };
  }

  /**
   * Get calendar projection for a date range.
   *
   * Observational only. NOT a scheduling engine.
   * Returns bookings grouped by date for calendar visualization.
   */
  async getCalendarProjection(
    botId: string,
    from: string,
    to: string,
  ): Promise<BookingCalendarProjection[]> {
    const bookings = await this.bookingRepository
      .createQueryBuilder('b')
      .where('b.botId = :botId', { botId })
      .andWhere('b.date >= :from', { from })
      .andWhere('b.date <= :to', { to })
      .orderBy('b.date', 'ASC')
      .addOrderBy('b.timeSlot', 'ASC')
      .getMany();

    // Group by date
    const groups = new Map<string, Booking[]>();
    for (const booking of bookings) {
      const list = groups.get(booking.date) ?? [];
      list.push(booking);
      groups.set(booking.date, list);
    }

    const projections: BookingCalendarProjection[] = [];
    for (const [date, dateBookings] of groups) {
      projections.push({
        date,
        bookings: dateBookings.map((b) => ({
          id: b.id,
          serviceName: b.serviceName,
          timeSlot: b.timeSlot,
          status: b.status,
          customerName: b.username ? `@${b.username}` : `User ${b.userId}`,
        })),
      });
    }

    return projections;
  }
}

