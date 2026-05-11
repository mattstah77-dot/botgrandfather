/**
 * OwnerModuleDefinition — metadata describing how a template appears
 * in the owner dashboard / mini app.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Every template can register owner-facing capabilities.
 * The mini app renders UI dynamically from this metadata.
 * No template-specific conditionals in the owner layer.
 */

export interface NavigationSection {
  id: string;
  label: string;
  icon?: string; // future: emoji or icon name
  route: string;
}

export interface SettingsSection {
  id: string;
  label: string;
  description?: string;
  fields: SettingsField[];
}

export interface SettingsField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'toggle' | 'number';
  required?: boolean;
  options?: { label: string; value: string }[];
  default?: any;
}

export interface AnalyticsWidget {
  id: string;
  label: string;
  type: 'count' | 'chart' | 'list' | 'funnel';
  dataSource: string; // e.g. 'customers', 'leads', 'events'
}

export interface OwnerModuleDefinition {
  /** Template name this module belongs to */
  template: string;

  /** Display name in owner dashboard */
  displayName: string;

  /** Navigation sections shown in owner sidebar */
  navigation: NavigationSection[];

  /** Settings sections available for configuration */
  settings: SettingsSection[];

  /** Analytics widgets available for this template */
  analyticsWidgets: AnalyticsWidget[];

  /** Whether this template supports universal customer layer */
  usesCustomerLayer: boolean;

  /** Whether this template creates leads (template-specific data) */
  createsLeads: boolean;
}
