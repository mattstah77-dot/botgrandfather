import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac } from 'crypto';
import { Bot } from '../../bot/entities/bot.entity';
import { CustomerSession } from './customer-session.interface';

/**
 * Minimal request interface for CustomerAuthGuard.
 * Does NOT import from express to avoid @types/express dependency in production builds.
 */
export interface CustomerRequest {
  params: { botId?: string | string[] };
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
  customerSession?: CustomerSession;
}

/**
 * CustomerAuthGuard — validates Telegram Mini App initData for customer-facing MiniApp.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Uses the CHILD BOT's token (not platform bot token) for initData validation.
 * The Mini App is opened from the child bot, so initData is signed with the
 * child bot's token.
 *
 * Flow:
 * 1. Extract botId from route params
 * 2. Look up bot to get its token
 * 3. Extract initData from header/query
 * 4. Validate HMAC-SHA256 using bot's token
 * 5. Extract user info
 * 6. Attach CustomerSession to request
 *
 * DIFFERENT from MiniAppAuthGuard:
 * - MiniAppAuthGuard: owner auth, uses PLATFORM_BOT_TOKEN
 * - CustomerAuthGuard: customer auth, uses child bot token
 */
@Injectable()
export class CustomerAuthGuard implements CanActivate {
  private readonly logger = new Logger(CustomerAuthGuard.name);

  constructor(
    @InjectRepository(Bot)
    private readonly botRepository: Repository<Bot>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as CustomerRequest;
    const path = request.headers['x-request-path'] || 'unknown';

    // Extract botId from route params
    const botId = Array.isArray(request.params?.botId)
      ? request.params.botId[0]
      : request.params?.botId;

    // Extract initData from header or query
    const initData =
      (request.headers['x-telegram-init-data'] as string) ||
      (request.query.initData as string);

    this.logger.log(`Customer auth: botId=${botId} initData present=${!!initData} header=${!!request.headers['x-telegram-init-data']}`);

    if (!botId) {
      this.logger.warn('Customer auth failed: no botId in route params');
      throw new UnauthorizedException('Bot ID required');
    }

    // Look up bot to get its token
    const bot = await this.botRepository.findOne({
      where: { id: botId },
      select: ['id', 'token', 'template'],
    });

    if (!bot) {
      this.logger.warn(`Customer auth failed: bot not found: ${botId}`);
      throw new UnauthorizedException('Bot not found');
    }

    if (!initData || typeof initData !== 'string') {
      this.logger.warn('Customer auth failed: missing initData');
      throw new UnauthorizedException('Missing authentication');
    }

    try {
      // Validate initData using the bot's token
      const session = this.validateInitData(initData, bot.token, botId);
      request.customerSession = session;
      return true;
    } catch (error) {
      this.logger.warn(`Customer auth failed for bot ${botId}: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid authentication');
    }
  }

  /**
   * Validate initData and return CustomerSession.
   *
   * NOTE: Controlled duplication of initData validation logic.
   * MiniAppAuthGuard uses PLATFORM_BOT_TOKEN; this guard uses child bot token.
   * Extracting shared logic would create premature abstraction.
   */
  private validateInitData(
    initData: string,
    botToken: string,
    botId: string,
  ): CustomerSession {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      throw new UnauthorizedException('Missing hash in initData');
    }

    // Validate signature
    const isValid = this.validateSignature(params, hash, botToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid initData signature');
    }

    // Validate auth_date (replay protection)
    const authDate = params.get('auth_date');
    if (!authDate) {
      throw new UnauthorizedException('Missing auth_date');
    }

    const authTimestamp = parseInt(authDate, 10);
    const maxAgeSeconds = parseInt(
      process.env.INIT_DATA_MAX_AGE_SECONDS || '3600',
      10,
    );
    const now = Math.floor(Date.now() / 1000);
    if (now - authTimestamp > maxAgeSeconds) {
      throw new UnauthorizedException('initData expired');
    }

    // Extract user
    const userJson = params.get('user');
    if (!userJson) {
      throw new UnauthorizedException('Missing user in initData');
    }

    let telegramUser: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    try {
      telegramUser = JSON.parse(userJson);
    } catch {
      throw new UnauthorizedException('Invalid user data');
    }

    return {
      botId,
      telegramUserId: String(telegramUser.id),
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
    };
  }

  /**
   * Validate HMAC-SHA256 signature.
   */
  private validateSignature(
    params: URLSearchParams,
    hash: string,
    botToken: string,
  ): boolean {
    const entries: [string, string][] = [];
    for (const [key, value] of params.entries()) {
      if (key === 'hash') continue;
      entries.push([key, value]);
    }

    entries.sort((a, b) => a[0].localeCompare(b[0]));
    const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const computedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Constant-time comparison
    if (computedHash.length !== hash.length) return false;
    let result = 0;
    for (let i = 0; i < computedHash.length; i++) {
      result |= computedHash.charCodeAt(i) ^ hash.charCodeAt(i);
    }
    return result === 0;
  }
}
