export type VehicleType = 'car' | 'truck';

export type FerryState = 
  | 'idle'
  | 'loading'
  | 'crossing'
  | 'unloading'
  | 'maintenance';

export interface Vehicle {
  id: string;
  type: VehicleType;
  arrivalTime: number;
}

export interface Ferry {
  id: number;
  state: FerryState;
  vehicles: Vehicle[];
  capacity: number;
  departureTime: number | null;
  maintenanceUntil: number | null;
}

export interface SimulationState {
  time: number; // minutes since 6:00
  ferries: Ferry[];
  queue: Vehicle[];
  isRunning: boolean;
  vehiclesProcessed: number;
  totalWaitTime: number;
}

export interface SimulationConfig {
  ferryCount: number;
  ferryCapacity: number;
  departureFrequency: number; // minutes
  operationStart: number; // hour
  operationEnd: number; // hour
  dailyArrivals: number;
  peakHours: [number, number][]; // [start, end] hours
  peakPercentage: number; // percentage of daily arrivals
  carPercentage: number;
  embarkTimePerVehicle: number; // minutes
  crossingTime: number; // minutes
  disembarkTimePerVehicle: number; // minutes
  maintenanceInterval: number; // days
  maintenanceDuration: number; // hours
  downtimeProbability: number; // percentage
}
