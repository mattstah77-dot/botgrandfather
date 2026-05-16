import { ConfigSchema } from '../common/config-schema.interface';

/**
 * Config schema for booking template.
 * Validated at bot creation and config update time.
 */
export const bookingConfigSchema: ConfigSchema = {
  businessName: { type: 'string', required: true },
  services: { type: 'array', required: true },
  workingHours: { type: 'object', required: true },
  confirmationMessage: { type: 'string', required: true },
  cancellationMessage: { type: 'string', required: true },
  ownerChatId: { type: 'string', required: true },
  timezone: { type: 'string', required: true },
};

/**
 * Default config for booking template.
 * Works for a generic service business out of the box.
 */
export const bookingDefaultConfig = {
  businessName: 'My Business',
  services: [
    {
      id: 'consultation',
      name: 'Free Consultation',
      durationMinutes: 30,
      price: null,
    },
    {
      id: 'service1',
      name: 'Standard Service',
      durationMinutes: 60,
      price: 100,
    },
  ],
  workingHours: {
    monday: {
      enabled: true,
      slots: [
        { time: '09:00', durationMinutes: 60 },
        { time: '10:00', durationMinutes: 60 },
        { time: '11:00', durationMinutes: 60 },
        { time: '14:00', durationMinutes: 60 },
        { time: '15:00', durationMinutes: 60 },
      ],
    },
    tuesday: {
      enabled: true,
      slots: [
        { time: '09:00', durationMinutes: 60 },
        { time: '10:00', durationMinutes: 60 },
        { time: '11:00', durationMinutes: 60 },
        { time: '14:00', durationMinutes: 60 },
        { time: '15:00', durationMinutes: 60 },
      ],
    },
    wednesday: {
      enabled: true,
      slots: [
        { time: '09:00', durationMinutes: 60 },
        { time: '10:00', durationMinutes: 60 },
        { time: '11:00', durationMinutes: 60 },
        { time: '14:00', durationMinutes: 60 },
        { time: '15:00', durationMinutes: 60 },
      ],
    },
    thursday: {
      enabled: true,
      slots: [
        { time: '09:00', durationMinutes: 60 },
        { time: '10:00', durationMinutes: 60 },
        { time: '11:00', durationMinutes: 60 },
        { time: '14:00', durationMinutes: 60 },
        { time: '15:00', durationMinutes: 60 },
      ],
    },
    friday: {
      enabled: true,
      slots: [
        { time: '09:00', durationMinutes: 60 },
        { time: '10:00', durationMinutes: 60 },
        { time: '11:00', durationMinutes: 60 },
        { time: '14:00', durationMinutes: 60 },
        { time: '15:00', durationMinutes: 60 },
      ],
    },
    saturday: {
      enabled: false,
      slots: [],
    },
    sunday: {
      enabled: false,
      slots: [],
    },
  },
  confirmationMessage: 'Your booking is confirmed! See you soon.',
  cancellationMessage: 'Your booking has been cancelled.',
  ownerChatId: '',
  timezone: 'UTC',
};
