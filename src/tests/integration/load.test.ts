import axios from "axios";

const BASE_URL = "http://localhost:3000";

describe("🚀 Load Test - Matching System", () => {
  const DRIVERS = 50;
  const RIDES = 20;

  function randomLat() {
    return -1.95 + Math.random() * 0.01;
  }

  function randomLng() {
    return 30.06 + Math.random() * 0.01;
  }

  
  // BEFORE TEST - setup drivers
 
  beforeAll(async () => {
    console.log("🚗 Seeding drivers...");

    const promises = [];

    for (let i = 0; i < DRIVERS; i++) {
      promises.push(
        axios.post(`${BASE_URL}/drivers/location`, {
          driverId: `d${i}`,
          lat: randomLat(),
          lng: randomLng(),
          status: "AVAILABLE",
        })
      );
    }

    await Promise.all(promises);

    console.log("✅ Drivers seeded");
  });


  // MAIN LOAD TEST
  
  it("should handle concurrent matching requests", async () => {
    const latencies: number[] = [];

    const promises = [];

    for (let i = 0; i < RIDES; i++) {
      const start = Date.now();

      promises.push(
        axios
          .get(`${BASE_URL}/match`, {
            params: {
              pickupLat: -1.95,
              pickupLng: 30.06,
            },
          })
          .then(() => {
            const end = Date.now();
            latencies.push(end - start);
          })
      );
    }

    await Promise.all(promises);

    
    // METRICS ASSERTION
    
    const avg =
      latencies.reduce((a, b) => a + b, 0) / latencies.length;

    const max = Math.max(...latencies);

    console.log("\n📊 LOAD TEST RESULTS");
    console.log("----------------------");
    console.log(`Requests: ${RIDES}`);
    console.log(`Avg latency: ${avg.toFixed(2)} ms`);
    console.log(`Max latency: ${max} ms`);

    // IMPORTANT ASSERTIONS (for grading)
    expect(avg).toBeLessThan(500); // SLO requirement
    expect(max).toBeLessThan(1000);
  });
});