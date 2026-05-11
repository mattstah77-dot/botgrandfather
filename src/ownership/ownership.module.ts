import { Module } from '@nestjs/common';
import { OwnershipVerificationService } from './ownership-verification.service';
import { BotModule } from '../bot/bot.module';

/**
 * Ownership Module
 *
 * Provides ownership verification foundation for multi-tenant safety.
 * Import this module when you need to verify bot ownership.
 *
 * TODO: Integrate with future auth system (JWT, Telegram initData).
 */
@Module({
  imports: [BotModule],
  providers: [OwnershipVerificationService],
  exports: [OwnershipVerificationService],
})
export class OwnershipModule {}
