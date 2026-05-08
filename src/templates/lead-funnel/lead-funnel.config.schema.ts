import { ConfigSchema } from '../common/config-schema.interface';

/**
 * Config schema for lead-funnel template.
 * Validated at bot creation and config update time.
 */
export const leadFunnelConfigSchema: ConfigSchema = {
  businessName: { type: 'string', required: true },
  welcomeMessage: { type: 'string', required: true },
  completionMessage: { type: 'string', required: true },
  ownerChatId: { type: 'string', required: true },
  questions: { type: 'array', required: true },
  finalAction: { type: 'object', required: false },
};

/**
 * Default config for lead-funnel template.
 * Works for a generic marketing agency out of the box.
 */
export const leadFunnelDefaultConfig = {
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
};
