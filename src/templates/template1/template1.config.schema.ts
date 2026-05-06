import { ConfigSchema } from '../common/config-schema.interface';

export const template1ConfigSchema: ConfigSchema = {
  greetingMessage: {
    type: 'string',
    required: true,
    default: 'Template 1 works',
  },
};
