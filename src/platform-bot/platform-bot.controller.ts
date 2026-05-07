import { Controller, Post, Body, Logger } from '@nestjs/common';
import { PlatformBotHandler } from './platform-bot.handler';

/**
 * Webhook controller for BotGrandFather.
 * Separate endpoint from child bot webhooks.
 * POST /platform-bot/webhook
 */
@Controller('platform-bot')
export class PlatformBotController {
  private readonly logger = new Logger(PlatformBotController.name);

  constructor(private readonly platformBotHandler: PlatformBotHandler) {}

  /**
   * Receive Telegram updates for BotGrandFather.
   */
  @Post('webhook')
  async handleWebhook(@Body() update: any): Promise<void> {
    // Fire-and-forget: respond immediately to Telegram, process async
    this.platformBotHandler.handleUpdate(update).catch((error) => {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Platform bot webhook processing failed: ${msg}`);
    });
  }
}
