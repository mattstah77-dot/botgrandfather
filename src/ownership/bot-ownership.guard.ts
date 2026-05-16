import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bot } from '../bot/entities/bot.entity';
import type { MiniAppRequest } from '../miniapp/auth/miniapp-auth.guard';
import type { Request } from 'express';

/**
 * BotOwnershipGuard — verifies the requesting owner owns the bot resource.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Ownership verification is centralized, reusable, and enforced server-side.
 * No duplicated checks in controllers. No client-side trust.
 *
 * Usage:
 * @UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
 * @Get(':id/overview')
 * async getBotOverview(@Param('id') botId: string, @Req() req: MiniAppRequest) { ... }
 *
 * The guard extracts botId from route params and session from request,
 * then verifies bot.ownerId === session.ownerId.
 */
@Injectable()
export class BotOwnershipGuard implements CanActivate {
  private readonly logger = new Logger(BotOwnershipGuard.name);

  constructor(
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const request = req as MiniAppRequest;
    const session = request.miniAppSession;

    if (!session) {
      this.logger.warn('Ownership check failed: no session');
      throw new ForbiddenException('Authentication required');
    }

    // Extract botId from route params
    const botId = req.params.id || req.params.botId;

    if (!botId || typeof botId !== 'string') {
      this.logger.warn('Ownership check failed: no botId in route params');
      throw new ForbiddenException('Bot ID required');
    }

    // Fetch bot with minimal fields (no token)
    const bot = await this.botRepository.findOne({
      where: { id: botId },
      select: ['id', 'ownerId'],
    });

    if (!bot) {
      this.logger.warn(`Ownership check failed: bot not found: ${botId}`);
      throw new NotFoundException(`Bot with ID ${botId} not found`);
    }

    // Verify ownership
    if (bot.ownerId !== session.ownerId) {
      this.logger.warn(
        `Ownership violation: owner=${session.ownerId} attempted access to bot=${botId} owned by=${bot.ownerId}`,
      );
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
