export type EventType =
  | "RIDE_REQUESTED"
  | "MATCH_PROPOSED"
  | "DRIVER_LOCATION_UPDATED"
  | "DRIVER_RESERVED"
  | "DRIVER_CONFIRMED"
  | "RIDE_CANCELLED"
  | "MATCH_TIMEOUT";

export interface DomainEvent<T = any> {
  id: string;
  type: EventType;
  payload: T;
  occurredAt: Date;
}