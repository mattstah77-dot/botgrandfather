import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bot } from '../bot/entities/bot.entity';
import { UserState } from '../bot/entities/user-state.entity';
import { BotService } from '../bot/bot.service';
import { TelegramService } from '../telegram/telegram.service';
import { PLATFORM_BOT_TOKEN, WEBHOOK_HOST, PLATFORM_BOT_WEBHOOK_PATH } from '../config/env.config';
import { VALID_TEMPLATE_NAMES } from '../templates/common/template.registry';

/**
 * BotGrandFather — internal platform control bot.
 * NOT a template. Provides Telegram UI for connecting child bots.
 */
@Injectable()
export class PlatformBotService implements OnModuleInit {
  private readonly logger = new Logger(PlatformBotService.name);
  private platformBotId: string | null = null;

  constructor(
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
    @InjectRepository(UserState)
    private readonly userStateRepository: Repository<UserState>,
    private readonly botService: BotService,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * On startup: ensure platform bot record exists and register webhook.
   */
  async onModuleInit() {
    if (!PLATFORM_BOT_TOKEN) {
      this.logger.warn('PLATFORM_BOT_TOKEN not set — BotGrandFather disabled');
      return;
    }

    try {
      // Validate the platform bot token with Telegram
      const botInfo = await this.telegramService.validateToken(PLATFORM_BOT_TOKEN);
      this.logger.log(`BotGrandFather token valid: @${botInfo.username}`);

      // Find or create the platform bot DB record
      const platformBot = await this.ensurePlatformBotRecord();
      this.platformBotId = platformBot.id;

      // Register webhook for the platform bot
      const webhookUrl = `${WEBHOOK_HOST}${PLATFORM_BOT_WEBHOOK_PATH}`;
      await this.telegramService.setWebhook(PLATFORM_BOT_TOKEN, webhookUrl);
      this.logger.log(`BotGrandFather webhook registered: ${webhookUrl}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`BotGrandFather init failed: ${msg}`);
    }
  }

  /**
   * Find or create the platform bot record in the database.
   * This record is needed so UserState can reference it via botId FK.
   */
  private async ensurePlatformBotRecord(): Promise<Bot> {
    // Try to find existing platform bot by token hash (simplified: just find by template='platform')
    let bot = await this.botRepository.findOne({
      where: { template: 'platform' },
    });

    if (!bot) {
      bot = this.botRepository.create({
        token: PLATFORM_BOT_TOKEN,
        template: 'platform',
        config: {},
        webhookSecret: 'platform',
      });
      await this.botRepository.save(bot);
      this.logger.log(`Platform bot record created: id=${bot.id}`);
    } else {
      // Update token if it changed
      if (bot.token !== PLATFORM_BOT_TOKEN) {
        bot.token = PLATFORM_BOT_TOKEN;
        await this.botRepository.save(bot);
      }
      this.logger.log(`Platform bot record found: id=${bot.id}`);
    }

    return bot;
  }

  get isEnabled(): boolean {
    return !!this.platformBotId && !!PLATFORM_BOT_TOKEN;
  }

  // ─── Telegram UX ──────────────────────────────────────────────

  /**
   * Send welcome message with inline keyboard for template selection.
   */
  async sendWelcome(chatId: number): Promise<void> {
    const text = '👋 Welcome to BotGrandFather!\n\nChoose a template for your bot:';
    const keyboard = {
      inline_keyboard: [
        [
          { text: 'Template 1', callback_data: 'template:template1' },
          { text: 'Template 2', callback_data: 'template:template2' },
          { text: 'Template 3', callback_data: 'template:template3' },
        ],
      ],
    };
    await this.telegramService.sendMessage(PLATFORM_BOT_TOKEN, chatId, text, keyboard);
  }

  /**
   * Ask user to send bot token after template selection.
   */
  async askForToken(chatId: number): Promise<void> {
    const text = '🔑 Please send your Telegram bot token.\n\nYou can get it from @BotFather.';
    await this.telegramService.sendMessage(PLATFORM_BOT_TOKEN, chatId, text);
  }

  /**
   * Reply with success after bot connection.
   */
  async replySuccess(chatId: number, botUsername: string, template: string): Promise<void> {
    const text = `✅ Bot @${botUsername} connected successfully!\n\nTemplate: ${template}\n\nYour bot is now active and ready to use.`;
    await this.telegramService.sendMessage(PLATFORM_BOT_TOKEN, chatId, text);
  }

  /**
   * Reply with error (user-friendly, no stack traces).
   */
  async replyError(chatId: number, message: string): Promise<void> {
    const text = `❌ ${message}`;
    await this.telegramService.sendMessage(PLATFORM_BOT_TOKEN, chatId, text);
  }

  // ─── State Management ─────────────────────────────────────────

  /**
   * Get or create user state for the platform bot.
   */
  async getUserState(userId: number): Promise<UserState> {
    if (!this.platformBotId) {
      throw new Error('Platform bot not initialized');
    }

    let state = await this.userStateRepository.findOne({
      where: { botId: this.platformBotId, userId: BigInt(userId) },
    });

    if (!state) {
      state = this.userStateRepository.create({
        botId: this.platformBotId,
        userId: BigInt(userId),
        currentStep: 'idle',
        payload: {},
      });
      await this.userStateRepository.save(state);
    }

    return state;
  }

  /**
   * Update user state.
   */
  async setUserState(
    userId: number,
    step: string,
    payload: Record<string, any>,
  ): Promise<void> {
    if (!this.platformBotId) return;

    await this.userStateRepository.update(
      { botId: this.platformBotId, userId: BigInt(userId) },
      { currentStep: step, payload },
    );
  }

  /**
   * Reset user state to idle.
   */
  async resetUserState(userId: number): Promise<void> {
    await this.setUserState(userId, 'idle', {});
  }

  // ─── Token Validation ─────────────────────────────────────────

  /**
   * Validate Telegram bot token format.
   * Format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   */
  isValidTokenFormat(token: string): boolean {
    return /^\d+:[A-Za-z0-9_-]+$/.test(token.trim());
  }

  /**
   * Redact token for safe logging.
   */
  redactToken(token: string): string {
    if (token.length <= 10) return '[REDACTED]';
    return token.slice(0, 4) + '...' + token.slice(-4);
  }

  // ─── Connect Flow ─────────────────────────────────────────────

  /**
   * Handle template selection from inline keyboard.
   */
  async handleTemplateSelection(userId: number, template: string, chatId: number): Promise<void> {
    if (!VALID_TEMPLATE_NAMES.includes(template)) {
      await this.replyError(chatId, 'Invalid template selected.');
      return;
    }

    await this.setUserState(userId, 'waiting_bot_token', { selectedTemplate: template });
    await this.askForToken(chatId);
  }

  /**
   * Handle bot token from user and connect the bot.
   * Reuses existing BotService.connectBot() — NO duplication.
   */
  async handleTokenSubmission(userId: number, token: string, chatId: number): Promise<void> {
    const state = await this.getUserState(userId);

    if (state.currentStep !== 'waiting_bot_token') {
      await this.replyError(chatId, 'Please start with /start');
      return;
    }

    const selectedTemplate = state.payload?.selectedTemplate;
    if (!selectedTemplate) {
      await this.replyError(chatId, 'Template not selected. Please start with /start');
      await this.resetUserState(userId);
      return;
    }

    // Validate token format
    if (!this.isValidTokenFormat(token)) {
      await this.replyError(
        chatId,
        'Invalid token format. Token should look like:\n123456789:ABCdef...',
      );
      return;
    }

    // Prevent user from connecting the platform bot itself as a child
    if (token.trim() === PLATFORM_BOT_TOKEN) {
      await this.replyError(chatId, 'You cannot connect BotGrandFather as a child bot.');
      await this.resetUserState(userId);
      return;
    }

    try {
      this.logger.log(
        `Connecting bot for user ${userId} with template ${selectedTemplate}`,
      );

      // Reuse existing BotService — NO duplication of connect logic
      const result = await this.botService.connectBot({
        token: token.trim(),
        template: selectedTemplate,
        config: {},
      });

      await this.replySuccess(chatId, result.botUsername, selectedTemplate);
      await this.resetUserState(userId);

      this.logger.log(
        `Bot connected via BotGrandFather: user=${userId}, bot=${result.botUsername}`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to connect bot for user ${userId}: ${msg}`,
      );
      await this.replyError(chatId, 'Failed to connect bot. Please check your token and try again.');
      // Keep state so user can retry with a different token
    }
  }
}
