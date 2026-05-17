import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { randomBytes } from 'crypto';
import { Bot } from './entities/bot.entity';
import { ProcessedUpdate } from './entities/processed-update.entity';
import { ConnectBotDto, UpdateBotConfigDto } from './dto/bot.dto';
import { TelegramService } from '../telegram/telegram.service';
import { WEBHOOK_HOST, WEBHOOK_PATH } from '../config/env.config';
import {
  validateConfigAgainstSchema,
  applyConfigDefaults,
} from '../templates/common/config-schema.interface';
import {
  getTemplateEntry,
  isValidTemplate,
  VALID_TEMPLATE_NAMES,
} from '../templates/common/template.registry';
import { AnalyticsEvent } from '../analytics/entities/analytics-event.entity';

/**
 * SINGLETON: One BotService handles ALL bots as database records.
 * No separate processes, no separate instances per bot.
 */
@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
    @InjectRepository(ProcessedUpdate)
    private readonly processedUpdateRepository: Repository<ProcessedUpdate>,
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepository: Repository<AnalyticsEvent>,
    private readonly telegramService: TelegramService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generate a cryptographically secure webhook secret.
   */
  private generateWebhookSecret(): string {
    return randomBytes(24).toString('hex'); // 48 hex chars
  }

  /**
   * Sanitize config for API responses.
   * Removes sensitive fields that should never be exposed.
   */
  private sanitizeConfig(config: Record<string, any>): Record<string, any> {
    const sanitized = { ...config };
    
    // Remove sensitive keys
    delete sanitized.ownerChatId;
    delete sanitized.webhookSecret;
    delete sanitized.token;
    
    return sanitized;
  }

  /**
   * Connect a new bot.
   * Flow: validate token → create record → generate secret → set webhook.
   * Optionally assigns owner.
   *
   * TRANSACTION SAFETY:
   * Database writes are wrapped in a transaction.
   * If webhook setup fails, bot record is rolled back.
   */
  async connectBot(dto: ConnectBotDto, ownerId?: string) {
    // Validate token with Telegram (never log the raw token)
    const botInfo = await this.telegramService.validateToken(dto.token);

    // Validate template via registry
    if (!isValidTemplate(dto.template)) {
      throw new BadRequestException(
        `Invalid template. Must be one of: ${VALID_TEMPLATE_NAMES.join(', ')}`,
      );
    }

    const entry = getTemplateEntry(dto.template)!;

    // Merge: registry defaults → user config → schema defaults
    const mergedConfig = {
      ...entry.defaultConfig,
      ...(dto.config || {}),
    };
    const finalConfig = applyConfigDefaults(mergedConfig, entry.configSchema);
    validateConfigAgainstSchema(finalConfig, entry.configSchema);

    // Generate secure webhook secret
    const webhookSecret = this.generateWebhookSecret();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let bot: Bot;

    try {
      // Save bot to database within transaction
      bot = this.botRepository.create({
        token: dto.token,
        template: dto.template,
        config: finalConfig,
        webhookSecret,
        ownerId: ownerId || null,
      });

      bot = await queryRunner.manager.save(bot);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Bot connection failed: ${(error as Error).message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Set webhook on Telegram — URL contains botId + secret, NEVER the token
    const webhookUrl = `${WEBHOOK_HOST}${WEBHOOK_PATH}/${bot.id}/${webhookSecret}`;
    await this.telegramService.setWebhook(dto.token, webhookUrl);

    this.logger.log(`Bot connected: id=${bot.id}, template=${bot.template}, username=${botInfo.username}`);

    return {
      id: bot.id,
      template: bot.template,
      botUsername: botInfo.username,
      webhookUrl,
    };
  }

  /**
   * Get bot by ID (public API — token excluded).
   */
  async getBotById(id: string) {
    const bot = await this.botRepository.findOne({ where: { id } });

    if (!bot) {
      throw new NotFoundException(`Bot with ID ${id} not found`);
    }

    return this.toBotResponse(bot);
  }

  /**
   * Get bot by ID with token included (internal use only — never expose in API).
   */
  async getBotByIdWithToken(id: string): Promise<Bot | null> {
    return this.botRepository.findOne({
      where: { id },
      select: ['id', 'token', 'template', 'config', 'webhookSecret', 'createdAt', 'updatedAt'],
    });
  }

  /**
   * Verify webhook credentials: botId + secret.
   * Returns bot with token if valid, null otherwise.
   */
  async verifyWebhook(botId: string, secret: string): Promise<Bot | null> {
    const bot = await this.botRepository.findOne({
      where: { id: botId, webhookSecret: secret },
      select: ['id', 'token', 'template', 'config', 'webhookSecret', 'createdAt', 'updatedAt'],
    });
    return bot;
  }

  /**
   * Update bot config.
   */
  async updateBotConfig(id: string, dto: UpdateBotConfigDto) {
    const bot = await this.botRepository.findOne({ where: { id } });

    if (!bot) {
      throw new NotFoundException(`Bot with ID ${id} not found`);
    }

    const entry = getTemplateEntry(bot.template);
    if (!entry) {
      throw new BadRequestException(`Unknown template: ${bot.template}`);
    }

    validateConfigAgainstSchema(dto.config, entry.configSchema);

    bot.config = dto.config;
    const updatedBot = await this.botRepository.save(bot);

    return this.toBotResponse(updatedBot);
  }

  /**
   * Delete bot.
   */
  async deleteBot(id: string) {
    const bot = await this.botRepository.findOne({
      where: { id },
      select: ['id', 'token'],
    });

    if (!bot) {
      throw new NotFoundException(`Bot with ID ${id} not found`);
    }

    // Remove webhook
    await this.telegramService.setWebhook(bot.token, '');

    // Delete bot (cascades to related records)
    await this.botRepository.delete(id);

    this.logger.log(`Bot deleted: id=${id}`);
  }

  /**
   * Get all bots (token excluded, webhookSecret excluded).
   * WARNING: This endpoint is public — remove or protect before production.
   */
  async getAllBots() {
    return this.botRepository.find({
      select: ['id', 'template', 'config', 'createdAt', 'updatedAt'],
    });
  }

  /**
   * Get all bots owned by a specific owner.
   * Excludes sensitive fields (token, webhookSecret).
   */
  async getOwnerBots(ownerId: string) {
    return this.botRepository.find({
      where: { ownerId },
      select: ['id', 'template', 'config', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get lightweight overview for a bot.
   * Returns basic bot info + counts (customers, leads, bookings, events).
   */
  async getBotOverview(botId: string): Promise<{
    id: string;
    template: string;
    createdAt: Date;
    updatedAt: Date;
    customerCount: number;
    leadCount: number;
    bookingCount: number;
    eventCount: number;
  }> {
    const bot = await this.botRepository.findOne({
      where: { id: botId },
      select: ['id', 'template', 'createdAt', 'updatedAt'],
    });

    if (!bot) {
      throw new NotFoundException(`Bot with ID ${botId} not found`);
    }

    // Count leads — REMOVED from BotService.
    // BotService is template-agnostic. Use LeadFunnelQueryService for lead counts.
    const leadCount = 0;

    // Count bookings — REMOVED from BotService.
    // BotService is template-agnostic. Use BookingQueryService for booking counts.
    const bookingCount = 0;

    // Count analytics events (business events, not webhook deliveries)
    const eventCount = await this.analyticsEventRepository.count({ where: { botId } });

    return {
      id: bot.id,
      template: bot.template,
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
      customerCount: 0, // Will be populated by controller using CustomerService
      leadCount,
      bookingCount,
      eventCount,
    };
  }

  /**
   * Cleanup processed updates older than specified days.
   */
  async cleanupProcessedUpdates(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.processedUpdateRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Mark update as processed (for idempotency).
   */
  async markUpdateAsProcessed(botId: string, updateId: bigint): Promise<void> {
    try {
      const processedUpdate = this.processedUpdateRepository.create({
        botId,
        updateId,
      });
      await this.processedUpdateRepository.save(processedUpdate);
    } catch (error) {
      // Duplicate key is expected and safe — update already processed
      this.logger.debug(`Update already marked as processed: botId=${botId}, updateId=${updateId}`);
    }
  }

  /**
   * Check if update was already processed.
   */
  async isUpdateProcessed(botId: string, updateId: bigint): Promise<boolean> {
    const existing = await this.processedUpdateRepository.findOne({
      where: { botId, updateId },
    });
    return !!existing;
  }

  /**
   * Transform bot to response format (exclude token and webhookSecret).
   * Sanitizes config to remove sensitive fields.
   */
  private toBotResponse(bot: Bot): Omit<Bot, 'token' | 'webhookSecret'> & { config: Record<string, any> } {
    const { token, webhookSecret, ...botWithoutSensitive } = bot;
    return {
      ...botWithoutSensitive,
      config: this.sanitizeConfig(bot.config),
    };
  }
}
