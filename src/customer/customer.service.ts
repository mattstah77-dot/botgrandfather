import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Customer } from './entities/customer.entity';

/**
 * CustomerService — universal customer lifecycle management.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This service is template-agnostic. Any template can create/update customers.
 * LeadFunnel, Booking, Shop — all use the same Customer layer.
 */
@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  /**
   * Find or create a Customer for a bot user.
   * Called on every significant user interaction.
   *
   * RACE CONDITION HANDLING:
   * If two concurrent webhooks try to create the same customer,
   * unique constraint violation is caught and we retry the lookup.
   */
  async ensureCustomer(
    botId: string,
    telegramUserId: number,
    profile?: {
      username?: string;
      firstName?: string;
      lastName?: string;
    },
  ): Promise<Customer> {
    let customer = await this.customerRepository.findOne({
      where: { botId, telegramUserId: BigInt(telegramUserId) },
    });

    if (!customer) {
      customer = this.customerRepository.create({
        botId,
        telegramUserId: BigInt(telegramUserId),
        username: profile?.username || null,
        firstName: profile?.firstName || null,
        lastName: profile?.lastName || null,
        status: 'new',
        tags: [],
      });

      try {
        await this.customerRepository.save(customer);
        this.logger.log(`Customer created: bot=${botId} user=${telegramUserId}`);
      } catch (error) {
        // Unique constraint violation — another webhook created the customer first
        if (error instanceof QueryFailedError) {
          const driverError = error.driverError;
          // PostgreSQL unique violation error code: 23505
          const isUniqueViolation = driverError?.code === '23505' || 
                                   (driverError?.message && driverError.message.includes('unique'));
          
          if (isUniqueViolation) {
            this.logger.debug(`Race condition resolved: customer already exists for bot=${botId} user=${telegramUserId}`);
            // Retry lookup
            customer = await this.customerRepository.findOne({
              where: { botId, telegramUserId: BigInt(telegramUserId) },
            });
            if (!customer) {
              this.logger.error(`Unexpected: customer not found after unique violation: bot=${botId} user=${telegramUserId}`);
              throw error;
            }
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    }

    // Update profile if changed
    if (customer && profile) {
      let changed = false;
      if (profile.username !== undefined && customer.username !== profile.username) {
        customer.username = profile.username || null;
        changed = true;
      }
      if (profile.firstName !== undefined && customer.firstName !== profile.firstName) {
        customer.firstName = profile.firstName || null;
        changed = true;
      }
      if (profile.lastName !== undefined && customer.lastName !== profile.lastName) {
        customer.lastName = profile.lastName || null;
        changed = true;
      }
      if (changed) {
        await this.customerRepository.save(customer);
      }
    }

    return customer!;
  }

  /**
   * Update customer status.
   * Logs warning if customer not found (does not throw).
   */
  async updateStatus(
    botId: string,
    telegramUserId: number,
    status: 'new' | 'active' | 'converted',
  ): Promise<void> {
    const result = await this.customerRepository.update(
      { botId, telegramUserId: BigInt(telegramUserId) },
      { status },
    );

    if (result.affected === 0) {
      this.logger.warn(`Customer not found for status update: bot=${botId} user=${telegramUserId}`);
    }
  }

  /**
   * Get customers for a bot with pagination.
   * STRICTLY multi-tenant.
   */
  async getBotCustomers(
    botId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ items: Customer[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.customerRepository.findAndCount({
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
   * Count customers by status for MULTIPLE bots in a single query.
   * Scalability fix: replaces N+1 queries with one aggregate query.
   */
  async countByStatusForBots(botIds: string[]): Promise<Record<string, Record<string, number>>> {
    if (botIds.length === 0) {
      return {};
    }

    const results = await this.customerRepository
      .createQueryBuilder('c')
      .select('c.botId', 'botId')
      .addSelect('c.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('c.botId IN (:...botIds)', { botIds })
      .groupBy('c.botId')
      .addGroupBy('c.status')
      .getRawMany();

    const grouped: Record<string, Record<string, number>> = {};
    for (const row of results) {
      if (!grouped[row.botId]) {
        grouped[row.botId] = {};
      }
      grouped[row.botId][row.status] = parseInt(row.count, 10);
    }

    return grouped;
  }
  async countByStatus(botId: string): Promise<Record<string, number>> {
    const results = await this.customerRepository
      .createQueryBuilder('c')
      .select('c.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('c.botId = :botId', { botId })
      .groupBy('c.status')
      .getRawMany();

    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.status] = parseInt(row.count, 10);
    }
    return counts;
  }
}
