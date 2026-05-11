import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateFactory } from './template.factory';
import { TelegramModule } from '../telegram/telegram.module';
import { UserState } from '../bot/entities/user-state.entity';
import { Lead } from '../bot/entities/lead.entity';
import { LeadFunnelService } from './lead-funnel/lead-funnel.service';
import { Template1Service } from './template1/template1.service';
import { Template2Service } from './template2/template2.service';
import { Template3Service } from './template3/template3.service';

@Global()
@Module({
  imports: [
    TelegramModule,
    TypeOrmModule.forFeature([UserState, Lead]),
  ],
  providers: [
    TemplateFactory,
    LeadFunnelService,
    Template1Service,
    Template2Service,
    Template3Service,
  ],
  exports: [TemplateFactory, LeadFunnelService],
})
export class TemplateModule {}
