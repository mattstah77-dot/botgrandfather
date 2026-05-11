/**
 * DashboardWidget — universal widget model for Mini App operational views.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Widgets are template-agnostic. Each template module can register widgets
 * dynamically via OwnerModuleRegistry. The Mini App renders them generically.
 *
 * Widget types:
 * - metric: single number with label (e.g. "Total Customers: 120")
 * - list: paginated list of items (e.g. "Recent Leads")
 * - chart: time-series or categorical data (e.g. "Conversion Rate")
 * - table: structured tabular data (e.g. "Customer List")
 */
export interface DashboardWidget {
  /** Unique widget key */
  key: string;

  /** Widget type determines rendering */
  type: 'metric' | 'list' | 'chart' | 'table';

  /** Human-readable title */
  title: string;

  /** Template this widget belongs to (for grouping) */
  template?: string;

  /** Widget data — shape depends on type */
  data: unknown;

  /** Optional description/subtitle */
  description?: string;

  /** Optional link to detailed view */
  route?: string;
}

/**
 * MetricWidgetData — data shape for metric widgets.
 */
export interface MetricWidgetData {
  value: number | string;
  label: string;
  change?: number; // percentage change
  trend?: 'up' | 'down' | 'neutral';
}

/**
 * ListWidgetData — data shape for list widgets.
 */
export interface ListWidgetData {
  items: Array<Record<string, any>>;
  columns?: Array<{ key: string; label: string }>;
  total: number;
}

/**
 * ChartWidgetData — data shape for chart widgets.
 */
export interface ChartWidgetData {
  chartType: 'line' | 'bar' | 'pie';
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
  }>;
}
