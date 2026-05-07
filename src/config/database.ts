import { Pool } from "pg";
import { env } from "./env";

export const pool = new Pool({
  connectionString: env.dbUrl,
});

// =========================
// TEST SAFETY (IMPORTANT)
// =========================
export const connectDB = async () => {
  // ❌ DO NOT CONNECT DB DURING TESTS
  if (process.env.NODE_ENV === "test") {
    return;
  }

  try {
    const client = await pool.connect();
    console.log("🐘 PostgreSQL connected successfully");
    client.release();
  } catch (error) {
    console.error("❌ DB connection failed:", error);
    process.exit(1);
  }
};

// =========================
// CLEAN SHUTDOWN (FIX JEST LEAK)
// =========================
if (process.env.NODE_ENV === "test") {
  process.once("beforeExit", async () => {
    try {
      await pool.end(); // 🔥 closes all DB connections
    } catch (_) {
      // ignore
    }
  });
}