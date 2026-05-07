export type DriverStatus = 'AVAILABLE' | 'BUSY';

export type RideStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type Driver = {
  driverId: string;
  lat: number;
  lng: number;
  status: DriverStatus;
  updatedAt: number;
};

export type RideRequest = {
  rideId: string;
  pickupLat: number;
  pickupLng: number;
  createdAt: number;
};

export type MatchResult = {
  driverId: string;
  distance: number;
  score: number;
};