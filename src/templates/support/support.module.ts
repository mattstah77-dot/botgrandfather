import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportRuntimeService } from './support-runtime.service';
import { SupportQueryService } from './support-query.service';
import { SupportLifecycleController } from './controllers/support-lifecycle.controller';
import { SupportDashboardController } from './controllers/support-dashboard.controller';
import { Ticket } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { Bot } from '../../bot/entities/bot.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { TelegramModule } from '../../telegram/telegram.module';
import { CustomerModule } from '../../customer/customer.module';
import { AnalyticsModule } from '../../analytics/analytics.module';
import { MiniAppAuthModule } from '../../miniapp/auth/miniapp-auth.module';
import { OwnershipModule } from '../../ownership/ownership.module';

/**
 * Support Module — Support Desk template.
 *
 * BOUNDARY:
 * - Support is a TEMPLATE, not a runtime framework.
 * - SupportRuntimeService is used by TemplateFactory for Telegram flow.
 * - SupportQueryService is used by MiniApp for operational visibility.
 *
 * SEPARATION:
 * - Runtime and Query services are separated.
 * - SupportRuntimeService: runtime conversation flow (used by TemplateFactory)
 * - SupportQueryService: operational data access (used by MiniApp)
 *
 * DI NOTE: TypeOrmModule.forFeature([Customer]) is required for
 * SupportQueryService to read customer info for ticket lists.
 * Customer is a READ-ONLY reference, not a dependency on CustomerModule.
 * Support does NOT orchestrate CustomerModule.
 *
 * AUTH NOTE: MiniAppAuthModule and OwnershipModule are imported for
 * SupportLifecycleController and SupportDashboardController.
 * This is a cross-cutting security concern, NOT an operational layer import.
 * No circular dependencies exist.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketMessage, Bot, Customer]),
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
