import { Request, Response } from 'express';
import { DriverService } from './driver.service';

const service = new DriverService();

export class DriverController {
  async updateLocation(req: Request, res: Response) {
    try {
      const { driverId, lat, lng, status } = req.body;

      if (!driverId || lat == null || lng == null) {
        return res.status(400).json({
          message: 'driverId, lat, lng are required',
        });
      }

      const result = await service.updateLocation({
        driverId,
        lat,
        lng,
        status: status || 'AVAILABLE',
      });

      return res.status(200).json({
        message: 'Location updated successfully',
        data: result,
      });

    } catch (error) {
      console.error('Driver update error:', error);

      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  }
}