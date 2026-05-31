import { Injectable } from '@nestjs/common';
import { BookingRepository } from '../repositories/booking.repository';
import { AvailabilityService } from './availability.service';
import {
  BOOKING_STATUSES,
  VALID_STATUS_TRANSITIONS,
  BOOKING_DEFAULTS,
  BookingStatusValue,
} from '../booking.constants';
import { Booking } from '../entities/booking.entity';

/**
 * BookingValidationService — canonical write-time validation for booking operations.
 *
 * ARCHITECTURAL PRINCIPLE:
 * - Read-time availability is ADVISORY. Write-time validation is AUTHORITATIVE.
 * - Database constraint remains FINAL authority.
 * - All validations re-read truth from DB at write time.
 * - No trust in projections, no trust in cache, no trust in read-time state.
 *
 * CANONICAL: Per write-time-validation-contracts.md, temporal-truth-contracts.md,
 * occupancy-contracts.md, stale-projection-semantics.md.
 *
 * FORBIDDEN:
 * - Cache-as-truth
 * - Projection-as-truth
 * - Generic validation framework
 * - Cross-template sharing
 */
@Injectable()
export class BookingValidationService {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly availabilityService: AvailabilityService,
  ) {}

  /**
   * Validate booking creation at write time.
   *
   * Checks (in order):
   * 1. Date is not in the past
   * 2. Date is not excluded (vacation/holiday)
   * 3. Time is within working hours
   * 4. Slot is not occupied (pending/confirmed)
   *
   * FAILURE: Throws deterministic error with user-safe message.
   * SUCCESS: Returns void (caller proceeds to DB constraint as final guard).
   */
  async validateBookingCreation(
    botId: string,
    date: string,
    timeSlot: string,
    providerId?: string | null,
  ): Promise<void> {
    // 1. Date not in past
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDate = new Date(date + 'T00:00:00');
    if (selectedDate < today) {
      throw new BookingValidationError('Cannot book in the past');
    }

    // 2. Date not excluded
    const isExcluded = await this.availabilityService.isDateExcluded(
      botId,
      date,
      providerId,
    );
    if (isExcluded) {
      throw new BookingValidationError('This date is not available for booking');
    }

    // 3. Time within working hours (implicitly checked by slot generation)
    const availableSlots = await this.availabilityService.getAvailableSlots(
      botId,
      date,
      providerId,
    );
    if (!availableSlots.includes(timeSlot)) {
      throw new BookingValidationError(
        'This time slot is outside working hours or not available',
      );
    }

    // 4. Slot not occupied (re-read truth at write time)
    const isOccupied = await this.bookingRepo.isSlotOccupied(botId, date, timeSlot);
    if (isOccupied) {
      throw new BookingValidationError(
        'This slot was just booked by someone else. Please select another time.',
      );
    }
  }

  /**
   * Validate status transition at write time.
   *
   * Checks:
   * - Current status allows the requested transition
   * - Target status is canonical
   *
   * FAILURE: Throws deterministic error.
   * SUCCESS: Returns void.
   */
  validateStatusTransition(
    currentStatus: BookingStatusValue,
    nextStatus: BookingStatusValue,
  ): void {
    const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(nextStatus)) {
      throw new BookingValidationError(
        `Cannot transition from "${currentStatus}" to "${nextStatus}"`,
      );
    }
  }

  /**
   * Validate reschedule at write time.
   *
   * Checks:
   * 1. Booking status allows reschedule
   * 2. New date/time is different from current
   * 3. New slot is available (not excluded, not occupied)
   * 4. Reschedule window respected (if confirmed)
   *
   * FAILURE: Throws deterministic error.
   * SUCCESS: Returns void (DB constraint is final guard on new slot).
   */
  async validateReschedule(
    botId: string,
    booking: Booking,
    newDate: string,
    newTime: string,
    rescheduleWindowHours: number = BOOKING_DEFAULTS.RESCHEDULE_WINDOW_HOURS,
  ): Promise<void> {
    // 1. Status allows reschedule
    if (
      booking.status === BOOKING_STATUSES.CANCELLED ||
      booking.status === BOOKING_STATUSES.COMPLETED ||
      booking.status === BOOKING_STATUSES.NO_SHOW
    ) {
      throw new BookingValidationError(
        `Cannot reschedule booking with status: ${booking.status}`,
      );
    }

    // 2. New date/time is different
    if (booking.date === newDate && booking.timeSlot === newTime) {
      throw new BookingValidationError(
        'New date/time must be different from current booking',
      );
    }

    // 3. New slot is available
    await this.validateBookingCreation(botId, newDate, newTime, booking.providerId);

    // 4. Reschedule window (if confirmed)
    if (booking.status === BOOKING_STATUSES.CONFIRMED) {
      const now = new Date();
      // CRITICAL: Check window against CURRENT booking date/time, NOT new date/time.
      // Reschedule window means "cannot reschedule if appointment is within X hours".
      const bookingDateTime = new Date(`${booking.date}T${booking.timeSlot}:00`);
      const hoursUntil =
        (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntil < rescheduleWindowHours) {
        throw new BookingValidationError(
          `Cannot reschedule within ${rescheduleWindowHours} hours of appointment`,
        );
      }
    }
  }

  /**
   * Validate booking cancellation at write time.
   *
   * Checks:
   * - Booking status allows cancellation
   *
   * Completed and no-show bookings CANNOT be cancelled.
   */
  validateCancellation(booking: Booking): void {
    if (
      booking.status === BOOKING_STATUSES.COMPLETED ||
      booking.status === BOOKING_STATUSES.NO_SHOW
    ) {
      throw new BookingValidationError(
        `Cannot cancel booking with status: ${booking.status}`,
      );
    }
  }
}

/**
 * Explicit validation error type.
 * User-safe message. No internal leakage.
 */
export class BookingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BookingValidationError';
  }
}
