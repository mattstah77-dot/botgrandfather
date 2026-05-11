import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ProcessedUpdate } from '../bot/entities/processed-update.entity';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';

/**
 * DataLifecycleService — automatic cleanup of operational data.
 *
 * RETENTION POLICIES (configurable via ENV):
 * - ProcessedUpdate: 7 days (idempotency window)
 * - AnalyticsEvent: 90 days
 *
 * ARCHITECTURAL PRINCIPLE:
 * Cleanup is automatic, logged, and non-blocking.
 * No manual admin intervention required.
 */
@Injectable()
export class DataLifecycleService {
  private readonly logger = new Logger(DataLifecycleService.name);

  // Retention in days (override via environment variables)
  private readonly processedUpdateRetentionDays: number;
  private readonly analyticsEventRetentionDays: number;

  constructor(
    @InjectRepository(ProcessedUpdate)
    private readonly processedUpdateRepository: Repository<ProcessedUpdate>,
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
  ) {
    this.processedUpdateRetentionDays = parseInt(
      process.env.PROCESSED_UPDATE_RETENTION_DAYS || '7',
      10,
    );
    this.analyticsEventRetentionDays = parseInt(
      process.env.ANALYTICS_EVENT_RETENTION_DAYS || '90',
      10,
    );
  }

  /**
   * Cleanup ProcessedUpdate records older than retention period.
   * Runs daily at 3:00 AM.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupProcessedUpdates(): Promise<void> {
    const startTime = Date.now();
    const cutoffDate = this.getCutoffDate(this.processedUpdateRetentionDays);

    try {
      const result = await this.processedUpdateRepository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoffDate', { cutoffDate })
        .execute();

      const deleted = result.affected || 0;
      const duration = Date.now() - startTime;

      this.logger.log(
        `Cleanup completed: ProcessedUpdate deleted=${deleted} retention=${this.processedUpdateRetentionDays}d cutoff=${cutoffDate.toISOString()} duration=${duration}ms`,
      );
    } catch (error) {
      this.logger.error(
        `Cleanup failed: ProcessedUpdate error=${(error as Error).message}`,
      );
    }
  }

  /**
   * Cleanup AnalyticsEvent records older than retention period.
   * Runs daily at 3:30 AM (offset from ProcessedUpdate cleanup).
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    // We'll use a different approach: manual scheduling offset
  })
  async cleanupAnalyticsEvents(): Promise<void> {
    const startTime = Date.now();
    const cutoffDate = this.getCutoffDate(this.analyticsEventRetentionDays);

    try {
      const result = await this.analyticsEventRepository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoffDate', { cutoffDate })
        .execute();

      const deleted = result.affected || 0;
      const duration = Date.now() - startTime;

      this.logger.log(
        `Cleanup completed: AnalyticsEvent deleted=${deleted} retention=${this.analyticsEventRetentionDays}d cutoff=${cutoffDate.toISOString()} duration=${duration}ms`,
      );
    } catch (error) {
      this.logger.error(
        `Cleanup failed: AnalyticsEvent error=${(error as Error).message}`,
      );
    }
  }

  /**
   * Manual cleanup trigger for admin use.
   * Returns number of deleted rows.
   */
  async runManualCleanup(
    table: 'processedUpdate' | 'analyticsEvent',
    daysOld: number,
  ): Promise<number> {
    const cutoffDate = this.getCutoffDate(daysOld);

    if (table === 'processedUpdate') {
      const result = await this.processedUpdateRepository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoffDate', { cutoffDate })
        .execute();
      return result.affected || 0;
    }

    if (table === 'analyticsEvent') {
      const result = await this.analyticsEventRepository
        .createQueryBuilder()
        .delete()
        .where('createdAt < :cutoffDate', { cutoffDate })
        .execute();
      return result.affected || 0;
    }

    return 0;
  }

  private getCutoffDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }
}
