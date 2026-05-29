/**
 * Booking Capability — Canonical Constants.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Constants are explicit, typed, and local to booking capability.
 * No generic abstractions. No external dependencies.
 */

/**
 * Canonical booking statuses.
 *
 * CANONICAL: Per booking-temporal-semantics.md Section 6.
 * - pending:   Created, awaiting confirmation
 * - confirmed: Confirmed and active
 * - cancelled: Cancelled by customer or owner
 * - completed: Appointment occurred
 * - no-show:   Customer did not attend
 */
export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no-show',
} as const;

export type BookingStatusValue =
  (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

/**
 * Statuses that occupy a time slot.
 * Bookings with these statuses block the slot from being re-booked.
 *
 * CANONICAL: Per occupancy-contracts.md — occupancy is implicit in status.
 */
export const OCCUPYING_STATUSES: BookingStatusValue[] = [
  BOOKING_STATUSES.PENDING,
  BOOKING_STATUSES.CONFIRMED,
];

/**
 * Statuses that are final — no further transitions allowed.
 *
 * CANONICAL: Per reliability-boundaries.md — valid status transitions.
 */
export const FINAL_STATUSES: BookingStatusValue[] = [
  BOOKING_STATUSES.CANCELLED,
  BOOKING_STATUSES.COMPLETED,
  BOOKING_STATUSES.NO_SHOW,
];

/**
 * Valid status transitions.
 * Key = current status, Value = array of allowed next statuses.
 *
 * CANONICAL: Per reliability-boundaries.md.
 */
export const VALID_STATUS_TRANSITIONS: Record<
  BookingStatusValue,
  BookingStatusValue[]
> = {
  [BOOKING_STATUSES.PENDING]: [
    BOOKING_STATUSES.CONFIRMED,
    BOOKING_STATUSES.CANCELLED,
  ],
  [BOOKING_STATUSES.CONFIRMED]: [
    BOOKING_STATUSES.CANCELLED,
    BOOKING_STATUSES.COMPLETED,
    BOOKING_STATUSES.NO_SHOW,
  ],
  [BOOKING_STATUSES.CANCELLED]: [],
  [BOOKING_STATUSES.COMPLETED]: [],
  [BOOKING_STATUSES.NO_SHOW]: [],
};

/**
 * Default booking configuration values.
 */
export const BOOKING_DEFAULTS = {
  ADVANCE_BOOKING_DAYS: 30,
  MINIMUM_NOTICE_HOURS: 2,
  CANCELLATION_WINDOW_HOURS: 24,
  RESCHEDULE_WINDOW_HOURS: 24,
  SLOT_DURATION_MINUTES: 30,
  TIMEZONE: 'UTC',
} as const;
