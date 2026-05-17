import { Injectable, Logger } from '@nestjs/common';
import { TemplateHandler, TemplateContext, TemplateService } from './template.interface';
import { TelegramService } from '../telegram/telegram.service';
import { isValidTemplate } from './common/template.registry';
import { LeadFunnelService } from './lead-funnel/lead-funnel.service';
import { LeadFunnelHandler } from './lead-funnel/lead-funnel.handler';
import { Template1Service } from './template1/template1.service';
import { Template1Handler } from './template1/template1.handler';
import { Template2Service } from './template2/template2.service';
import { Template2Handler } from './template2/template2.handler';
import { Template3Service } from './template3/template3.service';
import { Template3Handler } from './template3/template3.handler';
import { BookingRuntimeService } from './booking/booking-runtime.service';
import { BookingHandler } from './booking/booking.handler';

/**
 * SINGLETON: One TemplateFactory holds ALL template handlers.
 * All template services are injected via NestJS DI.
 * Handlers are instantiated once at bootstrap.
 */
@Injectable()
export class TemplateFactory {
  private readonly logger = new Logger(TemplateFactory.name);
  private readonly handlers = new Map<string, TemplateHandler>();

  constructor(
    private readonly telegramService: TelegramService,
    private readonly template1Service: Template1Service,
    private readonly template2Service: Template2Service,
    private readonly template3Service: Template3Service,
    private readonly leadFunnelService: LeadFunnelService,
    private readonly bookingRuntimeService: BookingRuntimeService,
  ) {
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    // Register all handlers explicitly — no dynamic reflection, no special cases
    this.handlers.set('template1', new Template1Handler(this.template1Service));
    this.handlers.set('template2', new Template2Handler(this.template2Service));
    this.handlers.set('template3', new Template3Handler(this.template3Service));
    this.handlers.set('lead-funnel', new LeadFunnelHandler(this.leadFunnelService, this.telegramService));
    this.handlers.set('booking', new BookingHandler(this.bookingRuntimeService, this.telegramService));
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
   * Get list of valid templates
   */
  getValidTemplates(): readonly string[] {
    return Array.from(this.handlers.keys());
  }
}

