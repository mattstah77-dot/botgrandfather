import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { DataLifecycleService } from './data-lifecycle.service';
import { ProcessedUpdate } from '../bot/entities/processed-update.entity';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';

/**
 * Lifecycle Module — data retention and cleanup management.
 *
 * Provides:
 * - Scheduled cleanup of operational data
 * - Configurable retention policies
 * - Manual cleanup triggers
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([ProcessedUpdate, AnalyticsEvent]),
  ],
  providers: [DataLifecycleService],
  exports: [DataLifecycleService],
})
export class LifecycleModule {}
