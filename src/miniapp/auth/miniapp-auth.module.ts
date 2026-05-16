import { Module } from '@nestjs/common';
import { TelegramInitDataService } from './telegram-init-data.service';
import { MiniAppAuthGuard } from './miniapp-auth.guard';
import { OwnerModule } from '../../owner/owner.module';

/**
 * MiniAppAuthModule — shared authentication module.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Auth services are extracted into a dedicated module to avoid
 * circular dependencies between BotModule and MiniappModule.
 *
 * Both BotModule (for BotController guards) and MiniappModule
 * import this module to access Telegram initData validation.
 */
@Module({
  imports: [OwnerModule],
  providers: [TelegramInitDataService, MiniAppAuthGuard],
  exports: [TelegramInitDataService, MiniAppAuthGuard],
})
export class MiniAppAuthModule {}
