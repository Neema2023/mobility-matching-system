import { assignmentService } from '../../modules/assignments/assignment.service';

describe('Ride Flow', () => {

  it('should reserve and confirm ride', async () => {

    const reserve = await assignmentService.reserve('rideX', 'driverX');
    expect(reserve.success).toBe(true);

    const confirm = await assignmentService.confirm('rideX', 'driverX');
    expect(confirm.success).toBe(true);

  });

});