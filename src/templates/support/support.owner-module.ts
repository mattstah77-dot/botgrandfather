import { registerOwnerModule } from '../../owner-modules/owner-module.registry';
import { OwnerModuleDefinition } from '../../owner-modules/owner-module.interface';

/**
 * Support Desk Owner Module Definition.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This metadata tells the Mini App how to render support desk-related UI.
 * No template-specific logic in the frontend — all driven by metadata.
 */
export const supportOwnerModule: OwnerModuleDefinition = {
  template: 'support',
  displayName: 'Support Desk',
  usesCustomerLayer: true,
  createsLeads: false,
  hasCustomerMiniApp: false,
  navigation: [
    {
      id: 'tickets',
      label: 'Tickets',
      icon: '🎫',
      route: '/tickets',
    },
  ],
  settings: [
    {
      id: 'general',
      label: 'General Settings',
      description: 'Configure support desk behavior',
      fields: [
        {
          key: 'businessName',
          label: 'Business Name',
          type: 'text',
          required: true,
        },
        {
          key: 'autoReplyMessage',
          label: 'Auto-Reply Message',
          type: 'textarea',
          required: true,
        },
        {
          key: 'defaultAssignee',
          label: 'Default Assignee',
          type: 'text',
          required: false,
        },
      ],
    },
    {
      id: 'categories',
      label: 'Categories',
      description: 'Define ticket categories',
      fields: [
        {
          key: 'categories',
          label: 'Categories (comma-separated)',
          type: 'textarea',
          required: false,
        },
      ],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Configure owner notifications',
      fields: [
        {
          key: 'notifyOnNewTicket',
          label: 'Notify on New Ticket',
          type: 'toggle',
          required: false,
        },
        {
          key: 'ownerChatId',
          label: 'Owner Telegram Chat ID',
          type: 'text',
          required: false,
        },
      ],
    },
  ],
  analyticsWidgets: [
    {
      id: 'total-tickets',
      label: 'Total Tickets',
      type: 'count',
      dataSource: 'tickets',
    },
    {
      id: 'open-tickets',
      label: 'Open Tickets',
      type: 'count',
      dataSource: 'tickets',
    },
    {
      id: 'recent-tickets',
      label: 'Recent Tickets',
      type: 'list',
      dataSource: 'tickets',
    },
  ],
};

// Register the module
registerOwnerModule(supportOwnerModule);
