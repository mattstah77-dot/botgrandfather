import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { TemplateModule } from '../templates/template.module';
import { BotModule } from '../bot/bot.module';

@Module({
  imports: [TemplateModule, BotModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
