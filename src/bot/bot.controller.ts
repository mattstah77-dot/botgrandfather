import { Controller, Get, Post, Patch, Body, Param, Delete, HttpCode, HttpStatus, Query, ParseIntPipe, DefaultValuePipe, UseGuards, Req } from '@nestjs/common';
import { BotService } from './bot.service';
import { CustomerService } from '../customer/customer.service';
import { ConnectBotDto, UpdateBotConfigDto } from './dto/bot.dto';
import { BotOwnershipGuard } from '../ownership/bot-ownership.guard';
import { MiniAppAuthGuard } from '../miniapp/auth/miniapp-auth.guard';
import type { MiniAppRequest } from '../miniapp/auth/miniapp-auth.guard';

/**
 * Bot Controller — bot management and data access.
 *
 * SECURITY:
 * All bot-scoped endpoints enforce ownership via BotOwnershipGuard.
 * Public endpoints removed or protected.
 */
@Controller('bots')
export class BotController {
  constructor(
    private readonly botService: BotService,
    private readonly customerService: CustomerService,
  ) {}

  @Post('connect')
  async connectBot(@Body() connectBotDto: ConnectBotDto) {
    return this.botService.connectBot(connectBotDto);
  }

  /**
   * Get all bots owned by the authenticated owner.
   * Ownership verified by MiniAppAuthGuard.
   */
  @Get()
  @UseGuards(MiniAppAuthGuard)
  async getAllBots(@Req() req: MiniAppRequest) {
    const session = req.miniAppSession!;
    return this.botService.getOwnerBots(session.ownerId);
  }

  @Get(':id')
  @UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
  async getBot(@Param('id') id: string) {
    return this.botService.getBotById(id);
  }

  @Patch(':id/config')
  @UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
  async updateBotConfig(@Param('id') id: string, @Body() updateConfigDto: UpdateBotConfigDto) {
    return this.botService.updateBotConfig(id, updateConfigDto);
  }

  @Delete(':id')
  @UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBot(@Param('id') id: string) {
    await this.botService.deleteBot(id);
  }

  @Get(':id/leads')
  @UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
  async getBotLeads(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.botService.getBotLeads(id, page, limit);
  }

  /**
   * Universal Customer API — reusable across ALL templates.
   */
  @Get(':id/customers')
  @UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
  async getBotCustomers(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.customerService.getBotCustomers(id, page, limit);
  }

  /**
   * Bot Overview — universal metrics, template-agnostic.
   */
  @Get(':id/overview')
  @UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
  async getBotOverview(@Param('id') id: string) {
    const overview = await this.botService.getBotOverview(id);
    const statusCounts = await this.customerService.countByStatus(id);

    return {
      ...overview,
      customerCount: overview.customerCount + Object.values(statusCounts).reduce((a, b) => a + b, 0),
      customersByStatus: statusCounts,
    };
  }
}
