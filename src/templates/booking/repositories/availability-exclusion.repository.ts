import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AvailabilityExclusion } from '../entities/availability-exclusion.entity';

/**
 * AvailabilityExclusionRepository — explicit data access for AvailabilityExclusion entity.
 *
 * ARCHITECTURAL PRINCIPLE:
 * - Explicit methods only. No generic query builder exposure.
 * - All queries are tenant-scoped (botId filter).
 * - Exclusions are TRUTH. No projection logic here.
 *
 * FORBIDDEN:
 * - Generic find(filters) methods
 * - Cross-bot queries
 * - Business logic
 */
@Injectable()
export class AvailabilityExclusionRepository {
  constructor(
    @InjectRepository(AvailabilityExclusion)
    private readonly repo: Repository<AvailabilityExclusion>,
  ) {}

  /**
   * Find all exclusions for a bot.
   */
  async findAllForBot(botId: string): Promise<AvailabilityExclusion[]> {
    return this.repo.find({
      where: { botId },
      order: { startAt: 'ASC' },
    });
  }

  /**
   * Find exclusions for a bot that overlap with a specific date.
   * Returns exclusions where startAt <= date <= endAt.
   */
  async findExclusionsForDate(
    botId: string,
    date: string,
    providerId?: string | null,
  ): Promise<AvailabilityExclusion[]> {
    const where: any = {
      botId,
      startAt: LessThanOrEqual(date),
      endAt: MoreThanOrEqual(date),
    };

    if (providerId !== undefined) {
      where.providerId = providerId ?? IsNull();
    }

    return this.repo.find({ where });
  }

  /**
   * Find exclusions for a specific provider.
   */
  async findByProvider(
    botId: string,
    providerId: string | null,
  ): Promise<AvailabilityExclusion[]> {
    return this.repo.find({
      where: { botId, providerId: providerId ?? IsNull() },
      order: { startAt: 'ASC' },
    });
  }

  /**
   * Create a new exclusion.
   */
  async create(
    data: Partial<AvailabilityExclusion>,
  ): Promise<AvailabilityExclusion> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  /**
   * Delete an exclusion.
   */
  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
