import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { TelegramModule } from '../telegram/telegram.module';
import { Bot } from './entities/bot.entity';
import { UserState } from './entities/user-state.entity';
import { ProcessedUpdate } from './entities/processed-update.entity';

@Module({
  imports: [
    TelegramModule,
    TypeOrmModule.forFeature([Bot, UserState, ProcessedUpdate]),
  ],
  controllers: [BotController],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
