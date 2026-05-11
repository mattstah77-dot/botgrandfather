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
   * Future: add date range filtering, grouping, pre-aggregation.
   */
  async getBotStats(botId: string): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
  }> {
    const events = await this.eventRepository.find({
      where: { botId },
      select: ['eventType'],
    });

    const eventsByType: Record<string, number> = {};
    for (const event of events) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
    }

    return {
      totalEvents: events.length,
      eventsByType,
    };
  }
}
