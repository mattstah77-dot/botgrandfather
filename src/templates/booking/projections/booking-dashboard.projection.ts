/**
 * BookingDashboardProjection — dashboard metrics for booking capability.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Simple recomputation only. NO analytics engine. NO aggregation infrastructure.
 * These are dumb counts derived directly from the Booking entity.
 *
 * PURPOSE:
 * Provide capability-neutral metrics for the unified operational surface.
 *
 * SOURCE OF TRUTH:
 * Booking entity (canonical temporal record).
 *
 * DISPOSABLE:
 * Recomputed per request. No persistence. No caching.
 */
export interface BookingDashboardProjection {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}
