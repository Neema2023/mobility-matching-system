import Redis from "ioredis";
import { env } from "./env";

const isTest = process.env.NODE_ENV === "test";

export const redis = new Redis(env.redisUrl, {
  lazyConnect: false,
  maxRetriesPerRequest: 3,

  // ✅ IMPORTANT FIX
  enableOfflineQueue: true,

  autoResubscribe: true,
});

// =========================
// LOGGING (non-test only)
// =========================
if (!isTest) {
  redis.on("connect", () => {
    console.log("⚡ Redis connected");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis error:", err);
  });
}

// =========================
// CLEAN SHUTDOWN (IMPORTANT FOR JEST)
// =========================
process.once("beforeExit", async () => {
  try {
    if (redis.status !== "end") {
      await redis.quit();
    }
  } catch (_) {}
});

process.once("exit", () => {
  redis.disconnect();
});