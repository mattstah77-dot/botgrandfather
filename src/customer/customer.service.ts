import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      await this.customerRepository.save(customer);
      this.logger.log(`Customer created: bot=${botId} user=${telegramUserId}`);
    } else if (profile) {
      // Update profile if changed
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

    return customer;
  }

  /**
   * Update customer status.
   */
  async updateStatus(
    botId: string,
    telegramUserId: number,
    status: 'new' | 'active' | 'converted',
  ): Promise<void> {
    await this.customerRepository.update(
      { botId, telegramUserId: BigInt(telegramUserId) },
      { status },
    );
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
   * Count customers by status for a bot.
   */
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
