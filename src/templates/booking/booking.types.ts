/**
 * Booking Template — TypeScript type definitions.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Types are local to the booking template. No universal abstractions here.
 */

/**
 * A bookable service offered by the business.
 */
export interface BookingServiceItem {
  id: string;
  name: string;
  durationMinutes: number;
  price?: number | null;
}

/**
 * A time slot for booking.
 */
export interface TimeSlot {
  time: string; // HH:MM format
  durationMinutes: number;
}

/**
 * Working hours configuration for a specific day.
 * 
 * TEMPORAL INVARIANTS:
 * - startTime/endTime are in provider timezone (HH:MM format)
 * - If enabled = false, startTime/endTime should be null
 * - slotDurationMinutes defines interval between slots
 */
export interface WorkingHours {
  enabled: boolean;
  startTime: string | null;  // HH:MM in provider timezone
  endTime: string | null;    // HH:MM in provider timezone
  slots?: TimeSlot[];        // Optional: pre-computed slots (deprecated, use startTime/endTime)
}

/**
 * Booking template configuration shape.
 * 
 * CANONICAL: Per booking-temporal-semantics.md Sections 2–4.
 */
export interface BookingConfig {
  businessName: string;
  services: BookingServiceItem[];
  workingHours: {
    monday: WorkingHours;
    tuesday: WorkingHours;
    wednesday: WorkingHours;
    thursday: WorkingHours;
    friday: WorkingHours;
    saturday: WorkingHours;
    sunday: WorkingHours;
  };
  confirmationMessage: string;
  cancellationMessage: string;
  ownerChatId: string;
  timezone: string; // IANA timezone: 'UTC', 'Europe/Moscow'
  // Booking window semantics (Section 3)
  advanceBookingDays?: number;      // default: 30
  minimumNoticeHours?: number;      // default: 2
  cancellationWindowHours?: number; // default: 24
  // Rescheduling semantics
  rescheduleWindowHours?: number;   // default: 24 (hours before appointment to allow reschedule)
  // Slot configuration
  slotDurationMinutes?: number;     // default: 30
}

/**
 * Stored in UserState.payload during booking flow.
 */
export interface BookingProgress {
  currentStep: 'select_service' | 'select_date' | 'select_time' | 'confirm' | 'completed';
  selectedServiceId: string | null;
  selectedDate: string | null; // YYYY-MM-DD
  selectedTime: string | null; // HH:MM
}

/**
 * Booking status in database.
 * 
 * CANONICAL: Per booking-temporal-semantics.md Section 6.
 * - pending: Created, awaiting confirmation
 * - confirmed: Confirmed and active
 * - cancelled: Cancelled by customer or owner
 * - completed: Appointment occurred (past end time)
 * - no-show: Customer did not attend (owner-marked)
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
