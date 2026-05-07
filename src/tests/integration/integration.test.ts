import { matchingService } from '../../modules/matching/match.service';

describe('Integration basic flow', () => {

  it('should find available drivers', () => {

    matchingService.upsertDriver({
      driverId: 'I1',
      lat: -1.94,
      lng: 30.06,
      status: 'AVAILABLE',
    });

    const result = matchingService.findTopDrivers(-1.94, 30.06);

    expect(result.success).toBe(true);

    //  safe guard (fixes TS error)
    expect(result.data?.length ?? 0).toBeGreaterThan(0);

  });

});