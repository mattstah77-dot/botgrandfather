/**
 * DTO for updating a booking via Mini App API.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This DTO is for operational API (Mini App), not runtime webhook processing.
 * Only certain fields are mutable (status, notes).
 */
export class UpdateBookingDto {
  /** New booking status */
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';

  /** Optional notes */
  notes?: string;
}
