import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportRuntimeService } from './support-runtime.service';
import { SupportQueryService } from './support-query.service';
import { SupportLifecycleController } from './controllers/support-lifecycle.controller';
import { SupportDashboardController } from './controllers/support-dashboard.controller';
import { Ticket } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { TelegramModule } from '../../telegram/telegram.module';
import { CustomerModule } from '../../customer/customer.module';
import { AnalyticsModule } from '../../analytics/analytics.module';
import { MiniAppAuthModule } from '../../miniapp/auth/miniapp-auth.module';
import { OwnershipModule } from '../../ownership/ownership.module';

/**
 * Support Desk Template Module — NestJS module for support desk template.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This module is self-contained. It imports only universal platform modules.
 * No cross-template imports. No operational layer imports.
 *
 * NOTE: Runtime and Query services are separated.
 * - SupportRuntimeService: runtime conversation flow (used by TemplateFactory)
 * - SupportQueryService: operational data access (used by MiniappModule)
 *
 * DI NOTE: TypeOrmModule.forFeature([Customer]) is required for
 * SupportQueryService to read customer info for ticket lists.
 *
 * AUTH NOTE: MiniAppAuthModule and OwnershipModule are imported for
 * SupportLifecycleController and SupportDashboardController.
 * This is a cross-cutting security concern, NOT an operational layer import.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketMessage, Customer]),
    TelegramModule,
    CustomerModule,
    AnalyticsModule,
    MiniAppAuthModule,
    OwnershipModule,
  ],
  controllers: [SupportLifecycleController, SupportDashboardController],
  providers: [SupportRuntimeService, SupportQueryService],
  exports: [SupportRuntimeService, SupportQueryService],
})
export class SupportModule {}
