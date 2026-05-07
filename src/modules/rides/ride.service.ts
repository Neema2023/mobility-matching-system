import { randomUUID } from "crypto";
import { redis } from "../../config/redis";
import { pool } from "../../config/database";
import { eventPublisher } from "../events/event.publisher";

export class RideService {
  async createRide(data: {
    passengerId?: string;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
  }) {
    const rideId = randomUUID();

    const ride = {
      id: rideId,
      passengerId: data.passengerId || null,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      dropoffLat: data.dropoffLat,
      dropoffLng: data.dropoffLng,
      status: "REQUESTED",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await pool.query(
      `INSERT INTO rides 
      (id, passenger_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, status, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        ride.id,
        ride.passengerId,
        ride.pickupLat,
        ride.pickupLng,
        ride.dropoffLat,
        ride.dropoffLng,
        ride.status,
        ride.createdAt,
      ]
    );

    await redis.setex(`ride:${rideId}`, 3600, JSON.stringify(ride));

    // 🔥 FIX: RIDE REQUEST EVENT (WAS MISSING)
    await eventPublisher.publish({
      id: randomUUID(),
      type: "RIDE_REQUESTED",
      payload: ride,
      occurredAt: new Date(),
    });

    // queue for matching
    await redis.lpush("ride:queue", rideId);

    return ride;
  }

  async getAllRides() {
    const result = await pool.query(`SELECT * FROM rides ORDER BY created_at DESC`);
    return result.rows;
  }
}