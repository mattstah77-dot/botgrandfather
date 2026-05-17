import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Owner } from './entities/owner.entity';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';

/**
 * Owner Module — owner management and authentication.
 *
 * ARCHITECTURAL PRINCIPLE:
 * OwnerModule handles ONLY owner identity. It does NOT import BotModule.
 * Bot queries belong in MiniappModule (operational layer).
 *
 * CYCLE ELIMINATED:
 * Previously: OwnerModule → BotModule → MiniAppAuthModule → OwnerModule
 * Now: OwnerModule has NO dependency on BotModule.
 * forwardRef() removed.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Owner])],
  providers: [OwnerService],
  controllers: [OwnerController],
  exports: [OwnerService],
})
export class OwnerModule {}
