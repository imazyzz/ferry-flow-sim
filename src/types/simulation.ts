export type VehicleType = "car" | "truck";
export type Terminal = "SLZ" | "CUJ";
export type RouteDirection = "SLZ_TO_CUJ" | "CUJ_TO_SLZ";

export type FerryState =
  | "idle"
  | "loading"
  | "crossing"
  | "unloading"
  | "maintenance";

export interface Vehicle {
  id: string;
  type: VehicleType;
  arrivalTime: number;
  origin: Terminal;
}

export interface Ferry {
  id: number;
  state: FerryState;
  vehicles: Vehicle[];
  capacity: number;
  departureTime: number | null;
  maintenanceUntil: number | null;
  location: Terminal | null; // null quando em travessia
  direction: RouteDirection | null; // somente durante 'crossing'
}

export interface SimulationState {
  time: number; // minutes since 6:00
  ferries: Ferry[];
  queueSLZ: Vehicle[];
  queueCUJ: Vehicle[];
  isRunning: boolean;
  vehiclesProcessed: number;
  totalWaitTime: number;
  // Metrics for V3
  queueLengthHistory: number[];
  maxQueueLength: number;
  maintenanceEvents: number;
  failureEvents: number;
  peakEventCount: number;
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
  minDepartureFillRatio?: number; // 0..1, exige esta ocupação mínima antes de partir (default 1.0)
}
