import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformBotController } from './platform-bot.controller';
import { PlatformBotService } from './platform-bot.service';
import { PlatformBotHandler } from './platform-bot.handler';
import { BotModule } from '../bot/bot.module';
import { OwnerModule } from '../owner/owner.module';
import { TelegramModule } from '../telegram/telegram.module';
import { Bot } from '../bot/entities/bot.entity';
import { UserState } from '../bot/entities/user-state.entity';

/**
 * BotGrandFather — internal platform control bot module.
 * Provides Telegram UI for users to connect their own bots.
 * NOT a template. Separate from the template system entirely.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Bot, UserState]),
    BotModule,
    OwnerModule,
    TelegramModule,
  ],
  controllers: [PlatformBotController],
  providers: [PlatformBotService, PlatformBotHandler],
  exports: [PlatformBotService],
})
export class PlatformBotModule {}
