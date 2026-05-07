import { redis } from "../../config/redis";

class LockService {
  private prefix = "lock:driver:";

  async acquire(driverId: string, ttl = 30): Promise<boolean> {
    const key = this.prefix + driverId;

    try {
      // SET key value NX EX ttl
      const result = await redis.set(key, "1", "EX", ttl, "NX");

      return result === "OK";
    } catch (err) {
      console.error("Lock acquire error:", err);
      return false;
    }
  }

  async release(driverId: string): Promise<void> {
    try {
      await redis.del(this.prefix + driverId);
    } catch (err) {
      console.error("Lock release error:", err);
    }
  }

  async isLocked(driverId: string): Promise<boolean> {
    const val = await redis.get(this.prefix + driverId);
    return val !== null;
  }
}

export const lockService = new LockService();