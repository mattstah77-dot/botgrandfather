import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from './bot/bot.module';
import { WebhookModule } from './webhook/webhook.module';
import { TemplateModule } from './templates/template.module';
import { TelegramModule } from './telegram/telegram.module';
import { PlatformBotModule } from './platform-bot/platform-bot.module';
import { OwnerModule } from './owner/owner.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';
import { MiniappModule } from './miniapp/miniapp.module';
import { RuntimeModule } from './runtime/runtime.module';
import { OwnerModulesModule } from './owner-modules/owner-modules.module';
import { CustomerModule } from './customer/customer.module';
import { OwnershipModule } from './ownership/ownership.module';
import { Customer } from './customer/entities/customer.entity';
import { LifecycleModule } from './lifecycle/lifecycle.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Bot } from './bot/entities/bot.entity';
import { UserState } from './bot/entities/user-state.entity';
import { ProcessedUpdate } from './bot/entities/processed-update.entity';
import { Lead } from './bot/entities/lead.entity';
import { Owner } from './owner/entities/owner.entity';
import { AnalyticsEvent } from './analytics/entities/analytics-event.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Bot, UserState, ProcessedUpdate, Lead, Owner, AnalyticsEvent, Customer],
      synchronize: process.env.TYPEORM_SYNC !== 'false',
    }),
    RuntimeModule,
    OwnerModulesModule,
    OwnershipModule,
    BotModule,
    WebhookModule,
    TemplateModule,
    TelegramModule,
    PlatformBotModule,
    OwnerModule,
    AdminModule,
    AnalyticsModule,
    BillingModule,
    MiniappModule,
    CustomerModule,
    LifecycleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
