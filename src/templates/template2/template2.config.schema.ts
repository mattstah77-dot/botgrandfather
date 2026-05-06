import { ConfigSchema } from '../common/config-schema.interface';

export const template2ConfigSchema: ConfigSchema = {
  greetingMessage: {
    type: 'string',
    required: true,
    default: 'Template 2 works',
  },
};
