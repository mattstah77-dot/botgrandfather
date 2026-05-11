import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEvent } from './entities/analytics-event.entity';

/**
 * AnalyticsService — lightweight event tracking.
 * No heavy aggregation. Simple PostgreSQL inserts.
 *
 * Future: materialized views, pre-aggregated stats, time-series queries.
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly eventRepository: Repository<AnalyticsEvent>,
  ) {}

  /**
   * Track a lightweight analytics event.
   */
  async trackEvent(
    botId: string,
    eventType: string,
    metadata: Record<string, any> = {},
    ownerId?: string,
  ): Promise<void> {
    try {
      const event = this.eventRepository.create({
        botId,
        eventType,
        metadata,
        ownerId: ownerId || null,
      });
      await this.eventRepository.save(event);
    } catch (error) {
      // Analytics must never crash the main flow
      this.logger.warn(`Failed to track event: ${error}`);
    }
  }

  /**
   * Get simple stats for a bot.
   *
   * SCALABILITY: Uses database aggregation (GROUP BY COUNT).
   * Never loads all events into memory.
   */
  async getBotStats(botId: string): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
  }> {
    const results = await this.eventRepository
      .createQueryBuilder('e')
      .select('e.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('e.botId = :botId', { botId })
      .groupBy('e.eventType')
      .getRawMany();

    const eventsByType: Record<string, number> = {};
    let totalEvents = 0;

    for (const row of results) {
      const count = parseInt(row.count, 10);
      eventsByType[row.eventType] = count;
      totalEvents += count;
    }

    return {
      totalEvents,
      eventsByType,
    };
  }
}
