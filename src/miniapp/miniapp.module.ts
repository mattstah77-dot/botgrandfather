import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MiniappController } from './controllers/miniapp.controller';
import { OwnerDashboardController } from './controllers/owner-dashboard.controller';
import { BookingDashboardController } from './controllers/booking-dashboard.controller';
import { MiniAppAuthModule } from './auth/miniapp-auth.module';
import { DashboardService } from './services/dashboard.service';
import { NavigationService } from './services/navigation.service';
import { OwnerViewService } from './services/owner-view.service';
import { OwnerModule } from '../owner/owner.module';
import { OwnershipModule } from '../ownership/ownership.module';
import { CustomerModule } from '../customer/customer.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { TemplateModule } from '../templates/template.module';
import { Bot } from '../bot/entities/bot.entity';

/**
 * Mini App Module — operational control center for BotGrandFather platform.
 *
 * PURPOSE:
 * - Owner dashboard (universal, template-agnostic)
 * - Dynamic navigation (driven by OwnerModuleRegistry)
 * - CRM, analytics, management
 *
 * AUTH:
 * - Telegram WebApp initData validation
 * - No JWT, no sessions, no refresh tokens (yet)
 *
 * ARCHITECTURE:
 * - Controllers: API endpoints (owner-level + bot-level)
 * - Services: Data aggregation, view composition, navigation
 * - Auth: Telegram initData validation + guard (via MiniAppAuthModule)
 *
 * DI NOTE:
 * TypeOrmModule.forFeature([Bot]) is required for BotOwnershipGuard
 * used by controllers in this module. This is repository visibility,
 * NOT domain ownership. BotModule is NOT imported to avoid coupling.
 *
 * NOT:
 * - Runtime engine
 * - Template-specific hardcoded UI
 * - Monolithic dashboard
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Bot]),
    OwnerModule,
    CustomerModule,
    AnalyticsModule,
    OwnershipModule,
    TemplateModule,
    MiniAppAuthModule,
  ],
  controllers: [MiniappController, OwnerDashboardController, BookingDashboardController],
  providers: [
    DashboardService,
    NavigationService,
    OwnerViewService,
  ],
  exports: [],
})
export class MiniappModule {}
