import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { TemplateFactory } from '../templates/template.factory';
import { BotService } from '../bot/bot.service';

/**
 * SINGLETON: One WebhookService processes ALL incoming updates.
 * Updates are routed by botId + secret, never by token.
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly templateFactory: TemplateFactory,
    private readonly botService: BotService,
  ) {}

  /**
   * Process incoming webhook update.
   * Credentials verified via botId + webhookSecret (token never appears in URL).
   */
  async processUpdate(botId: string, secret: string, update: any): Promise<void> {
    try {
      // Verify credentials: bot must exist and secret must match
      const bot = await this.botService.verifyWebhook(botId, secret);

      if (!bot) {
        this.logger.warn(`Invalid webhook credentials for botId=${botId}`);
        return;
      }

      // Idempotency: each (botId, updateId) pair is processed once
      const isAlreadyProcessed = await this.botService.isUpdateProcessed(
        bot.id,
        BigInt(update.update_id),
      );

      if (isAlreadyProcessed) {
        this.logger.debug(`Update ${update.update_id} already processed for bot ${bot.id}`);
        return;
      }

      // Build context — supports both messages and callback queries
      const context = this.buildContext(bot.id, bot.token, bot.config, update);

      if (!context) {
        this.logger.debug('No processable content in update');
        await this.botService.markUpdateAsProcessed(bot.id, BigInt(update.update_id));
        return;
      }

      // Route to template handler
      await this.templateFactory.handleUpdate(bot.template, context);

      // Mark as processed
      await this.botService.markUpdateAsProcessed(bot.id, BigInt(update.update_id));

      this.logger.debug(`Successfully processed update ${update.update_id} for bot ${bot.id}`);
    } catch (error) {
      this.logger.error(`Error processing update: ${error}`);
      // Intentionally swallowed — webhook must never crash the server
    }
  }

  /**
   * Build TemplateContext from Telegram update.
   * Supports both message and callback_query updates.
   */
  private buildContext(
    botId: string,
    botToken: string,
    botConfig: Record<string, any>,
    update: any,
  ): any | null {
    // Callback query (inline button click)
    if (update.callback_query) {
      const cq = update.callback_query;
      return {
        botId,
        botToken,
        botConfig,
        userId: cq.from?.id,
        chatId: cq.message?.chat?.id,
        messageId: cq.message?.message_id,
        callbackData: cq.data,
        isCallback: true,
      };
    }

    // Text message
    const message = update.message;
    if (message && message.text) {
      return {
        botId,
        botToken,
        botConfig,
        userId: message.from?.id || message.chat.id,
        chatId: message.chat.id,
        messageText: message.text,
        messageId: message.message_id,
        isCallback: false,
      };
    }

    return null;
  }

  /**
   * Validate update payload structure.
   */
  validateUpdate(update: any): void {
    if (!update || typeof update !== 'object') {
      throw new BadRequestException('Invalid update payload');
    }

    if (update.update_id === undefined) {
      throw new BadRequestException('Missing update_id');
    }
  }
}
