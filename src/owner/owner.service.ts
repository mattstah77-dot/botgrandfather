import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Owner } from './entities/owner.entity';

/**
 * OwnerService — manages platform user lifecycle.
 * Created/updated automatically via BotGrandFather interactions.
 */
@Injectable()
export class OwnerService {
  private readonly logger = new Logger(OwnerService.name);

  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepository: Repository<Owner>,
  ) {}

  /**
   * Find or create an Owner by Telegram user ID.
   * Updates profile info if changed.
   */
  async findOrCreateOwner(
    telegramUserId: number,
    profile?: {
      username?: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<Owner> {
    let owner = await this.ownerRepository.findOne({
      where: { telegramUserId: BigInt(telegramUserId) },
    });

    if (!owner) {
      owner = this.ownerRepository.create({
        telegramUserId: BigInt(telegramUserId),
        username: profile?.username || null,
        firstName: profile?.firstName || null,
        lastName: profile?.lastName || null,
        subscriptionPlan: 'free',
      });
      await this.ownerRepository.save(owner);
      this.logger.log(`Owner created: telegramUserId=${telegramUserId}`);
    } else if (profile) {
      // Update profile if changed
      let changed = false;
      if (profile.username !== undefined && owner.username !== profile.username) {
        owner.username = profile.username || null;
        changed = true;
      }
      if (profile.firstName !== undefined && owner.firstName !== profile.firstName) {
        owner.firstName = profile.firstName || null;
        changed = true;
      }
      if (profile.lastName !== undefined && owner.lastName !== profile.lastName) {
        owner.lastName = profile.lastName || null;
        changed = true;
      }
      if (changed) {
        await this.ownerRepository.save(owner);
        this.logger.log(`Owner profile updated: telegramUserId=${telegramUserId}`);
      }
    }

    return owner;
  }

  /**
   * Get owner by ID.
   */
  async getOwnerById(id: string): Promise<Owner | null> {
    return this.ownerRepository.findOne({ where: { id } });
  }

  /**
   * Get owner by Telegram user ID.
   */
  async getOwnerByTelegramId(telegramUserId: number): Promise<Owner | null> {
    return this.ownerRepository.findOne({
      where: { telegramUserId: BigInt(telegramUserId) },
    });
  }

  /**
   * Update subscription plan.
   */
  async updateSubscriptionPlan(ownerId: string, plan: string): Promise<void> {
    await this.ownerRepository.update({ id: ownerId }, { subscriptionPlan: plan });
  }
}
