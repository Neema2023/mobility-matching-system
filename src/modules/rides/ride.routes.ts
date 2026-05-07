// src/modules/rides/ride.routes.ts

import { Router } from 'express';
import { RideController } from './ride.controller';

const router = Router();
const controller = new RideController();

// create ride
router.post('/', controller.createRide);

// list rides
router.get('/', controller.getRides);

export default router;