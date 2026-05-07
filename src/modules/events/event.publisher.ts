import { DomainEvent } from "./event.model";


// TYPES

type EventHandler = (event: DomainEvent) => Promise<void> | void;

export class EventPublisher {
  private subscribers: Map<string, EventHandler[]> = new Map();
  private eventLog: DomainEvent[] = [];

  
  // PUBLISH EVENT
  
  async publish(event: DomainEvent) {
    console.log(`📡 EVENT: ${event.type}`, {
      payload: event.payload,
      time: event.occurredAt,
    });

    // store event for replay
    this.eventLog.push(event);

    const handlers = this.subscribers.get(event.type) || [];

    if (handlers.length === 0) {
      console.log(`⚠️ No subscribers for: ${event.type}`);
      return;
    }

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (err) {
          console.error(`❌ Event handler failed: ${event.type}`, err);
        }
      })
    );
  }

  
  // SUBSCRIBE
  
  subscribe(eventType: string, handler: EventHandler) {
    const handlers = this.subscribers.get(eventType) || [];
    handlers.push(handler);
    this.subscribers.set(eventType, handlers);
  }

  
  // REPLAY EVENTS
 
  replay(): DomainEvent[] {
    return [...this.eventLog];
  }

 
  // CLEAR EVENTS
  
  clearLog() {
    this.eventLog = [];
  }
}

export const eventPublisher = new EventPublisher();