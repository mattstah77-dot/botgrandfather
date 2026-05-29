/**
 * BookingOperationalProjection — owner operational list view.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This is a read-only projection. It is NOT truth, authority,
 * synchronization layer, or orchestration layer.
 *
 * PURPOSE:
 * Owner operational list view — one row per booking.
 *
 * SOURCE OF TRUTH:
 * Booking entity (canonical temporal record).
 *
 * DISPOSABLE:
 * Recomputed per request. No persistence. No caching.
 */
export interface BookingOperationalProjection {
  id: string;
  customerName: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  status: string;
  providerName?: string | null;
}
