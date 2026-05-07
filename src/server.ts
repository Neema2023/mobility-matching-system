import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";
import { eventPublisher } from "./modules/events/event.publisher";


// Redis only in runtime

if (process.env.NODE_ENV !== "test") {
  require("./config/redis");
}


// EVENT SUBSCRIPTIONS (FIXED)

function registerEventListeners() {
  const events = [
    "DRIVER_LOCATION_UPDATED",
    "DRIVER_RESERVED",
    "DRIVER_CONFIRMED",
    "RIDE_REQUESTED",
    "RIDE_CANCELLED",
    "MATCH_PROPOSED",
  ];

  events.forEach((eventType) => {
    eventPublisher.subscribe(eventType, (event) => {
      console.log(`🔥 EVENT RECEIVED [${eventType}]:`, {
        type: event.type,
        payload: event.payload,
      });
    });
  });
}

async function start() {
  try {
    await connectDB();

    if (process.env.NODE_ENV !== "test") {
      registerEventListeners();
    }

    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`);
    });

    
    // GRACEFUL SHUTDOWN
    
    const shutdown = () => {
      console.log("🛑 shutting down server...");
      server.close(() => {
        console.log("✅ Server stopped");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();