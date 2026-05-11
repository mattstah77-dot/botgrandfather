/**
 * MiniAppSession — authenticated owner session for Mini App operations.
 *
 * Created after successful Telegram initData validation.
 * Attached to request by MiniAppAuthGuard.
 */
export interface MiniAppSession {
  /** Owner UUID in our database */
  ownerId: string;

  /** Telegram user ID */
  telegramUserId: string;

  /** Telegram username (if available) */
  username?: string;

  /** Telegram first name */
  firstName?: string;

  /** Telegram last name */
  lastName?: string;

  /** ISO timestamp of session creation */
  authenticatedAt: string;
}
