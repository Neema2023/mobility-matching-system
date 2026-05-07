import { assignmentStore } from "../../modules/assignments/assignment.store";
import { assignmentTimeoutService } from "../../modules/assignments/assignment.timeout";

jest.useRealTimers(); 

describe("Assignment Timeout", () => {
  it("should cancel assignment after timeout", async () => {
    const rideId = "ride_kigali_001";
    const driverId = "driver_kigali_001";

    await assignmentStore.create(rideId, driverId);

    assignmentTimeoutService.startTimeout(rideId, driverId);

    // wait real execution (NOT fake timers)
    await new Promise((r) => setTimeout(r, 1100));

    const result = await assignmentStore.get(rideId);

    expect(result?.state).toBe("CANCELLED");
  }, 10000);
});