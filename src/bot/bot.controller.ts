import { Controller, Get, Post, Patch, Body, Param, Delete, HttpCode, HttpStatus, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { BotService } from './bot.service';
import { ConnectBotDto, UpdateBotConfigDto } from './dto/bot.dto';

@Controller('bots')
export class BotController {
  constructor(private readonly botService: BotService) {}

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
}
