// src/modules/drivers/driver.model.ts

export type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export interface Driver {
  id: string;
  name?: string;
  status: DriverStatus;
  createdAt: Date;
  updatedAt: Date;
}