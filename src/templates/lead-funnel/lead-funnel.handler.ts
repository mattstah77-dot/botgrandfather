import { Logger } from '@nestjs/common';
import { TemplateContext, TemplateHandler } from '../template.interface';
import { LeadFunnelService } from './lead-funnel.service';

/**
 * Lead Funnel Handler — THIN. Only routes updates to service methods.
 * ALL business logic lives in LeadFunnelService.
 */
export class LeadFunnelHandler implements TemplateHandler {
  private readonly logger = new Logger(LeadFunnelHandler.name);

  constructor(private readonly service: LeadFunnelService) {}

  async handle(context: TemplateContext): Promise<void> {
    try {
      // Route callback queries (inline button clicks)
      if (context.isCallback && context.callbackData) {
        this.logger.debug(`Handling callback: ${context.callbackData}`);
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
      this.logger.error(`LeadFunnel handler error: ${error}`);
      // Intentionally swallowed — never crash the server on template errors
    }
  }
}
