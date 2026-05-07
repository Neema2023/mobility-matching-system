import { spatialIndex } from "./spatial-index";
import { redis } from "../../config/redis";
import { eventPublisher } from "../events/event.publisher";
import { randomUUID } from "crypto";
import { lockService } from "../assignments/lock.service";

type Driver = {
  driverId: string;
  lat: number;
  lng: number;
  status: "AVAILABLE" | "BUSY";
};

type Assignment = {
  rideId: string;
  driverId: string;
  state: "PENDING" | "CONFIRMED" | "CANCELLED";
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

class MatchingService {
  private drivers = new Map<string, Driver>();

  // =========================
  // DRIVER UPDATE
  // =========================
  upsertDriver(driver: Driver): ApiResponse<Driver> {
    this.drivers.set(driver.driverId, driver);
    spatialIndex.addDriver(driver.driverId, driver.lat, driver.lng);

    void eventPublisher.publish({
      id: randomUUID(),
      type: "DRIVER_LOCATION_UPDATED",
      payload: driver,
      occurredAt: new Date(),
    });

    return { success: true, data: driver };
  }

  // =========================
  // MATCH TOP DRIVERS
  // =========================
  findTopDrivers(lat: number, lng: number): ApiResponse<any[]> {
    const nearby = spatialIndex.getNearbyDrivers(lat, lng);

    const result = nearby
      .map((id) => {
        const d = this.drivers.get(id);
        if (!d || d.status !== "AVAILABLE") return null;

        const distance = this.getDistance(lat, lng, d.lat, d.lng);

        return {
          driverId: d.driverId,
          distance,
          score: distance,
          reason: "closest_available_driver",
        };
      })
      .filter(Boolean) as any[];

    const top3 = result
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    void eventPublisher.publish({
      id: randomUUID(),
      type: "MATCH_PROPOSED",
      payload: top3,
      occurredAt: new Date(),
    });

    return {
      success: true,
      data: top3,
    };
  }


  // RESERVE DRIVER
 
  async reserveDriver(
    rideId: string,
    driverId: string
  ): Promise<ApiResponse<Assignment>> {
    const existing = await redis.get(`assignment:${rideId}`);

    if (existing) {
      return {
        success: true,
        message: "Already assigned",
        data: JSON.parse(existing),
      };
    }

    const locked = await lockService.acquire(driverId);

    if (!locked) {
      return {
        success: false,
        message: "Driver locked",
      };
    }

    const assignment: Assignment = {
      rideId,
      driverId,
      state: "PENDING",
    };

    await redis.set(`assignment:${rideId}`, JSON.stringify(assignment));

    void eventPublisher.publish({
      id: randomUUID(),
      type: "DRIVER_RESERVED",
      payload: assignment,
      occurredAt: new Date(),
    });

    return {
      success: true,
      message: "Driver reserved successfully",
      data: assignment,
    };
  }

  
  // CONFIRM MATCH
 
  async confirmMatch(
    rideId: string,
    driverId: string
  ): Promise<ApiResponse<Assignment>> {
    const raw = await redis.get(`assignment:${rideId}`);

    if (!raw) {
      return { success: false, message: "Assignment not found" };
    }

    const assignment: Assignment = JSON.parse(raw);

    if (assignment.driverId !== driverId) {
      return { success: false, message: "Driver mismatch" };
    }

    assignment.state = "CONFIRMED";

    await redis.set(`assignment:${rideId}`, JSON.stringify(assignment));
    await lockService.release(driverId);

    void eventPublisher.publish({
      id: randomUUID(),
      type: "DRIVER_CONFIRMED",
      payload: assignment,
      occurredAt: new Date(),
    });

    return {
      success: true,
      data: assignment,
    };
  }

 
  // CANCEL MATCH
  
  async cancelMatch(
    rideId: string,
    driverId: string
  ): Promise<ApiResponse<Assignment>> {
    const raw = await redis.get(`assignment:${rideId}`);

    if (!raw) {
      return { success: false, message: "Assignment not found" };
    }

    const assignment: Assignment = JSON.parse(raw);

    assignment.state = "CANCELLED";

    await redis.set(`assignment:${rideId}`, JSON.stringify(assignment));
    await lockService.release(driverId);

    void eventPublisher.publish({
      id: randomUUID(),
      type: "RIDE_CANCELLED",
      payload: assignment,
      occurredAt: new Date(),
    });

    return {
      success: true,
      data: assignment,
    };
  }

 
  // DISTANCE
  
  private getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;

    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  private toRad(v: number) {
    return (v * Math.PI) / 180;
  }
}

export const matchingService = new MatchingService();