export interface DriverScoreInput {
  distance: number; // km
  isAvailable: boolean;
  isEnRoute?: boolean;
}

export class ScoringService {
  calculate(input: DriverScoreInput): number {
    let score = 0;

    // 1. Distance (most important)
    score += input.distance * 1.0;

    // 2. Availability bonus
    if (!input.isAvailable) {
      score += 1000; // penalize heavily
    }

    // 3. En-route slight penalty (optional feature)
    if (input.isEnRoute) {
      score += 0.5;
    }

    return score; // LOWER is better
  }
}