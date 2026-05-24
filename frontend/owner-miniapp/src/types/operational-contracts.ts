/**
 * Operational Contracts — Minimal frontend capability contracts.
 *
 * PHILOSOPHY:
 * These contracts enable capability-aware composition WITHOUT:
 * - Recursive schema engines
 * - Universal renderer temptation
 * - Plugin frontend runtime
 * - Dynamic component loaders
 *
 * They are:
 * - Explicit
 * - Minimal
 * - Compositional
 * - Manually registered
 *
 * NOT:
 * - Widget DSLs
 * - Frontend metadata engines
 * - Declarative UI languages
 */

// ─── NAVIGATION ──────────────────────────────────────────────

/**
 * NavigationItem — composed from OwnerModuleRegistry.
 * Frontend renders generically from this contract.
 */
export interface NavigationItem {
  /** Unique identifier (e.g., 'dashboard', 'bookings', 'leads') */
  id: string;

  /** Display label (e.g., 'Dashboard', 'Bookings') */
  label: string;

  /** Route path (e.g., '/dashboard', '/bots/:botId/bookings') */
  route: string;

  /** Optional icon emoji */
  icon?: string;

  /** Source: 'universal' or 'template' */
  source?: 'universal' | 'template';

  /** Template key if source === 'template' (e.g., 'booking', 'lead-funnel') */
  template?: string;
}

// ─── WIDGETS —────────────────────────────────────────────────

/**
 * OperationalWidget — generic widget contract for dashboard composition.
 *
 * IMPORTANT: Widgets are operational visualization components ONLY.
 * They are NOT:
 * - Runtime executors
 * - Orchestration engines
 * - Business logic containers
 */
export interface OperationalWidget {
  /** Unique identifier (e.g., 'bot-stats', 'upcoming-bookings') */
  id: string;

  /** Widget type for rendering */
  type: 'metric' | 'list' | 'chart' | 'custom';

  /** Display title */
  title: string;

  /** Optional description */
  description?: string;

  /** Capability key that provided this widget (e.g., 'booking', 'lead-funnel') */
  capability?: string;

  /** Widget-specific data (type-safe per widget type) */
  data?: Record<string, unknown>;

  /** Optional action (e.g., navigate to detail page) */
  action?: {
    type: 'navigate';
    route: string;
  };
}

/**
 * MetricWidgetData — data for metric-type widgets.
 */
export interface MetricWidgetData {
  value: number | string;
  label?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

/**
 * ListWidgetData — data for list-type widgets.
 */
export interface ListWidgetData<T = unknown> {
  items: T[];
  total?: number;
  renderItem: (item: T) => React.ReactNode; // Passed from parent, not serialized
}

// ─── CAPABILITY VIEW —────────────────────────────────────────

/**
 * CapabilityView — composed operational view for a bot.
 *
 * This is the main composition contract. Frontend renders:
 * - Navigation from NavigationItem[]
 * - Widgets from OperationalWidget[]
 * - Metadata for context
 */
export interface CapabilityView {
  /** View key (e.g., 'dashboard', 'bot-detail') */
  key: string;

  /** Display title */
  title: string;

  /** Navigation items for this view */
  navigation: NavigationItem[];

  /** Widgets to render */
  widgets: OperationalWidget[];

  /** View metadata */
  meta: {
    /** Owner ID */
    ownerId?: string;

    /** Bot ID (if bot-specific view) */
    botId?: string;

    /** Template key (e.g., 'booking', 'lead-funnel') */
    template?: string;

    /** Available capabilities for this bot */
    capabilities?: string[];
  };
}

// ─── DASHBOARD STATS —────────────────────────────────────────

/**
 * DashboardStats — template-agnostic owner-level stats.
 *
 * CAPABILITY NEUTRALITY:
 * These metrics are universal, NOT template-specific.
 * No "leads", "bookings" — only "customers", "interactions".
 */
export interface DashboardStats {
  /** Total bots owned */
  totalBots: number;

  /** Total customers across all bots */
  totalCustomers: number;

  /** Total interactions (template-agnostic) */
  totalInteractions: number;
}

/**
 * BotStats — template-agnostic bot-level stats.
 */
export interface BotStats {
  /** Bot ID */
  botId: string;

  /** Template key */
  template: string;

  /** Customer count */
  customerCount: number;

  /** Interaction count (template-agnostic) */
  interactionCount: number;

  /** Event count */
  eventCount: number;

  /** Customers by status */
  customersByStatus?: Record<string, number>;
}

// ─── ACTIONS ─────────────────────────────────────────────────

/**
 * CapabilityAction — operational action descriptor.
 *
 * ARCHITECTURAL PRINCIPLE:
 * Actions are NAVIGATION DESCRIPTORS ONLY.
 * They describe WHERE to go or WHAT endpoint to call.
 * They do NOT describe behavior, conditions, or orchestration.
 *
 * Backend decides availability. Frontend renders without business logic.
 */
export interface CapabilityAction {
  /** Unique action identifier */
  id: string;

  /** Display label */
  label: string;

  /** Action type — determines how frontend handles it */
  type: 'navigate' | 'lifecycle';

  /** Navigation route (for navigate-type actions) */
  route?: string;

  /** API endpoint (for lifecycle-type actions) */
  endpoint?: {
    method: 'POST' | 'DELETE' | 'PATCH';
    path: string;
  };

  /** Optional icon emoji */
  icon?: string;
}
