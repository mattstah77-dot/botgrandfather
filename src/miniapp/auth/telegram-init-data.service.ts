import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { OwnerService } from '../../owner/owner.service';
import { MiniAppSession } from './miniapp-session.interface';
import { PLATFORM_BOT_TOKEN } from '../../config/env.config';

/**
 * TelegramInitDataService — validates Telegram Mini App initData.
 *
 * ARCHITECTURAL PRINCIPLE:
 * No fake auth. No bypass mode. No mock auth in production code.
 * initData is validated cryptographically using HMAC-SHA256.
 *
 * Reference: https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
@Injectable()
export class TelegramInitDataService {
  private readonly logger = new Logger(TelegramInitDataService.name);

  constructor(private readonly ownerService: OwnerService) {}

  /**
   * Validate initData and return a MiniAppSession.
   *
   * Flow:
   * 1. Parse initData query string
   * 2. Extract hash signature
   * 3. Recompute HMAC-SHA256
   * 4. Compare signatures
   * 5. Validate auth_date (replay protection)
   * 6. Find or create Owner
   * 7. Return session
   *
   * SECURITY:
   * - auth_date must be within max age (1 hour default)
   * - Prevents replay attacks with old initData
   *
   * @param initData Raw initData string from Telegram WebApp
   * @returns MiniAppSession
   * @throws UnauthorizedException if validation fails
   */
  async validateAndCreateSession(initData: string): Promise<MiniAppSession> {
    if (!initData) {
      throw new UnauthorizedException('Missing initData');
    }

    if (!PLATFORM_BOT_TOKEN) {
      this.logger.error('PLATFORM_BOT_TOKEN not configured — cannot validate initData');
      throw new UnauthorizedException('Auth not configured');
    }

    // Parse initData
    const params = this.parseInitData(initData);
    const hash = params.get('hash');

    if (!hash) {
      throw new UnauthorizedException('Missing hash in initData');
    }

    // Validate signature
    const isValid = this.validateSignature(params, hash, PLATFORM_BOT_TOKEN);

    if (!isValid) {
      this.logger.warn('initData signature validation failed');
      throw new UnauthorizedException('Invalid initData signature');
    }

    // Validate auth_date (replay protection)
    const authDate = params.get('auth_date');
    if (!authDate) {
      throw new UnauthorizedException('Missing auth_date in initData');
    }

    const authTimestamp = parseInt(authDate, 10);
    if (isNaN(authTimestamp)) {
      throw new UnauthorizedException('Invalid auth_date format');
    }

    const maxAgeSeconds = parseInt(
      process.env.INIT_DATA_MAX_AGE_SECONDS || '3600',
      10,
    ); // 1 hour default
    const now = Math.floor(Date.now() / 1000);
    const age = now - authTimestamp;

    if (age > maxAgeSeconds) {
      this.logger.warn(
        `initData too old: age=${age}s maxAge=${maxAgeSeconds}s`,
      );
      throw new UnauthorizedException('initData expired');
    }

    // Extract user from initData
    const userJson = params.get('user');
    if (!userJson) {
      throw new UnauthorizedException('Missing user in initData');
    }

    let telegramUser: { id: number; username?: string; first_name?: string; last_name?: string };
    try {
      telegramUser = JSON.parse(userJson);
    } catch {
      throw new UnauthorizedException('Invalid user data in initData');
    }

    if (!telegramUser.id) {
      throw new UnauthorizedException('Missing user ID in initData');
    }

    // Find or create Owner
    const owner = await this.ownerService.findOrCreateOwner(telegramUser.id, {
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
    });

    this.logger.log(`Mini App session created: owner=${owner.id} telegram=${telegramUser.id}`);

    return {
      ownerId: owner.id,
      telegramUserId: String(telegramUser.id),
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      authenticatedAt: new Date().toISOString(),
    };
  }

  /**
   * Parse initData query string into URLSearchParams.
   */
  private parseInitData(initData: string): URLSearchParams {
    // initData comes as query string: key=value&key=value
    // Values may be URL-encoded
    return new URLSearchParams(initData);
  }

  /**
   * Validate HMAC-SHA256 signature of initData.
   *
   * Algorithm:
   * 1. Sort all params alphabetically (excluding hash)
   * 2. Build data-check-string: key=value\nkey=value
   * 3. secret_key = HMAC_SHA256(key="WebAppData", msg=bot_token)
   * 4. computed_hash = HMAC_SHA256(key=secret_key, msg=data-check-string)
   * 5. Compare computed_hash with provided hash
   */
  private validateSignature(
    params: URLSearchParams,
    hash: string,
    botToken: string,
  ): boolean {
    // Build data-check-string
    const entries: [string, string][] = [];
    for (const [key, value] of params.entries()) {
      if (key === 'hash') continue;
      entries.push([key, value]);
    }

    // Sort alphabetically by key
    entries.sort((a, b) => a[0].localeCompare(b[0]));

    const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

    // secret_key = HMAC_SHA256(key="WebAppData", msg=bot_token)
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // computed_hash = HMAC_SHA256(key=secret_key, msg=data-check-string)
    const computedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return this.timingSafeEqual(computedHash, hash);
  }

  /**
   * Constant-time string comparison to prevent timing attacks.
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}
