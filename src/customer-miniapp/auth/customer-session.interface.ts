/**
 * CustomerSession — authenticated customer session for Customer MiniApp.
 *
 * DIFFERENT from MiniAppSession (owner session):
 * - No ownerId
 * - Scoped to a specific bot
 * - Identified by telegramUserId + botId
 *
 * Created after successful Telegram initData validation
 * using the CHILD BOT's token (not platform bot token).
 */
export interface CustomerSession {
  /** Bot UUID this customer is interacting with */
  botId: string;

  /** Telegram user ID from initData */
  telegramUserId: string;

  /** Telegram username (optional) */
  username?: string;

  /** Telegram first name */
  firstName?: string;

  /** Telegram last name */
  lastName?: string;
}
