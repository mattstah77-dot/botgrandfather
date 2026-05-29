import { Injectable } from '@nestjs/common';
import { ProviderAvailabilityRepository } from '../repositories/provider-availability.repository';
import { AvailabilityExclusionRepository } from '../repositories/availability-exclusion.repository';
import { BookingRepository } from '../repositories/booking.repository';
import { OCCUPYING_STATUSES } from '../booking.constants';
import { ProviderAvailability } from '../entities/provider-availability.entity';

/**
 * AvailabilityService — computes temporal availability from TRUTH sources.
 *
 * ARCHITECTURAL PRINCIPLE:
 * - Availability is COMPUTED from truth (ProviderAvailability + Exclusions + Occupancy).
 * - Slots are NEVER persisted. This service computes them on-demand.
 * - Projections are ephemeral — computed per request, discarded immediately.
 *
 * TRUTH SOURCES:
 * 1. ProviderAvailability — weekly working hours configuration
 * 2. AvailabilityExclusion — explicit date-range exclusions (vacations, holidays)
 * 3. Booking — occupancy (pending/confirmed bookings block slots)
 *
 * FORBIDDEN:
 * - Slot persistence
 * - Cache-as-truth
 * - Recurrence generation (RRULE)
 * - Cross-template sharing
 *
 * CANONICAL: Per temporal-truth-contracts.md, computation-contracts.md.
 */
@Injectable()
export class AvailabilityService {
  constructor(
    private readonly providerAvailabilityRepo: ProviderAvailabilityRepository,
    private readonly exclusionRepo: AvailabilityExclusionRepository,
    private readonly bookingRepo: BookingRepository,
  ) {}

  /**
   * Check if a specific slot is available (not occupied).
   *
   * CANONICAL: Per write-time-validation-contracts.md — validation at write time.
   */
  async isSlotAvailable(
    botId: string,
    date: string,
    timeSlot: string,
    providerId?: string | null,
  ): Promise<boolean> {
    // Check if date is excluded
    const exclusions = await this.exclusionRepo.findExclusionsForDate(
      botId,
      date,
      providerId,
    );
    if (exclusions.length > 0) {
      return false;
    }

    // Check if slot is occupied
    const isOccupied = await this.bookingRepo.isSlotOccupied(
      botId,
      date,
      timeSlot,
      OCCUPYING_STATUSES,
    );

    return !isOccupied;
  }

  /**
   * Compute available slots for a specific date.
   *
   * CANONICAL: Per computation-contracts.md — recomputation per request.
   * Slots are computed from: Working hours - Exclusions - Occupancy.
   *
   * Returns array of time slot strings (e.g., ["09:00", "09:30", ...]).
   */
  async getAvailableSlots(
    botId: string,
    date: string,
    providerId?: string | null,
  ): Promise<string[]> {
    // Determine day of week
    const dayOfWeek = this.getDayOfWeek(date);

    // Get working hours
    const availability =
      await this.providerAvailabilityRepo.findByBotProviderAndWeekday(
        botId,
        providerId ?? null,
        dayOfWeek,
      );

    // Check if day is excluded
    const exclusions = await this.exclusionRepo.findExclusionsForDate(
      botId,
      date,
      providerId,
    );
    if (
      !availability ||
      !availability.isWorkingDay ||
      exclusions.length > 0
    ) {
      return [];
    }

    // Generate base slots from working hours
    const baseSlots = this.generateTimeSlots(
      availability.startTime!,
      availability.endTime!,
    );

    // Get booked slots
    const bookedSlots = await this.bookingRepo.findByDate(botId, date);
    const bookedSet = new Set(
      bookedSlots
        .filter((b) => OCCUPYING_STATUSES.includes(b.status))
        .map((b) => b.timeSlot),
    );

    // Filter out booked slots
    return baseSlots.filter((slot) => !bookedSet.has(slot));
  }

  /**
   * Get day of week from date string (YYYY-MM-DD).
   */
  private getDayOfWeek(date: string): ProviderAvailability['weekday'] {
    const dayIndex = new Date(date).getDay();
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ] as const;
    return days[dayIndex] as ProviderAvailability['weekday'];
  }

  /**
   * Generate time slots between start and end times.
   * Uses default 30-minute intervals.
   */
  private generateTimeSlots(start: string, end: string): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let current = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    while (current + 30 <= endTime) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      current += 30;
    }

    return slots;
  }

  /**
   * Validate availability configuration.
   * Returns true if provider has at least one day configured.
   */
  async hasAnyAvailability(botId: string): Promise<boolean> {
    const all = await this.providerAvailabilityRepo.findAllForBot(botId);
    return all.some((a) => a.isWorkingDay && a.startTime && a.endTime);
  }
}
