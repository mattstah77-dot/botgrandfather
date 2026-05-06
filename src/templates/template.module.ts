import { Module, Global } from '@nestjs/common';
import { TemplateFactory } from './template.factory';
import { TelegramModule } from '../telegram/telegram.module';

@Global()
@Module({
  imports: [TelegramModule],
  providers: [TemplateFactory],
  exports: [TemplateFactory],
})
export class TemplateModule {}
