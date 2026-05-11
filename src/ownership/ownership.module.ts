import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnershipVerificationService } from './ownership-verification.service';
import { BotOwnershipGuard } from './bot-ownership.guard';
import { Bot } from '../bot/entities/bot.entity';
import { BotModule } from '../bot/bot.module';

/**
 * Ownership Module
 *
 * Provides ownership verification for multi-tenant safety.
 * - OwnershipVerificationService: manual ownership checks
 * - BotOwnershipGuard: automatic guard for route protection
 *
 * Import this module where you need ownership verification.
 */
@Module({
  imports: [BotModule, TypeOrmModule.forFeature([Bot])],
  providers: [OwnershipVerificationService, BotOwnershipGuard],
  exports: [OwnershipVerificationService, BotOwnershipGuard],
})
export class OwnershipModule {}
