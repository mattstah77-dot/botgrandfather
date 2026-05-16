import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnershipVerificationService } from './ownership-verification.service';
import { Bot } from '../bot/entities/bot.entity';

/**
 * Ownership Module
 *
 * Provides ownership verification for multi-tenant safety.
 * - OwnershipVerificationService: manual ownership checks (placeholder)
 *
 * NOTE: BotOwnershipGuard moved to BotModule to avoid circular
 * dependency issues with TypeORM repository injection.
 * OwnershipVerificationService still needs BotRepository.
 *
 * Import this module where you need ownership verification.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Bot])],
  providers: [OwnershipVerificationService],
  exports: [OwnershipVerificationService],
})
export class OwnershipModule {}
