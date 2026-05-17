import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateFactory } from './template.factory';
import { TelegramModule } from '../telegram/telegram.module';
import { CustomerModule } from '../customer/customer.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { UserState } from '../bot/entities/user-state.entity';
import { Lead } from '../bot/entities/lead.entity';
import { Booking } from './booking/entities/booking.entity';
import { LeadFunnelService } from './lead-funnel/lead-funnel.service';
import { LeadFunnelQueryService } from './lead-funnel/lead-funnel-query.service';
import { Template1Service } from './template1/template1.service';
import { Template2Service } from './template2/template2.service';
import { Template3Service } from './template3/template3.service';
import { BookingRuntimeService } from './booking/booking-runtime.service';
import { BookingQueryService } from './booking/booking-query.service';

@Global()
@Module({
  imports: [
    TelegramModule,
    CustomerModule,
    AnalyticsModule,
    TypeOrmModule.forFeature([UserState, Lead, Booking]),
  ],
  providers: [
    TemplateFactory,
    LeadFunnelService,
    LeadFunnelQueryService,
    Template1Service,
    Template2Service,
    Template3Service,
    BookingRuntimeService,
    BookingQueryService,
  ],
  exports: [TemplateFactory, LeadFunnelQueryService, BookingQueryService],
})
export class TemplateModule {}
