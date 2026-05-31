import { Injectable } from '@nestjs/common';
import { OwnerView, DashboardView } from '../interfaces/owner-view.interface';
import { DashboardWidget, MetricWidgetData } from '../interfaces/dashboard-widget.interface';
import { NavigationItem } from '../interfaces/navigation-item.interface';
import { NavigationService } from './navigation.service';

/**
 * OwnerViewService — composes operational views for the Mini App.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This is the orchestration layer between backend data and Mini App UI.
 * It aggregates data from multiple services and presents it as OwnerView objects.
 *
 * Future capabilities:
 * - CRM views
 * - Analytics dashboards
 * - Billing overviews
 * - Module-specific views
 * - Notification centers
 */
@Injectable()
export class OwnerViewService {
  constructor(private readonly navigationService: NavigationService) {}

  /**
   * Compose the main Dashboard view.
   *
   * Aggregates:
   * - Owner profile
   * - Bot statistics
   * - Customer metrics
   * - Interaction metrics (template-agnostic)
   * - Navigation
   *
   * NOTE: Template-specific metrics (e.g., "Leads", "Bookings")
   * are provided by OwnerModuleRegistry, not hardcoded here.
   */
  composeDashboardView(
    ownerId: string,
    botCount: number,
    customerCount: number,
    interactionCount: number,
    bots: Array<{ id: string; template: string }>,
  ): DashboardView {
    const templates = bots.map((b) => b.template);
    const navigation = this.navigationService.composeNavigation(templates);

    const widgets: DashboardWidget[] = [
      this.createMetricWidget('total-bots', 'Total Bots', botCount),
      this.createMetricWidget('total-customers', 'Total Customers', customerCount),
      this.createMetricWidget('total-interactions', 'Interactions', interactionCount),
    ];

    return {
      key: 'dashboard',
      title: 'Dashboard',
      navigation,
      widgets,
      meta: {
        ownerId,
        botTemplates: [...new Set(templates)],
      },
    };
  }

  /**
   * Compose a bot-specific operational view.
   *
   * TEMPLATE NEUTRALITY:
   * Uses generic interaction metrics, NOT template-specific counts.
   * Template-specific labels come from OwnerModuleRegistry.
   *
   * @param botId - Bot ID
   * @param template - Template key (for navigation only)
   * @param botStats - Template-agnostic metrics
   */
  composeBotView(
    botId: string,
    template: string,
    botStats: {
      customerCount: number;
      interactionCount: number;
      eventCount: number;
    },
  ): OwnerView {
    const templateNav = this.navigationService.getTemplateNavigation(template);

    const widgets: DashboardWidget[] = [
      this.createMetricWidget('bot-customers', 'Customers', botStats.customerCount),
      this.createMetricWidget('bot-interactions', 'Interactions', botStats.interactionCount),
      this.createMetricWidget('bot-events', 'Events', botStats.eventCount),
    ];

    return {
      key: 'bot-detail',
      title: 'Bot Overview',
      navigation: templateNav,
      widgets,
      meta: {
        botId,
        template,
      },
    };
  }

  /**
   * Create a metric widget.
   */
  private createMetricWidget(
    key: string,
    title: string,
    value: number,
  ): DashboardWidget {
    const data: MetricWidgetData = {
      value,
      label: title,
    };

    return {
      key,
      type: 'metric',
      title,
      data,
    };
  }
}
