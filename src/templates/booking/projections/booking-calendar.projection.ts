/**
 * BookingCalendarProjection — observational calendar view.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Calendar projection is observational only.
 * It is NOT a scheduling engine, orchestration system, or coordination surface.
 *
 * PURPOSE:
 * Visualize bookings grouped by date for owner calendar UX.
 *
 * SOURCE OF TRUTH:
 * Booking entity (canonical temporal record).
 *
 * DISPOSABLE:
 * Recomputed per request. No persistence. No caching.
 */
export interface BookingCalendarItemProjection {
  id: string;
  serviceName: string;
  timeSlot: string;
  status: string;
  customerName: string;
}

export interface BookingCalendarProjection {
  date: string;
  bookings: BookingCalendarItemProjection[];
}
