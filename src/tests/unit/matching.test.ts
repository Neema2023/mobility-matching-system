import { matchingService } from '../../modules/matching/match.service';

describe('Matching Service', () => {

  it('should upsert driver correctly', () => {
    const result = matchingService.upsertDriver({
      driverId: 'A1',
      lat: -1.95,
      lng: 30.06,
      status: 'AVAILABLE',
    });

    expect(result.success).toBe(true);
    expect(result.data!.driverId).toBe('A1'); 
  });

  it('should return top drivers', () => {
    matchingService.upsertDriver({
      driverId: 'B1',
      lat: -1.945,
      lng: 30.061,
      status: 'AVAILABLE',
    });

    const result = matchingService.findTopDrivers(-1.945, 30.061);

    expect(result.success).toBe(true);
    expect(result.data!.length).toBeGreaterThan(0); // FIX HERE
  });

});