import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateFactory } from './template.factory';
import { TelegramModule } from '../telegram/telegram.module';
import { UserState } from '../bot/entities/user-state.entity';
import { Lead } from '../bot/entities/lead.entity';
import { LeadFunnelService } from './lead-funnel/lead-funnel.service';

@Global()
@Module({
  imports: [
    TelegramModule,
    TypeOrmModule.forFeature([UserState, Lead]),
  ],
  providers: [TemplateFactory, LeadFunnelService],
  exports: [TemplateFactory, LeadFunnelService],
})
export class TemplateModule {}
