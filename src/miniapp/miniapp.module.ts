import { Module } from '@nestjs/common';

/**
 * Mini App Module — placeholder for future Telegram WebApp dashboard.
 *
 * Future capabilities:
 * - Owner dashboard (lead management, bot settings)
 * - Funnel editing (config-driven, no visual builder yet)
 * - Analytics overview
 * - Billing/subscription management
 *
 * Auth strategy: Telegram WebApp initData verification
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class MiniappModule {}
