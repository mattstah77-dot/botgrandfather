/**
 * DTO for creating a booking via Mini App API.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This DTO is for operational API (Mini App), not runtime webhook processing.
 * Runtime uses UserState flow. This is for owner-initiated bookings.
 */
export class CreateBookingDto {
  botId: string;

  /** Telegram user ID */
  telegramUserId: number;

  username?: string;

  /** Service ID from config */
  serviceId: string;

  /** Date in YYYY-MM-DD format */
  date: string;

  /** Time slot in HH:MM format */
  timeSlot: string;

  /** Timezone (e.g. 'UTC', 'Europe/Moscow') */
  timezone?: string;
}
