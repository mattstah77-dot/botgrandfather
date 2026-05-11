import { Injectable } from '@nestjs/common';
import { NavigationItem } from '../interfaces/navigation-item.interface';
import { getOwnerModule } from '../../owner-modules/owner-module.registry';

/**
 * NavigationService — dynamically composes Mini App navigation.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Navigation is NEVER hardcoded to lead-funnel.
 * It is composed from:
 * 1. Universal navigation items (same for all owners)
 * 2. Template-specific navigation (from OwnerModuleRegistry)
 *
 * The Mini App renders navigation dynamically from this service.
 */
@Injectable()
export class NavigationService {

  /**
   * Universal navigation items — shown for ALL owners regardless of templates.
   */
  private readonly universalNavigation: NavigationItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      route: '/dashboard',
      icon: '📊',
      source: 'universal',
    },
    {
      key: 'bots',
      label: 'My Bots',
      route: '/bots',
      icon: '🤖',
      source: 'universal',
    },
    {
      key: 'customers',
      label: 'Customers',
      route: '/customers',
      icon: '👥',
      source: 'universal',
    },
    {
      key: 'analytics',
      label: 'Analytics',
      route: '/analytics',
      icon: '📈',
      source: 'universal',
    },
    {
      key: 'settings',
      label: 'Settings',
      route: '/settings',
      icon: '⚙️',
      source: 'universal',
    },
  ];

  /**
   * Get universal navigation (owner-level, not bot-specific).
   */
  getUniversalNavigation(): NavigationItem[] {
    return this.universalNavigation;
  }

  /**
   * Get template-specific navigation for a bot.
   *
   * Looks up OwnerModuleRegistry for the bot's template
   * and returns its navigation sections.
   */
  getTemplateNavigation(template: string): NavigationItem[] {
    const module = getOwnerModule(template);

    if (!module) {
      return [];
    }

    return module.navigation.map((section) => ({
      key: section.id,
      label: section.label,
      route: `/bots/:botId${section.route}`,
      icon: section.icon,
      source: 'template' as const,
      template: module.template,
    }));
  }

  /**
   * Compose full navigation for an owner.
   *
   * Merges universal + template-specific navigation.
   * Template-specific items are grouped under bot context.
   */
  composeNavigation(templates: string[]): NavigationItem[] {
    const nav = [...this.universalNavigation];

    // Add template-specific navigation for each unique template
    const seenTemplates = new Set<string>();
    for (const template of templates) {
      if (seenTemplates.has(template)) continue;
      seenTemplates.add(template);

      const templateNav = this.getTemplateNavigation(template);
      nav.push(...templateNav);
    }

    return nav;
  }
}
