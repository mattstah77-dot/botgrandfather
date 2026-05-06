import { Injectable, Logger } from '@nestjs/common';
import { TemplateHandler, TemplateContext, TemplateService } from './template.interface';
import { TelegramService } from '../telegram/telegram.service';
import {
  TEMPLATE_REGISTRY,
  getTemplateEntry,
  isValidTemplate,
} from './common/template.registry';

/**
 * SINGLETON: One TemplateFactory holds ALL template handlers.
 * Templates are instantiated once at bootstrap and reused for all bots.
 */
@Injectable()
export class TemplateFactory {
  private readonly logger = new Logger(TemplateFactory.name);
  private readonly handlers = new Map<string, TemplateHandler>();
  private readonly services = new Map<string, TemplateService>();

  constructor(private readonly telegramService: TelegramService) {
    this.initializeRegistry();
  }

  private initializeRegistry(): void {
    for (const entry of Object.values(TEMPLATE_REGISTRY)) {
      const service = new entry.serviceClass(this.telegramService);
      const handler = new entry.handlerClass(service);
      this.services.set(entry.name, service);
      this.handlers.set(entry.name, handler);
    }
  }

  /**
   * Get handler for a specific template
   */
  getHandler(template: string): TemplateHandler | null {
    const handler = this.handlers.get(template);
    if (!handler) {
      this.logger.error(`No handler found for template: ${template}`);
      return null;
    }
    return handler;
  }

  /**
   * Handle update with appropriate template handler
   */
  async handleUpdate(template: string, context: TemplateContext): Promise<void> {
    const handler = this.getHandler(template);
    
    if (!handler) {
      throw new Error(`No handler available for template: ${template}`);
    }

    await handler.handle(context);
  }

  /**
   * Check if a template name is valid
   */
  validateTemplateName(template: string): boolean {
    return isValidTemplate(template);
  }

  /**
   * Get list of valid template names
   */
  getValidTemplates(): readonly string[] {
    return Object.keys(TEMPLATE_REGISTRY);
  }
}
