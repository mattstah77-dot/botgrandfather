import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Owner } from './entities/owner.entity';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { BotModule } from '../bot/bot.module';

/**
 * Owner Module — owner management and authentication.
 *
 * NOTE: Uses forwardRef for BotModule to break circular dependency:
 * OwnerModule → BotModule → MiniAppAuthModule → OwnerModule
 */
@Module({
  imports: [TypeOrmModule.forFeature([Owner]), forwardRef(() => BotModule)],
  providers: [OwnerService],
  controllers: [OwnerController],
  exports: [OwnerService],
})
export class OwnerModule {}
