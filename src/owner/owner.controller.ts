import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { OwnerService } from './owner.service';

/**
 * Owner-facing API endpoints.
 * Future: owner dashboard, bot management, profile.
 */
@Controller('owners')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get(':id')
  async getOwner(@Param('id') id: string) {
    const owner = await this.ownerService.getOwnerById(id);
    if (!owner) {
      throw new NotFoundException(`Owner with ID ${id} not found`);
    }
    return owner;
  }
}
