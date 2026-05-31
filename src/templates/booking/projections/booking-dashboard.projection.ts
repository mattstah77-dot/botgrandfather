/**
 * BookingDashboardProjection — dashboard metrics for booking template.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Simple recomputation only. NO analytics engine. NO aggregation infrastructure.
 * These are dumb counts derived directly from the Booking entity.
 *
 * PURPOSE:
 * Provide template-neutral metrics for the unified operational surface.
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
  noShowBookings: number;
}
