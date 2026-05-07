import { Injectable, Logger } from '@nestjs/common';
import { TELEGRAM_BOT_API_URL } from '../config/env.config';

export interface TelegramBotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
}

interface TelegramApiResponse<T = any> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

/**
 * SINGLETON: One TelegramService instance serves ALL bots.
 * No per-bot clients, no separate processes.
 * All Telegram API calls are centralized here.
 */
@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly maxRetries = 3;
  private readonly retryDelayMs = 300;

  /**
   * Redact token from any string to prevent accidental logging.
   */
  private redactToken(input: string): string {
    return input.replace(/bot\d+:[A-Za-z0-9_-]+/g, '[REDACTED]');
  }

  /**
   * Execute a Telegram API request with retry logic.
   */
  private async request<T>(
    botToken: string,
    method: string,
    options?: RequestInit,
  ): Promise<TelegramApiResponse<T>> {
    const url = `${TELEGRAM_BOT_API_URL}/bot${botToken}/${method}`;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
          },
        });

        const data = (await response.json()) as TelegramApiResponse<T>;

        if (!response.ok || !data.ok) {
          const errMsg = data.description || `HTTP ${response.status}`;
          throw new Error(`Telegram API error: ${errMsg}`);
        }

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Telegram API attempt ${attempt}/${this.maxRetries} failed for method "${method}": ${this.redactToken(lastError.message)}`,
        );

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelayMs * attempt);
        }
      }
    }

    throw lastError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate bot token by calling getMe
   */
  async validateToken(token: string): Promise<TelegramBotInfo> {
    try {
      const data = await this.request<TelegramBotInfo>(token, 'getMe');
      return data.result!;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Token validation failed: ${this.redactToken(msg)}`);
      throw new Error(`Invalid token`);
    }
  }

  /**
   * Set webhook for a bot
   */
  async setWebhook(token: string, webhookUrl: string): Promise<void> {
    try {
      await this.request(token, 'setWebhook', {
        method: 'POST',
        body: JSON.stringify({ url: webhookUrl }),
      });
      this.logger.log(`Webhook set successfully for bot`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to set webhook: ${this.redactToken(msg)}`);
      throw new Error('Failed to set webhook');
    }
  }

  /**
   * Send message to a chat.
   * Does NOT throw — failures are logged but swallowed to prevent webhook crashes.
   */
  async sendMessage(
    botToken: string,
    chatId: number,
    text: string,
    replyMarkup?: any,
  ): Promise<void> {
    try {
      const body: Record<string, any> = { chat_id: chatId, text };
      if (replyMarkup) {
        body.reply_markup = replyMarkup;
      }
      await this.request(botToken, 'sendMessage', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send message: ${this.redactToken(msg)}`);
      // Intentionally swallowed — do not crash the server on send failures
    }
  }

  /**
   * Edit an existing message.
   */
  async editMessage(
    botToken: string,
    chatId: number,
    messageId: number,
    text: string,
  ): Promise<void> {
    try {
      await this.request(botToken, 'editMessageText', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text,
        }),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to edit message: ${this.redactToken(msg)}`);
    }
  }

  /**
   * Delete a message.
   */
  async deleteMessage(
    botToken: string,
    chatId: number,
    messageId: number,
  ): Promise<void> {
    try {
      await this.request(botToken, 'deleteMessage', {
        method: 'POST',
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
        }),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete message: ${this.redactToken(msg)}`);
    }
  }

  /**
   * Answer callback query (removes loading spinner on inline button).
   */
  async answerCallbackQuery(
    botToken: string,
    callbackQueryId: string,
    text?: string,
  ): Promise<void> {
    try {
      const body: Record<string, any> = { callback_query_id: callbackQueryId };
      if (text) body.text = text;
      await this.request(botToken, 'answerCallbackQuery', {
        method: 'POST',
        body: JSON.stringify(body),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to answer callback query: ${this.redactToken(msg)}`);
    }
  }

  /**
   * Get webhook info (for diagnostics).
   */
  async getWebhookInfo(token: string): Promise<any> {
    try {
      const data = await this.request(token, 'getWebhookInfo');
      return data.result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get webhook info: ${this.redactToken(msg)}`);
      return null;
    }
  }
}
