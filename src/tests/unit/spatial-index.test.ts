import { spatialIndex } from '../../modules/matching/spatial-index';

describe('Spatial Index', () => {
  beforeEach(() => {
    (spatialIndex as any).grid.clear();
    (spatialIndex as any).driverLocations.clear();
  });

  it('should add driver', () => {
    spatialIndex.addDriver('A', -1.945, 30.061);

    const nearby = spatialIndex.getNearbyDrivers(-1.945, 30.061);

    expect(nearby).toContain('A');
  });

  it('should update driver location', () => {
    spatialIndex.addDriver('A', -1.945, 30.061);
    spatialIndex.addDriver('A', -1.944, 30.062);

    const loc = spatialIndex.getDriverLocation('A');

    expect(loc?.lat).toBe(-1.944);
  });
});