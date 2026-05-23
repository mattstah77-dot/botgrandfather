/**
 * Platform Events — lightweight internal event definitions.
 * No Kafka, no Redis, no event bus. Just typed event names for future hooks.
 *
 * Future analytics, billing, referrals will subscribe to these events.
 *
 * NAMING CONVENTION:
 * - Dot notation only (booking.created, NOT booking:created)
 * - Past tense for facts (created, NOT create)
 * - Domain-first (customer.tag.added, NOT tag.customer.added)
 * - Capability-neutral where possible (conversion.completed, NOT booking.completed)
 */

export type PlatformEventType =
  // Session lifecycle (runtime)
  | 'session.started'
  | 'session.completed'
  | 'session.abandoned'
  
  // Conversion lifecycle (universal)
  | 'conversion.completed'
  
  // Customer lifecycle (universal CRM layer)
  | 'customer.created'
  | 'customer.updated'
  | 'customer.converted'
  
  // Booking capability events
  | 'booking.created'
  | 'booking.confirmed'
  | 'booking.cancelled'
  | 'booking.rescheduled'
  
  // Lead capability events
  | 'lead.created'
  
  // Bot lifecycle (platform)
  | 'bot.connected'
  | 'bot.deleted'
  | 'bot.config_updated'
  
  // Owner lifecycle (platform)
  | 'owner.created'
  
  // Subscription/billing events (future)
  | 'subscription.activated'
  | 'subscription.cancelled'
  | 'subscription.renewed'
  | 'quota.exceeded';

export interface PlatformEvent {
  type: PlatformEventType;
  timestamp: Date;
  botId?: string;
  ownerId?: string;
  userId?: number;
  payload?: Record<string, any>;
}

/**
 * Simple event emitter for internal monolith use.
 * Replace with external bus only when truly needed.
 */
export type PlatformEventListener = (event: PlatformEvent) => void | Promise<void>;

export class PlatformEventBus {
  private listeners = new Map<PlatformEventType, PlatformEventListener[]>();

  on(eventType: PlatformEventType, listener: PlatformEventListener): void {
    const existing = this.listeners.get(eventType) || [];
    existing.push(listener);
    this.listeners.set(eventType, existing);
  }

  async emit(event: PlatformEvent): Promise<void> {
    const eventListeners = this.listeners.get(event.type) || [];
    for (const listener of eventListeners) {
      try {
        await listener(event);
      } catch (error) {
        // Events must never crash the main flow
        console.error(`Event listener failed for ${event.type}:`, error);
      }
    }
  }
}

// Singleton instance for the monolith
export const platformEventBus = new PlatformEventBus();
