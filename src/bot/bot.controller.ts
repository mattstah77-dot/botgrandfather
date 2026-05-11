import { Controller, Get, Post, Patch, Body, Param, Delete, HttpCode, HttpStatus, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { BotService } from './bot.service';
import { CustomerService } from '../customer/customer.service';
import { ConnectBotDto, UpdateBotConfigDto } from './dto/bot.dto';

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

  @Get(':id')
  async getBot(@Param('id') id: string) {
    return this.botService.getBotById(id);
  }

  @Patch(':id/config')
  async updateBotConfig(@Param('id') id: string, @Body() updateConfigDto: UpdateBotConfigDto) {
    return this.botService.updateBotConfig(id, updateConfigDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBot(@Param('id') id: string) {
    await this.botService.deleteBot(id);
  }

  /**
   * WARNING: This endpoint exposes all bots on the platform.
   * Remove or protect with admin auth before production.
   */
  @Get()
  async getAllBots() {
    return this.botService.getAllBots();
  }

  @Get(':id/leads')
  async getBotLeads(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.botService.getBotLeads(id, page, limit);
  }

  /**
   * Universal Customer API — reusable across ALL templates.
   * Lead-funnel, booking, shop, etc. all use the same customer layer.
   */
  @Get(':id/customers')
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
