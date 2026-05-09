import { Controller, Delete, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { BotService } from '../bot/bot.service';

/**
 * Operational admin endpoints.
 * No auth yet — use behind firewall or with future auth middleware.
 */
@Controller('admin')
export class AdminController {
  constructor(private readonly botService: BotService) {}

  @Delete('processed-updates')
  async cleanupProcessedUpdates(
    @Query('days', new DefaultValuePipe(7), ParseIntPipe) days: number,
  ) {
    const deleted = await this.botService.cleanupProcessedUpdates(days);
    return { deleted };
  }
}
