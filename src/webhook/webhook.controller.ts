import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import type { Request } from 'express';
import { WebhookService } from './webhook.service';

type RawBodyRequest<T extends Request = Request> = T & { rawBody?: Buffer };

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
    @Req() req: RawBodyRequest,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const update = JSON.parse(req.body.toString());
      this.webhookService.validateUpdate(update);

      const botId = req.params.botId as string;
      const secret = req.params.secret as string;

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
