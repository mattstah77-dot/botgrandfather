import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { getOwnerModule, getAllOwnerModules } from './owner-module.registry';

/**
 * Owner Modules API
 *
 * Returns metadata about owner-facing capabilities for each template.
 * The mini app uses this to dynamically render dashboard UI.
 */
@Controller('owner-modules')
export class OwnerModulesController {

  @Get()
  getAllModules() {
    return {
      modules: getAllOwnerModules(),
    };
  }

  @Get(':template')
  getModule(@Param('template') template: string) {
    const module = getOwnerModule(template);
    if (!module) {
      throw new NotFoundException(`No owner module found for template: ${template}`);
    }
    return module;
  }
}
