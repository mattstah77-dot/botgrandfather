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
 * owner authentication and authorization.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketMessage, Bot, Customer]),
  ],
  controllers: [SupportLifecycleController, SupportDashboardController],
  providers: [SupportRuntimeService, SupportQueryService],
  exports: [SupportRuntimeService, SupportQueryService],
})
export class SupportModule {}
