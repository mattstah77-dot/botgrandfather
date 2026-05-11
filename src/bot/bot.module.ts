import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { TelegramModule } from '../telegram/telegram.module';
import { CustomerModule } from '../customer/customer.module';
import { OwnershipModule } from '../ownership/ownership.module';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';
import { Bot } from './entities/bot.entity';
import { UserState } from './entities/user-state.entity';
import { ProcessedUpdate } from './entities/processed-update.entity';
import { Lead } from './entities/lead.entity';

@Module({
  imports: [
    TelegramModule,
    CustomerModule,
    OwnershipModule,
    TypeOrmModule.forFeature([Bot, UserState, ProcessedUpdate, Lead, AnalyticsEvent]),
  ],
  controllers: [BotController],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
