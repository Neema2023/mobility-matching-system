export type AssignmentState =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED";

const TRANSITIONS: Record<AssignmentState, AssignmentState[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: [],
  CANCELLED: [],
};

export class AssignmentStateMachine {
  canTransition(from: AssignmentState, to: AssignmentState): boolean {
    const allowed = TRANSITIONS[from];

    if (!allowed) return false;

    return allowed.includes(to);
  }

  transition(from: AssignmentState, to: AssignmentState): boolean {
    const ok = this.canTransition(from, to);

    if (!ok) {
      console.log(
        `❌ INVALID STATE TRANSITION: ${from} → ${to}`
      );
    } else {
      console.log(
        `🔄 STATE TRANSITION: ${from} → ${to}`
      );
    }

    return ok;
  }
}