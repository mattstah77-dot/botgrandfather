import { TelegramService } from '../../telegram/telegram.service';
import { TemplateHandler, TemplateService } from '../template.interface';
import { ConfigSchema } from './config-schema.interface';
import { Template1Handler } from '../template1/template1.handler';
import { Template1Service } from '../template1/template1.service';
import { template1ConfigSchema } from '../template1/template1.config.schema';
import { Template2Handler } from '../template2/template2.handler';
import { Template2Service } from '../template2/template2.service';
import { template2ConfigSchema } from '../template2/template2.config.schema';
import { Template3Handler } from '../template3/template3.handler';
import { Template3Service } from '../template3/template3.service';
import { template3ConfigSchema } from '../template3/template3.config.schema';
import { LeadFunnelHandler } from '../lead-funnel/lead-funnel.handler';
import { LeadFunnelService } from '../lead-funnel/lead-funnel.service';
import { leadFunnelConfigSchema } from '../lead-funnel/lead-funnel.config.schema';

export interface TemplateRegistryEntry {
  readonly name: string;
  readonly handlerClass: new (service: TemplateService) => TemplateHandler;
  readonly serviceClass: new (telegramService: TelegramService) => TemplateService;
  readonly configSchema: ConfigSchema;
  readonly defaultConfig: Record<string, any>;
}

/**
 * Centralized template registry.
 * All templates MUST be registered here.
 * This is the single source of truth for template metadata.
 */
export const TEMPLATE_REGISTRY: Readonly<Record<string, TemplateRegistryEntry>> = {
  template1: {
    name: 'template1',
    handlerClass: Template1Handler,
    serviceClass: Template1Service,
    configSchema: template1ConfigSchema,
    defaultConfig: {
      greetingMessage: 'Template 1 works',
    },
  },
  template2: {
    name: 'template2',
    handlerClass: Template2Handler,
    serviceClass: Template2Service,
    configSchema: template2ConfigSchema,
    defaultConfig: {
      greetingMessage: 'Template 2 works',
    },
  },
  template3: {
    name: 'template3',
    handlerClass: Template3Handler,
    serviceClass: Template3Service,
    configSchema: template3ConfigSchema,
    defaultConfig: {
      greetingMessage: 'Template 3 works',
    },
  },
  'lead-funnel': {
    name: 'lead-funnel',
    handlerClass: LeadFunnelHandler as any,
    serviceClass: LeadFunnelService as any,
    configSchema: leadFunnelConfigSchema,
    defaultConfig: {
      businessName: 'My Business',
      welcomeMessage: "Welcome! Let's find the best solution for you.",
      completionMessage: 'Thank you! We will contact you soon.',
      ownerChatId: '',
      questions: [
        {
          id: 'service',
          type: 'buttons',
          question: 'What service are you interested in?',
          options: ['Website Development', 'Advertising', 'SEO'],
        },
        {
          id: 'budget',
          type: 'buttons',
          question: 'What is your budget?',
          options: ['$500-$1000', '$1000-$5000', '$5000+'],
        },
      ],
      finalAction: {
        type: 'message',
        text: 'Our manager will contact you soon.',
      },
    },
  },
};

export const VALID_TEMPLATE_NAMES = Object.freeze(Object.keys(TEMPLATE_REGISTRY));

export function getTemplateEntry(templateName: string): TemplateRegistryEntry | undefined {
  return TEMPLATE_REGISTRY[templateName];
}

export function isValidTemplate(templateName: string): boolean {
  return templateName in TEMPLATE_REGISTRY;
}
