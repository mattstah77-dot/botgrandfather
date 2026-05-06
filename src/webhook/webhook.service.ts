import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
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

      // Extract message data
      const message = update.message;
      if (!message || !message.text) {
        this.logger.debug('No text message to process');
        await this.botService.markUpdateAsProcessed(bot.id, BigInt(update.update_id));
        return;
      }

      // Build context for template handler
      const context = {
        botId: bot.id,
        botToken: bot.token,
        botConfig: bot.config,
        userId: message.from?.id || message.chat.id,
        chatId: message.chat.id,
        messageText: message.text,
        messageId: message.message_id,
      };

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
