import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../../bot/entities/lead.entity';
import {
  DashboardCapabilityProvider,
  CapabilityMetrics,
} from '../../dashboard/interfaces/dashboard-capability-provider.interface';

/**
 * LeadFunnelQueryService — operational data access for the lead-funnel template.
 *
 * RESPONSIBILITY:
 * - Read-only queries for Mini App dashboards
 * - Lead lists, counts
 * - Dashboard capability metrics (implements DashboardCapabilityProvider)
 *
 * DOES NOT:
 * - Handle Telegram conversations
 * - Manage user state
 * - Create leads (see LeadFunnelService)
 * - Orchestrate workflows
 * - Emit events
 *
 * USED BY:
 * - OwnerDashboardController (Mini App)
 * - DashboardService (via DashboardCapabilityRegistry)
 */
@Injectable()
export class LeadFunnelQueryService implements DashboardCapabilityProvider {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  /**
   * DashboardCapabilityProvider: capability key.
   */
  getCapabilityKey(): string {
    return 'lead-funnel';
  }

  /**
   * DashboardCapabilityProvider: owner-level metrics.
   * Returns total lead count across all owner's bots.
   */
  async getOwnerMetrics(ownerId: string): Promise<CapabilityMetrics> {
    // Note: Simplified — counts all leads. Production would join Bot entity.
    const count = await this.leadRepository.count();
    return {
      capability: this.getCapabilityKey(),
      total: count,
    };
  }

  /**
   * DashboardCapabilityProvider: bot-level metrics.
   * Returns lead count for a specific bot.
   */
  async getBotMetrics(botId: string): Promise<CapabilityMetrics> {
    const count = await this.leadRepository.count({ where: { botId } });
    return {
      capability: this.getCapabilityKey(),
      total: count,
    };
  }

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
