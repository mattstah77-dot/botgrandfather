import { registerOwnerModule } from '../../owner-modules/owner-module.registry';
import { OwnerModuleDefinition } from '../../owner-modules/owner-module.interface';

/**
 * Booking Owner Module Definition.
 *
 * ARCHITECTURAL PRINCIPLE:
 * This metadata tells the Mini App how to render booking-related UI.
 * No template-specific logic in the frontend — all driven by metadata.
 */
export const bookingOwnerModule: OwnerModuleDefinition = {
  template: 'booking',
  displayName: 'Booking',
  usesCustomerLayer: true,
  createsLeads: false,
  navigation: [
    {
      id: 'bookings',
      label: 'Bookings',
      icon: '📅',
      route: '/bookings',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: '🗓️',
      route: '/calendar',
    },
  ],
  settings: [
    {
      id: 'business',
      label: 'Business Settings',
      description: 'Configure your business details',
      fields: [
        {
          key: 'businessName',
          label: 'Business Name',
          type: 'text',
          required: true,
        },
        {
          key: 'ownerChatId',
          label: 'Owner Telegram Chat ID',
          type: 'text',
          required: true,
        },
        {
          key: 'timezone',
          label: 'Timezone',
          type: 'text',
          required: true,
          default: 'UTC',
        },
      ],
    },
    {
      id: 'services',
      label: 'Services',
      description: 'Define bookable services',
      fields: [
        {
          key: 'services',
          label: 'Services',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      id: 'working-hours',
      label: 'Working Hours',
      description: 'Set availability for each day',
      fields: [
        {
          key: 'workingHours',
          label: 'Working Hours',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'Customize booking messages',
      fields: [
        {
          key: 'confirmationMessage',
          label: 'Confirmation Message',
          type: 'textarea',
          required: true,
        },
        {
          key: 'cancellationMessage',
          label: 'Cancellation Message',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
  analyticsWidgets: [
    {
      id: 'total-bookings',
      label: 'Total Bookings',
      type: 'count',
      dataSource: 'bookings',
    },
    {
      id: 'upcoming-bookings',
      label: 'Upcoming Bookings',
      type: 'list',
      dataSource: 'bookings',
    },
    {
      id: 'conversion-rate',
      label: 'Conversion Rate',
      type: 'funnel',
      dataSource: 'events',
    },
  ],
};

// Register the module
registerOwnerModule(bookingOwnerModule);
