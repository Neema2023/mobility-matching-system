import express from 'express';

import driverRoutes from './modules/drivers/driver.routes';
import rideRoutes from './modules/rides/ride.routes';
import matchRoutes from './modules/matching/match.routes';

const app = express();

app.use(express.json());

app.use((req, _res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// HEALTH
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'mobility-matching-system',
    timestamp: new Date().toISOString(),
  });
});

// ROUTES
app.use('/drivers', driverRoutes);
app.use('/rides', rideRoutes);
app.use('/match', matchRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.url,
  });
});

export default app;