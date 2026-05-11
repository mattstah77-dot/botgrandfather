import { Controller, Post, Body, Param, Res, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { WebhookService } from './webhook.service';

/**
 * Webhook Controller — receives updates from Telegram.
 *
 * RELIABILITY SEMANTICS:
 * - Processing is awaited before responding
 * - Success → 200 OK (Telegram will not retry)
 * - Failure → non-2xx (Telegram WILL retry)
 * - Duplicate updates are detected and skipped silently (200 OK)
 *
 * This guarantees: no silent data loss, observable failures.
 */
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post(':botId/:secret')
  async handleWebhook(
    @Body() update: any,
    @Param('botId') botId: string,
    @Param('secret') secret: string,
    @Res() res: Response,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      this.webhookService.validateUpdate(update);
      this.logger.debug(`Webhook start: bot=${botId} updateId=${update.update_id}`);

      // AWAIT processing — never fire-and-forget
      const result = await this.webhookService.processUpdate(botId, secret, update);

      if (result.skipped) {
        this.logger.log(`Webhook duplicate skipped: bot=${botId} updateId=${update.update_id}`);
      } else {
        const duration = Date.now() - startTime;
        this.logger.log(`Webhook success: bot=${botId} updateId=${update.update_id} duration=${duration}ms`);
      }

      res.status(HttpStatus.OK).json({ ok: true });
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = (error as Error).message;
      this.logger.error(`Webhook failure: bot=${botId} updateId=${update.update_id} duration=${duration}ms error=${message}`);

      res.status(HttpStatus.BAD_REQUEST).json({ 
        ok: false, 
        error: message,
      });
    }
  }
}

