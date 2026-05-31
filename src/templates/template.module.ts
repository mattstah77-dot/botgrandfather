import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateFactory } from './template.factory';
import { TelegramModule } from '../telegram/telegram.module';
import { CustomerModule } from '../customer/customer.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { UserState } from '../bot/entities/user-state.entity';
import { Bot } from '../bot/entities/bot.entity';
import { Lead } from '../bot/entities/lead.entity';
import { Booking } from './booking/entities/booking.entity';
import { ProviderAvailability } from './booking/entities/provider-availability.entity';
import { Template1Service } from './template1/template1.service';
import { Template2Service } from './template2/template2.service';
import { Template3Service } from './template3/template3.service';
import { BookingModule } from './booking/booking.module';
import { SupportModule } from './support/support.module';
import { LeadFunnelModule } from './lead-funnel/lead-funnel.module';
import { Ticket } from './support/entities/ticket.entity';
import { TicketMessage } from './support/entities/ticket-message.entity';
import { Customer } from '../customer/entities/customer.entity';

/**
 * TemplateModule — runtime template registry.
 *
 * PURPOSE:
 * - Owns TemplateFactory (runtime dispatcher)
 * - Imports template modules for TemplateFactory DI resolution
 *
 * VISIBILITY NOTE:
 * - This module is NOT @Global().
 * - It does NOT re-export template modules.
 * - Template modules are imported directly by consumers who need them.
 * - TemplateFactory is the ONLY export.
 *
 * WHY no re-export:
 * - Re-exporting template modules would expose runtime services
 *   (BookingRuntimeService, SupportRuntimeService, LeadFunnelService)
 *   to the operational layer.
 * - Operational layer should only access query services through
 *   explicit imports of template modules.
 */
@Module({
  imports: [
    TelegramModule,
    CustomerModule,
    AnalyticsModule,
    BookingModule,
    SupportModule,
    LeadFunnelModule,
    TypeOrmModule.forFeature([UserState, Bot, Lead, Booking, ProviderAvailability, Ticket, TicketMessage, Customer]),
  ],
  providers: [
    TemplateFactory,
    Template1Service,
    Template2Service,
    Template3Service,
  ],
  exports: [TemplateFactory],
})
export class TemplateModule {}
