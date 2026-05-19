import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { TelegramInitDataService } from './telegram-init-data.service';
import { MiniAppSession } from './miniapp-session.interface';

/**
 * Extended Express Request type with MiniAppSession.
 * Alternative to module augmentation for better compatibility.
 */
export interface MiniAppRequest extends Request {
  miniAppSession?: MiniAppSession;
}

/**
 * MiniAppAuthGuard — validates Telegram Mini App initData on incoming requests.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This guard is reusable across ALL Mini App controllers.
 * It validates initData and attaches the session to the request.
 *
 * Usage:
 * @UseGuards(MiniAppAuthGuard)
 * @Get('dashboard')
 * async getDashboard(@Req() req: MiniAppRequest) {
 *   const session = req.miniAppSession;
 *   // ...
 * }
 *
 * CURRENT STATE:
 * - Validates initData cryptographically
 * - Creates/finds Owner automatically
 * - Attaches session to request
 *
 * FUTURE:
 * - Add session caching (Redis/memory)
 * - Add session expiry
 * - Add refresh mechanism
 */
@Injectable()
export class MiniAppAuthGuard implements CanActivate {
  private readonly logger = new Logger(MiniAppAuthGuard.name);

  constructor(private readonly initDataService: TelegramInitDataService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path;

    // Extract initData from header or query
    const initData =
      (request.headers['x-telegram-init-data'] as string) ||
      (request.query.initData as string);

    this.logger.log(`MiniApp auth: path=${path} initData present=${!!initData} header=${!!request.headers['x-telegram-init-data']}`);

    if (!initData || typeof initData !== 'string') {
      this.logger.warn(`Missing initData in request to ${path}`);
      throw new UnauthorizedException('Missing authentication');
    }

    try {
      const session = await this.initDataService.validateAndCreateSession(initData);
      (request as MiniAppRequest).miniAppSession = session;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn(`Mini App auth failed: ${error.message}`);
        throw error;
      }
      this.logger.error(`Auth validation error: ${error}`);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
