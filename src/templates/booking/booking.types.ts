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
 */
export interface WorkingHours {
  enabled: boolean;
  slots: TimeSlot[];
}

/**
 * Booking template configuration shape.
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
  timezone: string; // e.g. 'UTC', 'Europe/Moscow'
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
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
