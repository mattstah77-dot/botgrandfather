import { OwnerModuleDefinition } from './owner-module.interface';

/**
 * Central registry of owner-facing module definitions.
 * Every template that wants owner dashboard support MUST register here.
 *
 * The mini app will read this registry to dynamically render:
 * - navigation
 * - settings forms
 * - analytics widgets
 */
export const OWNER_MODULE_REGISTRY: Readonly<Record<string, OwnerModuleDefinition>> = {};

/**
 * Register an owner module for a template.
 */
export function registerOwnerModule(definition: OwnerModuleDefinition): void {
  (OWNER_MODULE_REGISTRY as Record<string, OwnerModuleDefinition>)[definition.template] = definition;
}

/**
 * Get owner module definition for a template.
 */
export function getOwnerModule(template: string): OwnerModuleDefinition | undefined {
  return OWNER_MODULE_REGISTRY[template];
}

/**
 * Check if a template has owner module support.
 */
export function hasOwnerModule(template: string): boolean {
  return template in OWNER_MODULE_REGISTRY;
}

/**
 * Get all registered owner modules.
 */
export function getAllOwnerModules(): OwnerModuleDefinition[] {
  return Object.values(OWNER_MODULE_REGISTRY);
}
