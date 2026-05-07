import { assignmentService } from "../../modules/assignments/assignment.service";

describe("AssignmentService", () => {

  
  // RESERVE DRIVER
  
  it("should reserve a driver", async () => {

    const res = await assignmentService.reserve(
      "ride1",
      "driver1"
    );

    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.driverId).toBe("driver1");
    expect(res.data?.rideId).toBe("ride1");
  });

  
  // PREVENT DOUBLE BOOKING (FIXED LOGIC)
  
  it("should prevent double booking for same ride (idempotency)", async () => {

    // first reservation
    const first = await assignmentService.reserve(
      "ride2",
      "driver2"
    );

    // second reservation SAME ride + SAME driver
    const second = await assignmentService.reserve(
      "ride2",
      "driver2"
    );

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(second.message).toBe("Already reserved");
  });

});