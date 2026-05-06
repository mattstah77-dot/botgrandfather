export interface BotUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot?: boolean;
      first_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      first_name?: string;
      username?: string;
    };
    date: number;
    text?: string;
    entities?: Array<{
      type: string;
      offset: number;
      length: number;
    }>;
  };
}

export interface TemplateContext {
  botId: string;
  botToken: string;
  botConfig: Record<string, any>;
  userId: number;
  chatId: number;
  messageText?: string;
  messageId: number;
}

/**
 * Thin handler: parses the update, delegates to TemplateService.
 * Handlers must NOT contain business logic.
 */
export interface TemplateHandler {
  handle(context: TemplateContext): Promise<void>;
}

/**
 * Service layer: contains all business logic for a template.
 * Services are isolated per template and communicate with Telegram
 * ONLY through TelegramService.
 */
export interface TemplateService {
  handleStart(context: TemplateContext): Promise<void>;
  handleDefault(context: TemplateContext): Promise<void>;
}
