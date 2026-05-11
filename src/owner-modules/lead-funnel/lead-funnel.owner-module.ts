import { registerOwnerModule } from '../owner-module.registry';

/**
 * Lead Funnel Owner Module
 *
 * Registers owner-facing capabilities for the lead-funnel template.
 * This is metadata only — the mini app will render UI from this definition.
 */
registerOwnerModule({
  template: 'lead-funnel',
  displayName: 'Lead Funnel',
  navigation: [
    {
      id: 'customers',
      label: 'Customers',
      route: '/customers',
    },
    {
      id: 'leads',
      label: 'Leads',
      route: '/leads',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      route: '/analytics',
    },
    {
      id: 'settings',
      label: 'Settings',
      route: '/settings',
    },
  ],
  settings: [
    {
      id: 'business',
      label: 'Business Info',
      description: 'Basic business configuration',
      fields: [
        { key: 'businessName', label: 'Business Name', type: 'text', required: true },
        { key: 'welcomeMessage', label: 'Welcome Message', type: 'textarea', required: true },
        { key: 'completionMessage', label: 'Completion Message', type: 'textarea', required: true },
      ],
    },
    {
      id: 'questions',
      label: 'Funnel Questions',
      description: 'Configure funnel questions and options',
      fields: [
        { key: 'questions', label: 'Questions', type: 'textarea', required: true },
      ],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Owner notification settings',
      fields: [
        { key: 'ownerChatId', label: 'Owner Chat ID', type: 'text', required: true },
      ],
    },
    {
      id: 'finalAction',
      label: 'Final Action',
      description: 'Action after funnel completion',
      fields: [
        {
          key: 'finalAction.type',
          label: 'Action Type',
          type: 'select',
          options: [
            { label: 'Message', value: 'message' },
            { label: 'Invite Link', value: 'invite_link' },
          ],
        },
        { key: 'finalAction.text', label: 'Message Text', type: 'textarea' },
        { key: 'finalAction.inviteLink', label: 'Invite Link', type: 'text' },
      ],
    },
  ],
  analyticsWidgets: [
    {
      id: 'total-customers',
      label: 'Total Customers',
      type: 'count',
      dataSource: 'customers',
    },
    {
      id: 'total-leads',
      label: 'Total Leads',
      type: 'count',
      dataSource: 'leads',
    },
    {
      id: 'conversion-rate',
      label: 'Conversion Rate',
      type: 'chart',
      dataSource: 'events',
    },
    {
      id: 'recent-leads',
      label: 'Recent Leads',
      type: 'list',
      dataSource: 'leads',
    },
  ],
  usesCustomerLayer: true,
  createsLeads: true,
});
