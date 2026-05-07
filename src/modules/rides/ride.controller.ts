// src/modules/rides/ride.controller.ts

import { Request, Response } from 'express';
import { RideService } from './ride.service';

const service = new RideService();

export class RideController {
  async createRide(req: Request, res: Response) {
    try {
      const {
        passengerId,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
      } = req.body;

      if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
        return res.status(400).json({
          message: 'Missing required fields',
        });
      }

      const ride = await service.createRide({
        passengerId,
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng,
      });

      return res.status(201).json({
        message: 'Ride created',
        data: ride,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  }

  async getRides(_req: Request, res: Response) {
    const rides = await service.getAllRides();

    return res.status(200).json({
      data: rides,
    });
  }
}