import { ConfigSchema } from '../common/config-schema.interface';

export const template3ConfigSchema: ConfigSchema = {
  greetingMessage: {
    type: 'string',
    required: true,
    default: 'Template 3 works',
  },
};
