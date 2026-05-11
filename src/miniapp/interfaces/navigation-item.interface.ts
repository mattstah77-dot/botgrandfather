/**
 * NavigationItem — universal navigation item for Mini App sidebar/menu.
 *
 * Dynamically composed from:
 * - Universal navigation (dashboard, customers, analytics, settings)
 * - Template-specific navigation (from OwnerModuleRegistry)
 */
export interface NavigationItem {
  /** Unique key for routing */
  key: string;

  /** Display label */
  label: string;

  /** Route path */
  route: string;

  /** Optional icon identifier (emoji or icon name) */
  icon?: string;

  /** Whether this item is part of universal nav or template-specific */
  source: 'universal' | 'template';

  /** If template-specific, which template */
  template?: string;

  /** Whether this item is active (set by frontend) */
  active?: boolean;

  /** Child items for nested navigation */
  children?: NavigationItem[];
}
