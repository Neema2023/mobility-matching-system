import { lockService } from "./lock.service";
import { assignmentStore } from "./assignment.store";
import { eventPublisher } from "../events/event.publisher";
import { randomUUID } from "crypto";
import { assignmentTimeoutService } from "./assignment.timeout";

export class AssignmentService {

  
  // RESERVE (STRICT + SAFE)
  
  async reserve(rideId: string, driverId: string) {
    // 1. check existing assignment FIRST (idempotency)
    const existing = await assignmentStore.get(rideId);

    if (existing) {
      return {
        success: true,
        message: "Already reserved",
        data: existing,
      };
    }

    // 2. try to acquire lock (ONLY SOURCE OF TRUTH)
    const locked = await lockService.acquire(driverId);

    if (!locked) {
      return {
        success: false,
        message: "Driver already locked",
      };
    }

    // 3. create assignment
    const assignment = await assignmentStore.create(rideId, driverId);

    if (!assignment) {
      // rollback lock if creation fails
      await lockService.release(driverId);

      return {
        success: false,
        message: "Failed to create assignment",
      };
    }

    // 4. start timeout
    assignmentTimeoutService.startTimeout(rideId, driverId);

    // 5. event
    await eventPublisher.publish({
      id: randomUUID(),
      type: "DRIVER_RESERVED",
      payload: assignment,
      occurredAt: new Date(),
    });

    return {
      success: true,
      data: assignment,
    };
  }

  
  // CONFIRM
  
  async confirm(rideId: string, driverId: string) {
    const assignment = await assignmentStore.get(rideId);

    if (!assignment) {
      return { success: false, message: "Assignment not found" };
    }

    if (assignment.driverId !== driverId) {
      return { success: false, message: "Driver mismatch" };
    }

    if (assignment.state === "CONFIRMED") {
      return {
        success: true,
        message: "Already confirmed",
        data: assignment,
      };
    }

    if (assignment.state === "CANCELLED") {
      return { success: false, message: "Already cancelled" };
    }

    const updated = await assignmentStore.updateState(
      rideId,
      "CONFIRMED"
    );

    assignmentTimeoutService.clearTimeout(rideId);

    await lockService.release(driverId);

    await eventPublisher.publish({
      id: randomUUID(),
      type: "DRIVER_CONFIRMED",
      payload: updated,
      occurredAt: new Date(),
    });

    return {
      success: true,
      data: updated,
    };
  }

  
  // CANCEL
  
  async cancel(rideId: string, driverId: string) {
    const assignment = await assignmentStore.get(rideId);

    if (!assignment) {
      return { success: false, message: "Assignment not found" };
    }

    const updated = await assignmentStore.updateState(
      rideId,
      "CANCELLED"
    );

    assignmentTimeoutService.clearTimeout(rideId);

    await lockService.release(driverId);

    await eventPublisher.publish({
      id: randomUUID(),
      type: "RIDE_CANCELLED",
      payload: updated,
      occurredAt: new Date(),
    });

    return {
      success: true,
      data: updated,
    };
  }
}

export const assignmentService = new AssignmentService();