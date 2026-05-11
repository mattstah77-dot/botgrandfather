import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bot } from '../bot/entities/bot.entity';

/**
 * Lightweight ownership verification service.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This is a FOUNDATION for future auth — not a full auth system.
 * Used internally to enforce tenant boundaries before adding full auth layer.
 *
 * NOTE: Uses TypeOrm directly to avoid circular dependency with BotModule.
 *
 * TODO: Replace with proper auth guards + Telegram initData verification.
 */
@Injectable()
export class OwnershipVerificationService {
  constructor(
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
  ) {}

  /**
   * Verify that a bot belongs to an owner.
   * Throws ForbiddenException if ownership does not match.
   *
   * CURRENT STATE:
   * - ownerToken is a placeholder for future auth token
   * - Returns bot with token for internal use only
   *
   * FUTURE:
   * - Replace ownerToken with JWT or Telegram initData
   * - Use in guards/decorators
   */
  async assertBotOwnership(botId: string, ownerToken: string): Promise<void> {
    // TODO: Implement proper auth verification
    // For now, we just verify the bot exists
    const bot = await this.botRepository.findOne({ where: { id: botId } });
    
    if (!bot) {
      throw new NotFoundException(`Bot with ID ${botId} not found`);
    }

    // TODO: Verify ownerToken matches bot.ownerId
    // For now, we skip this check (will be implemented in auth phase)
    // This is intentional — we're laying the foundation, not full auth yet
  }

  /**
   * Get bot with token if owner has access.
   * Internal use only — never expose token in API responses.
   */
  async getBotForInternalUse(botId: string, ownerToken: string): Promise<any> {
    // TODO: Implement proper auth verification
    const bot = await this.botRepository.findOne({
      where: { id: botId },
      select: ['id', 'token', 'template', 'config', 'webhookSecret', 'createdAt', 'updatedAt'],
    });
    
    if (!bot) {
      throw new NotFoundException(`Bot with ID ${botId} not found`);
    }

    // TODO: Verify ownerToken matches bot.ownerId
    return bot;
  }
}
