import { Injectable, Logger } from '@nestjs/common';
import { TemplateService, TemplateContext } from '../template.interface';
import { TelegramService } from '../../telegram/telegram.service';

@Injectable()
export class Template3Service implements TemplateService {
  private readonly logger = new Logger(Template3Service.name);

  constructor(private readonly telegramService: TelegramService) {}

  async handleStart(context: TemplateContext): Promise<void> {
    const greeting = (context.botConfig?.greetingMessage as string) || 'Template 3 works';
    await this.telegramService.sendMessage(context.botToken, context.chatId, greeting);
  }

  async handleDefault(context: TemplateContext): Promise<void> {
    await this.telegramService.sendMessage(
      context.botToken,
      context.chatId,
      'Template 3: Hello! I received your message.',
    );
  }
}
