import { Module } from '@nestjs/common';
import { OwnershipVerificationService } from './ownership-verification.service';

/**
 * Ownership Module
 *
 * Provides ownership verification for multi-tenant safety.
 * - OwnershipVerificationService: manual ownership checks (placeholder)
 *
 * NOTE: BotOwnershipGuard moved to BotModule to avoid circular
 * dependency issues with TypeORM repository injection.
 *
 * Import this module where you need ownership verification.
 */
@Module({
  providers: [OwnershipVerificationService],
  exports: [OwnershipVerificationService],
})
export class OwnershipModule {}
