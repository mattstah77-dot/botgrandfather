/**
 * Platform Events — lightweight internal event definitions.
 * No Kafka, no Redis, no event bus. Just typed event names for future hooks.
 *
 * Future analytics, billing, referrals will subscribe to these events.
 */

export type PlatformEventType =
  | 'bot:connected'
  | 'bot:deleted'
  | 'bot:config_updated'
  | 'lead:created'
  | 'funnel:started'
  | 'funnel:completed'
  | 'funnel:abandoned'
  | 'owner:created'
  | 'subscription:activated'
  | 'subscription:cancelled';

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
