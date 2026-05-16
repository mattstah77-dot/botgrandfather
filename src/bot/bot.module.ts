import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { BotOwnershipGuard } from './bot-ownership.guard';
import { TelegramModule } from '../telegram/telegram.module';
import { CustomerModule } from '../customer/customer.module';
import { OwnershipModule } from '../ownership/ownership.module';
import { MiniAppAuthModule } from '../miniapp/auth/miniapp-auth.module';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';
import { Bot } from './entities/bot.entity';
import { UserState } from './entities/user-state.entity';
import { ProcessedUpdate } from './entities/processed-update.entity';
import { Lead } from './entities/lead.entity';
import { Booking } from '../templates/booking/entities/booking.entity';

@Module({
  imports: [
    TelegramModule,
    CustomerModule,
    OwnershipModule,
    MiniAppAuthModule,
    TypeOrmModule.forFeature([Bot, UserState, ProcessedUpdate, Lead, AnalyticsEvent, Booking]),
  ],
  controllers: [BotController],
  providers: [BotService, BotOwnershipGuard],
  exports: [BotService, BotOwnershipGuard],
})
export class BotModule {}
