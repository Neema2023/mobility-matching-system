// =========================
// TYPES
// =========================
export type DriverLocation = {
  driverId: string;
  lat: number;
  lng: number;
};

// =========================
// CONFIGURATION
// =========================
// ~0.01 degree ≈ 1.1km (good for Kigali scale)
const GRID_SIZE = 0.01;

// =========================
// SPATIAL INDEX
// =========================
export class SpatialIndex {
  // gridKey -> set of driverIds
  private grid = new Map<string, Set<string>>();

  // driverId -> last known location
  private driverLocations = new Map<string, DriverLocation>();

  // =========================
  // GRID KEY GENERATOR
  // =========================
  private getGridKey(lat: number, lng: number): string {
    const latKey = Math.floor(lat / GRID_SIZE);
    const lngKey = Math.floor(lng / GRID_SIZE);
    return `${latKey}:${lngKey}`;
  }

  // =========================
  // ADD / UPDATE DRIVER LOCATION
  // =========================
  addDriver(driverId: string, lat: number, lng: number): void {
    const newKey = this.getGridKey(lat, lng);

    // 🔄 remove old position if exists
    const oldLocation = this.driverLocations.get(driverId);
    if (oldLocation) {
      const oldKey = this.getGridKey(oldLocation.lat, oldLocation.lng);
      const oldSet = this.grid.get(oldKey);

      if (oldSet) {
        oldSet.delete(driverId);

        // 🧹 cleanup empty buckets
        if (oldSet.size === 0) {
          this.grid.delete(oldKey);
        }
      }
    }

    // 💾 store new location
    this.driverLocations.set(driverId, { driverId, lat, lng });

    // ➕ add to new grid bucket
    if (!this.grid.has(newKey)) {
      this.grid.set(newKey, new Set());
    }

    this.grid.get(newKey)!.add(driverId);
  }

  // =========================
  // GET NEARBY DRIVERS (COARSE FILTER)
  // =========================
  getNearbyDrivers(lat: number, lng: number): string[] {
    const centerKey = this.getGridKey(lat, lng);
    const [latKey, lngKey] = centerKey.split(':').map(Number);

    // 3x3 grid neighbors
    const neighbors = [
      `${latKey}:${lngKey}`,
      `${latKey + 1}:${lngKey}`,
      `${latKey - 1}:${lngKey}`,
      `${latKey}:${lngKey + 1}`,
      `${latKey}:${lngKey - 1}`,
      `${latKey + 1}:${lngKey + 1}`,
      `${latKey + 1}:${lngKey - 1}`,
      `${latKey - 1}:${lngKey + 1}`,
      `${latKey - 1}:${lngKey - 1}`,
    ];

    const result = new Set<string>();

    for (const key of neighbors) {
      const drivers = this.grid.get(key);
      if (!drivers) continue;

      for (const driverId of drivers) {
        result.add(driverId);
      }
    }

    return Array.from(result);
  }

  // =========================
  // GET SINGLE DRIVER LOCATION
  // =========================
  getDriverLocation(driverId: string): DriverLocation | undefined {
    return this.driverLocations.get(driverId);
  }

  // =========================
  // DEBUG / OBSERVABILITY
  // =========================
  debugGrid() {
    return {
      totalBuckets: this.grid.size,
      totalDrivers: this.driverLocations.size,
    };
  }
}

// =========================
// SINGLETON EXPORT
// =========================
export const spatialIndex = new SpatialIndex();