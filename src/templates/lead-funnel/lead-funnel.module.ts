import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from '../../bot/entities/lead.entity';
import { UserState } from '../../bot/entities/user-state.entity';
import { LeadFunnelService } from './lead-funnel.service';
import { LeadFunnelQueryService } from './lead-funnel-query.service';
import { TelegramModule } from '../../telegram/telegram.module';
import { CustomerModule } from '../../customer/customer.module';
import { AnalyticsModule } from '../../analytics/analytics.module';

/**
 * Lead Funnel Module — Lead Funnel template.
 *
 * BOUNDARY:
 * - Lead Funnel is a TEMPLATE, not a runtime framework.
 * - LeadFunnelService is used by TemplateFactory for Telegram flow.
 * - LeadFunnelQueryService is used by MiniApp for operational visibility.
 *
 * SEPARATION:
 * - Runtime and Query services are separated.
 * - LeadFunnelService: runtime conversation flow (used by TemplateFactory)
 * - LeadFunnelQueryService: operational data access (used by MiniApp)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, UserState]),
    TelegramModule,
    CustomerModule,
    AnalyticsModule,
  ],
  providers: [LeadFunnelService, LeadFunnelQueryService],
  exports: [LeadFunnelService, LeadFunnelQueryService],
})
export class LeadFunnelModule {}
