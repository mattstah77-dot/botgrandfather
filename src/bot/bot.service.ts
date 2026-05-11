import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Bot } from './entities/bot.entity';
import { ProcessedUpdate } from './entities/processed-update.entity';
import { Lead } from './entities/lead.entity';
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
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    private readonly telegramService: TelegramService,
  ) {}

  /**
   * Generate a cryptographically secure webhook secret.
   */
  private generateWebhookSecret(): string {
    return randomBytes(24).toString('hex'); // 48 hex chars
  }

  /**
   * Connect a new bot.
   * Flow: validate token → create record → generate secret → set webhook.
   * Optionally assigns owner.
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

    // Save bot to database
    const bot = this.botRepository.create({
      token: dto.token,
      template: dto.template,
      config: finalConfig,
      webhookSecret,
      ownerId: ownerId || null,
    });

    await this.botRepository.save(bot);

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
   * Get all bots (token excluded).
   */
  async getAllBots() {
    return this.botRepository.find({
      select: ['id', 'template', 'config', 'webhookSecret', 'createdAt', 'updatedAt'],
    });
  }

  /**
   * Get all bots owned by a specific owner.
   */
  async getOwnerBots(ownerId: string) {
    return this.botRepository.find({
      where: { ownerId },
      select: ['id', 'template', 'config', 'webhookSecret', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get lightweight overview for a bot.
   * Returns basic bot info + counts (customers, leads, events).
   */
  async getBotOverview(botId: string): Promise<{
    id: string;
    template: string;
    createdAt: Date;
    updatedAt: Date;
    customerCount: number;
    leadCount: number;
    eventCount: number;
  }> {
    const bot = await this.botRepository.findOne({
      where: { id: botId },
      select: ['id', 'template', 'createdAt', 'updatedAt'],
    });

    if (!bot) {
      throw new NotFoundException(`Bot with ID ${botId} not found`);
    }

    // Count leads
    const leadCount = await this.leadRepository.count({ where: { botId } });

    // Count processed updates (proxy for total interactions)
    const eventCount = await this.processedUpdateRepository.count({ where: { botId } });

    return {
      id: bot.id,
      template: bot.template,
      createdAt: bot.createdAt,
      updatedAt: bot.updatedAt,
      customerCount: 0, // Will be populated by controller using CustomerService
      leadCount,
      eventCount,
    };
  }

  /**
   * Get leads for a specific bot with pagination.
   * STRICTLY multi-tenant: always filters by botId.
   */
  async getBotLeads(botId: string, page: number = 1, limit: number = 20) {
    const bot = await this.botRepository.findOne({ where: { id: botId } });

    if (!bot) {
      throw new NotFoundException(`Bot with ID ${botId} not found`);
    }

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
      pagination: {
        page,
        limit,
        total,
        pages,
      },
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
   * Transform bot to response format (exclude token).
   */
  private toBotResponse(bot: Bot): Omit<Bot, 'token'> {
    const { token, ...botWithoutToken } = bot;
    return botWithoutToken;
  }
}
