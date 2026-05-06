import { Logger } from '@nestjs/common';
import { TemplateContext, TemplateHandler, TemplateService } from '../template.interface';

export class Template1Handler implements TemplateHandler {
  private readonly logger = new Logger(Template1Handler.name);

  constructor(private readonly service: TemplateService) {}

  async handle(context: TemplateContext): Promise<void> {
    try {
      this.logger.debug(`Template1 handling message from user ${context.userId}`);

      if (context.messageText === '/start') {
        await this.service.handleStart(context);
        return;
      }

      await this.service.handleDefault(context);
    } catch (error) {
      this.logger.error(`Template1 handler error: ${error}`);
      throw error;
    }
  }
}
