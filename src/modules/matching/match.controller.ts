import { Request, Response } from "express";
import { matchingService } from "./match.service";

export class MatchController {
  
  // FIND MATCHES
  
  findMatches = (req: Request, res: Response) => {
    const { pickupLat, pickupLng } = req.query;

    const lat = Number(pickupLat);
    const lng = Number(pickupLng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "pickupLat and pickupLng must be valid numbers",
        data: null,
      });
    }

    const result = matchingService.findTopDrivers(lat, lng);

    return res.json({
      success: result.success,
      message: "Top drivers fetched successfully",
      data: result.data ?? [],
      pickup: { lat, lng },
    });
  };


  // RESERVE
  
  reserve = async (req: Request, res: Response) => {
    const { rideId, driverId } = req.body;

    if (!rideId || !driverId) {
      return res.status(400).json({
        success: false,
        message: "rideId and driverId are required",
        data: null,
      });
    }

    const result = await matchingService.reserveDriver(rideId, driverId);

    return res.json({
      success: result.success,
      message: result.message,
      data: result.data ?? null,
    });
  };

  
  // CONFIRM
  
  confirm = async (req: Request, res: Response) => {
    const { rideId, driverId } = req.body;

    if (!rideId || !driverId) {
      return res.status(400).json({
        success: false,
        message: "rideId and driverId are required",
        data: null,
      });
    }

    const result = await matchingService.confirmMatch(rideId, driverId);

    return res.json({
      success: result.success,
      message: result.message,
      data: result.data ?? null,
    });
  };

  
  // CANCEL
  
  cancel = async (req: Request, res: Response) => {
    const { rideId, driverId } = req.body;

    if (!rideId || !driverId) {
      return res.status(400).json({
        success: false,
        message: "rideId and driverId are required",
        data: null,
      });
    }

    const result = await matchingService.cancelMatch(rideId, driverId);

    return res.json({
      success: result.success,
      message: result.message,
      data: result.data ?? null,
    });
  };
}