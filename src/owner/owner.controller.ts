import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { BotService } from '../bot/bot.service';

/**
 * Owner-facing API endpoints.
 * Future: owner dashboard, bot management, profile.
 */
@Controller('owners')
export class OwnerController {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly botService: BotService,
  ) {}

  @Get(':id')
  async getOwner(@Param('id') id: string) {
    const owner = await this.ownerService.getOwnerById(id);
    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found`);
    }
    return owner;
  }

  @Get(':id/bots')
  async getOwnerBots(@Param('id') id: string) {
    const owner = await this.ownerService.getOwnerById(id);
    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found`);
    }

    const bots = await this.botService.getOwnerBots(id);

    return {
      items: bots.map((bot) => ({
        id: bot.id,
        template: bot.template,
        status: 'active',
        createdAt: bot.createdAt,
      })),
    };
  }
}
