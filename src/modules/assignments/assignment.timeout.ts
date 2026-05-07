import { assignmentStore } from "./assignment.store";
import { lockService } from "./lock.service";
import { eventPublisher } from "../events/event.publisher";
import { randomUUID } from "crypto";

const TIMEOUT_MS = 30_000;

class AssignmentTimeoutService {
  private timers = new Map<string, NodeJS.Timeout>();

  startTimeout(rideId: string, driverId: string) {
    this.clearTimeout(rideId);

    const timer = setTimeout(() => {
      void this.handleTimeout(rideId, driverId);
    }, TIMEOUT_MS);

    this.timers.set(rideId, timer);
  }

  private async handleTimeout(rideId: string, driverId: string) {
    try {
      const assignment = await assignmentStore.get(rideId);

      if (!assignment) return;
      if (assignment.state !== "PENDING") return;

      await assignmentStore.updateState(rideId, "CANCELLED");

      await lockService.release(driverId);

      await eventPublisher.publish({
        id: randomUUID(),
        type: "MATCH_TIMEOUT",
        payload: assignment,
        occurredAt: new Date(),
      });

    } catch (err) {
      console.error("Timeout handler error:", err);
    }
  }

  clearTimeout(rideId: string) {
    const t = this.timers.get(rideId);
    if (t) clearTimeout(t);
    this.timers.delete(rideId);
  }
}

export const assignmentTimeoutService = new AssignmentTimeoutService();