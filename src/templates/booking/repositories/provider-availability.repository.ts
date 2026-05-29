import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ProviderAvailability } from '../entities/provider-availability.entity';

/**
 * ProviderAvailabilityRepository — explicit data access for ProviderAvailability entity.
 *
 * ARCHITECTURAL PRINCIPLE:
 * - Explicit methods only. No generic query builder exposure.
 * - All queries are tenant-scoped (botId filter).
 * - Availability is TRUTH. No projection logic here.
 *
 * FORBIDDEN:
 * - Generic find(filters) methods
 * - Cross-bot queries
 * - Slot computation
 * - Business logic
 */
@Injectable()
export class ProviderAvailabilityRepository {
  constructor(
    @InjectRepository(ProviderAvailability)
    private readonly repo: Repository<ProviderAvailability>,
  ) {}

  /**
   * Find availability for default provider on a specific weekday.
   */
  async findByBotAndWeekday(
    botId: string,
    weekday: ProviderAvailability['weekday'],
  ): Promise<ProviderAvailability | null> {
    return this.repo.findOne({
      where: { botId, providerId: IsNull(), weekday },
    });
  }

  /**
   * Find availability for a specific provider on a specific weekday.
   */
  async findByBotProviderAndWeekday(
    botId: string,
    providerId: string | null,
    weekday: ProviderAvailability['weekday'],
  ): Promise<ProviderAvailability | null> {
    return this.repo.findOne({
      where: {
        botId,
        providerId: providerId ?? IsNull(),
        weekday,
      },
    });
  }

  /**
   * Find all availability records for a bot.
   */
  async findAllForBot(botId: string): Promise<ProviderAvailability[]> {
    return this.repo.find({ where: { botId } });
  }

  /**
   * Save (create or update) an availability record.
   */
  async save(
    availability: ProviderAvailability,
  ): Promise<ProviderAvailability> {
    return this.repo.save(availability);
  }

  /**
   * Delete availability record.
   */
  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
