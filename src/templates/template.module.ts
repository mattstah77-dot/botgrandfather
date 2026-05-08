import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateFactory } from './template.factory';
import { TelegramModule } from '../telegram/telegram.module';
import { UserState } from '../bot/entities/user-state.entity';
import { Lead } from '../bot/entities/lead.entity';

@Global()
@Module({
  imports: [
    TelegramModule,
    TypeOrmModule.forFeature([UserState, Lead]),
  ],
  providers: [TemplateFactory],
  exports: [TemplateFactory],
})
export class TemplateModule {}
