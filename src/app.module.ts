import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from './bot/bot.module';
import { WebhookModule } from './webhook/webhook.module';
import { TemplateModule } from './templates/template.module';
import { TelegramModule } from './telegram/telegram.module';
import { PlatformBotModule } from './platform-bot/platform-bot.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Bot } from './bot/entities/bot.entity';
import { UserState } from './bot/entities/user-state.entity';
import { ProcessedUpdate } from './bot/entities/processed-update.entity';
import { Lead } from './bot/entities/lead.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Bot, UserState, ProcessedUpdate, Lead],
      synchronize: process.env.TYPEORM_SYNC !== 'false',
    }),
    BotModule,
    WebhookModule,
    TemplateModule,
    TelegramModule,
    PlatformBotModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
