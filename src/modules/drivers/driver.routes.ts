import { Router } from 'express';
import { DriverController } from './driver.controller';

const router = Router();
const controller = new DriverController();

// POST /drivers/location
router.post('/location', controller.updateLocation.bind(controller));

export default router;