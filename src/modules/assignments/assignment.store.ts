import { redis } from "../../config/redis";

export type AssignmentState =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED";

export type Assignment = {
  rideId: string;
  driverId: string;
  state: AssignmentState;
  createdAt: number;
};

export class AssignmentStore {
  private key = (rideId: string) => `assignment:${rideId}`;

  
  // CREATE (IDEMPOTENT)
  
  async create(rideId: string, driverId: string): Promise<Assignment | null> {
    try {
      const exists = await redis.get(this.key(rideId));
      if (exists) return JSON.parse(exists);

      const assignment: Assignment = {
        rideId,
        driverId,
        state: "PENDING",
        createdAt: Date.now(),
      };

      await redis.set(this.key(rideId), JSON.stringify(assignment));

      return assignment;
    } catch (err) {
      console.error("Assignment create error:", err);
      return null;
    }
  }

 
  // GET
 
  async get(rideId: string): Promise<Assignment | null> {
    try {
      const data = await redis.get(this.key(rideId));
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Assignment get error:", err);
      return null;
    }
  }

  
  // UPDATE STATE
  
  async updateState(
    rideId: string,
    state: AssignmentState
  ): Promise<Assignment | null> {
    try {
      const assignment = await this.get(rideId);
      if (!assignment) return null;

      assignment.state = state;

      await redis.set(this.key(rideId), JSON.stringify(assignment));

      return assignment;
    } catch (err) {
      console.error("Assignment update error:", err);
      return null;
    }
  }
}

export const assignmentStore = new AssignmentStore();