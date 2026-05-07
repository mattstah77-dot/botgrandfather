import { Controller, Post, Body, Param, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Secure webhook endpoint — receives updates from Telegram.
   * URL format: POST /webhook/:botId/:secret
   * The secret is generated per-bot and never contains the bot token.
   */
  @Post(':botId/:secret')
  async handleWebhook(
    @Body() update: any,
    @Param('botId') botId: string,
    @Param('secret') secret: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      this.webhookService.validateUpdate(update);

      // Process asynchronously — never block Telegram response
      this.webhookService.processUpdate(botId, secret, update);

      res.status(HttpStatus.OK).json({ ok: true });
    } catch (error) {
      this.webhookService['logger'].error(`Webhook error: ${(error as Error).message}`);
      res.status(HttpStatus.BAD_REQUEST).json({ 
        ok: false, 
        error: (error as Error).message,
      });
    }
  }
}

