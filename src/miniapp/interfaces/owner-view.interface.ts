import { DashboardWidget } from './dashboard-widget.interface';
import { NavigationItem } from './navigation-item.interface';

/**
 * OwnerView — composed operational view for a Mini App screen.
 *
 * The Mini App receives an OwnerView and renders it dynamically.
 * No template-specific hardcoding in the frontend.
 */
export interface OwnerView {
  /** View identifier */
  key: string;

  /** View title */
  title: string;

  /** Navigation items for this view */
  navigation: NavigationItem[];

  /** Widgets to render */
  widgets: DashboardWidget[];

  /** Optional metadata */
  meta?: Record<string, any>;
}

/**
 * DashboardView — the main operational overview.
 */
export interface DashboardView extends OwnerView {
  key: 'dashboard';
  title: 'Dashboard';
}

/**
 * BotDetailView — operational view for a specific bot.
 */
export interface BotDetailView extends OwnerView {
  key: 'bot-detail';
  title: string;
  botId: string;
  template: string;
}
