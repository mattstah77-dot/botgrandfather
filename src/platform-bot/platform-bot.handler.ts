import { Injectable, Logger } from '@nestjs/common';
import { PlatformBotService } from './platform-bot.service';
import { OwnerService } from '../owner/owner.service';
import { TelegramService } from '../telegram/telegram.service';
import { PLATFORM_BOT_TOKEN } from '../config/env.config';

/**
 * Processes Telegram updates for BotGrandFather.
 * Handles:
 * - /start command
 * - Inline keyboard callbacks (template selection)
 * - Text messages (bot token submission)
 *
 * Also ensures Owner records are created/updated for every interaction.
 */
@Injectable()
export class PlatformBotHandler {
  private readonly logger = new Logger(PlatformBotHandler.name);

  constructor(
    private readonly platformBotService: PlatformBotService,
    private readonly ownerService: OwnerService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Main entry point for platform bot webhook updates.
   */
  async handleUpdate(update: any): Promise<void> {
    if (!this.platformBotService.isEnabled) {
      this.logger.warn('Platform bot disabled — ignoring update');
      return;
    }

    try {
      // Inline keyboard callback
      if (update.callback_query) {
        await this.handleCallbackQuery(update.callback_query);
        return;
      }

      // Text message
      if (update.message && update.message.text) {
        await this.handleMessage(update.message);
        return;
      }

      this.logger.debug('Unhandled update type');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling platform bot update: ${msg}`);
    }
  }

  /**
   * Handle text messages from users.
   */
  private async handleMessage(message: any): Promise<void> {
    const text = message.text as string;
    const from = message.from || {};
    const userId = from.id as number;
    const chatId = message.chat?.id as number;

    if (!userId || !chatId) {
      this.logger.warn('Message missing userId or chatId');
      return;
    }

    // Ensure owner exists for every interaction
    const owner = await this.ownerService.findOrCreateOwner(userId, {
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
    });

    // /start command
    if (text === '/start') {
      await this.platformBotService.resetUserState(userId);
      await this.platformBotService.sendWelcome(chatId);
      return;
    }

    // Check if user is in "waiting for token" state
    const state = await this.platformBotService.getUserState(userId);

    if (state.currentStep === 'waiting_bot_token') {
      // User sent a token
      await this.platformBotService.handleTokenSubmission(userId, text, chatId, owner.id);
      return;
    }

    // Unknown command / idle state
    await this.platformBotService.sendWelcome(chatId);
  }

  /**
   * Handle inline keyboard callback queries.
   */
  private async handleCallbackQuery(callbackQuery: any): Promise<void> {
    const data = callbackQuery.data as string;
    const from = callbackQuery.from || {};
    const userId = from.id as number;
    const chatId = callbackQuery.message?.chat?.id as number;

    if (!userId || !chatId || !data) {
      this.logger.warn('Callback query missing required fields');
      return;
    }

    // Ensure owner exists for every interaction
    await this.ownerService.findOrCreateOwner(userId, {
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
    });

    // Template selection: "template:template1"
    if (data.startsWith('template:')) {
      const template = data.replace('template:', '');
      await this.platformBotService.handleTemplateSelection(userId, template, chatId);

      // Answer callback query to remove loading spinner
      await this.telegramService.answerCallbackQuery(PLATFORM_BOT_TOKEN, callbackQuery.id);
      return;
    }

    this.logger.debug(`Unknown callback data: ${data}`);
    await this.telegramService.answerCallbackQuery(PLATFORM_BOT_TOKEN, callbackQuery.id);
  }
}

