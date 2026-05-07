import { matchingService } from '../matching/match.service';
import { redis } from '../../config/redis';

type DriverInput = {
  driverId: string;
  lat: number;
  lng: number;
  status: 'AVAILABLE' | 'BUSY';
};

export class DriverService {
  async updateLocation(data: DriverInput) {
    const payload = {
      driverId: data.driverId,
      lat: Number(data.lat),
      lng: Number(data.lng),
      status: data.status || 'AVAILABLE',
      updatedAt: Date.now(),
    };

    // 1. Save to Redis (REAL-TIME storage)
    await redis.set(
      `driver:${data.driverId}`,
      JSON.stringify(payload),
      'EX',
      30 // expire after 30s (stale protection)
    );

    // 2. Also send to matching system (future step)
    matchingService.upsertDriver(payload);

    return payload;
  }
}