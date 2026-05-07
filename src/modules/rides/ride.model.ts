export type RideStatus =
  | "REQUESTED"
  | "MATCH_PROPOSED"
  | "MATCHED"
  | "CANCELLED";

export interface Ride {
  id: string;
  passengerId?: string;

  pickupLat: number;
  pickupLng: number;

  dropoffLat: number;
  dropoffLng: number;

  status: RideStatus;

  createdAt: Date;
  updatedAt: Date;
}