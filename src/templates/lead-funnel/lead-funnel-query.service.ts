import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../../bot/entities/lead.entity';

/**
 * LeadFunnelQueryService — operational data access for the lead-funnel template.
 *
 * RESPONSIBILITY:
 * - Read-only queries for Mini App dashboards
 * - Lead lists, counts
 *
 * DOES NOT:
 * - Handle Telegram conversations
 * - Manage user state
 * - Create leads (see LeadFunnelService)
 *
 * USED BY:
 * - OwnerDashboardController (Mini App)
 * - DashboardService (owner stats aggregation)
 */
@Injectable()
export class LeadFunnelQueryService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  /**
   * Get leads for a bot with pagination.
   */
  async getBotLeads(
    botId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: Lead[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.leadRepository.findAndCount({
      where: { botId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const pages = Math.ceil(total / limit);

    return {
      items,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Count leads for MULTIPLE bots in a single query.
   * Scalability fix: replaces N+1 queries with one aggregate query.
   */
  async countLeadsByBotIds(botIds: string[]): Promise<Record<string, number>> {
    if (botIds.length === 0) {
      return {};
    }

    const results = await this.leadRepository
      .createQueryBuilder('l')
      .select('l.botId', 'botId')
      .addSelect('COUNT(*)', 'count')
      .where('l.botId IN (:...botIds)', { botIds })
      .groupBy('l.botId')
      .getRawMany();

    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.botId] = parseInt(row.count, 10);
    }

    return counts;
  }
}
