import { Logger } from '@nestjs/common';
import { TemplateContext, TemplateHandler } from '../template.interface';
import { LeadFunnelService } from './lead-funnel.service';
import { TelegramService } from '../../telegram/telegram.service';

/**
 * Lead Funnel Handler — THIN. Only routes updates to service methods.
 * ALL business logic lives in LeadFunnelService.
 */
export class LeadFunnelHandler implements TemplateHandler {
  private readonly logger = new Logger(LeadFunnelHandler.name);

  constructor(
    private readonly service: LeadFunnelService,
    private readonly telegramService: TelegramService,
  ) {}

  async handle(context: TemplateContext): Promise<void> {
    try {
      // Route callback queries (inline button clicks)
      if (context.isCallback && context.callbackData) {
        // Answer callback query to remove loading spinner
        if (context.callbackQueryId) {
          await this.telegramService.answerCallbackQuery(
            context.botToken,
            context.callbackQueryId,
          );
        }

        await this.service.handleCallback(context, context.callbackData);
        return;
      }

      // Route text messages
      const text = context.messageText ?? '';

      if (text === '/start') {
        await this.service.handleStart(context);
        return;
      }

      // Default: let service decide based on user state
      await this.service.handleDefault(context);
    } catch (error) {
      this.logger.error(`LeadFunnel handler error: bot=${context.botId} user=${context.userId} ${error}`);
      // Intentionally swallowed — never crash the server on template errors
    }
  }
}

