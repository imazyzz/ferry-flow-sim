import { SimulationConfig, SimulationState, Ferry, Vehicle, FerryState } from '@/types/simulation';

export const DEFAULT_CONFIG: SimulationConfig = {
  ferryCount: 4,
  ferryCapacity: 50,
  departureFrequency: 60,
  operationStart: 6,
  operationEnd: 22,
  dailyArrivals: 1200,
  peakHours: [[7, 9], [17, 19]],
  peakPercentage: 0.4,
  carPercentage: 0.8,
  embarkTimePerVehicle: 0.25, // 15 seconds
  crossingTime: 80, // 1h20
  disembarkTimePerVehicle: 0.25, // 15 seconds
  maintenanceInterval: 30,
  maintenanceDuration: 4 * 60, // 4 hours in minutes
  downtimeProbability: 0.05,
};

export function createInitialState(config: SimulationConfig): SimulationState {
  const ferries: Ferry[] = Array.from({ length: config.ferryCount }, (_, i) => ({
    id: i,
    state: 'idle' as FerryState,
    vehicles: [],
    capacity: config.ferryCapacity,
    departureTime: null,
    maintenanceUntil: null,
  }));

  return {
    time: 0,
    ferries,
    queue: [],
    isRunning: false,
    vehiclesProcessed: 0,
    totalWaitTime: 0,
  };
}

function getCurrentHour(time: number, config: SimulationConfig): number {
  return config.operationStart + Math.floor(time / 60);
}

function isPeakHour(time: number, config: SimulationConfig): boolean {
  const hour = getCurrentHour(time, config);
  return config.peakHours.some(([start, end]) => hour >= start && hour < end);
}

function calculateArrivalRate(time: number, config: SimulationConfig): number {
  const operationMinutes = (config.operationEnd - config.operationStart) * 60;
  const peakMinutes = config.peakHours.reduce((sum, [start, end]) => sum + (end - start) * 60, 0);
  const normalMinutes = operationMinutes - peakMinutes;
  
  const peakVehicles = config.dailyArrivals * config.peakPercentage;
  const normalVehicles = config.dailyArrivals * (1 - config.peakPercentage);
  
  const peakRate = peakVehicles / peakMinutes; // vehicles per minute
  const normalRate = normalVehicles / normalMinutes;
  
  return isPeakHour(time, config) ? peakRate : normalRate;
}

function generateVehicle(time: number, config: SimulationConfig): Vehicle {
  return {
    id: `v-${time}-${Math.random().toString(36).substr(2, 9)}`,
    type: Math.random() < config.carPercentage ? 'car' : 'truck',
    arrivalTime: time,
  };
}

function shouldScheduleMaintenance(ferry: Ferry, time: number, config: SimulationConfig): boolean {
  if (ferry.maintenanceUntil && time < ferry.maintenanceUntil) return false;
  
  // Simplified: check if it's been ~8 hours of operation (schedule maintenance at night)
  const hour = getCurrentHour(time, config);
  return hour >= 20 && Math.random() < 0.01; // 1% chance per tick after 8pm
}

export function updateSimulation(
  state: SimulationState,
  config: SimulationConfig,
  deltaMinutes: number = 1
): SimulationState {
  if (!state.isRunning) return state;

  const newTime = state.time + deltaMinutes;
  const hour = getCurrentHour(newTime, config);
  
  // Stop if outside operation hours
  if (hour >= config.operationEnd) {
    return { ...state, isRunning: false };
  }

  const newState = { ...state, time: newTime };

  // Generate new arrivals
  const arrivalRate = calculateArrivalRate(newTime, config);
  const arrivalsThisTick = Math.random() < arrivalRate ? 1 : 0;
  
  if (arrivalsThisTick > 0) {
    newState.queue = [...newState.queue, generateVehicle(newTime, config)];
  }

  // Update ferries
  newState.ferries = state.ferries.map(ferry => {
    const updatedFerry = { ...ferry };

    // Check for maintenance
    if (shouldScheduleMaintenance(ferry, newTime, config)) {
      updatedFerry.state = 'maintenance';
      updatedFerry.maintenanceUntil = newTime + config.maintenanceDuration;
      updatedFerry.departureTime = null;
      updatedFerry.vehicles = [];
      return updatedFerry;
    }

    // Resume from maintenance
    if (ferry.maintenanceUntil && newTime >= ferry.maintenanceUntil) {
      updatedFerry.state = 'idle';
      updatedFerry.maintenanceUntil = null;
    }

    // Handle states
    switch (ferry.state) {
      case 'idle':
        // Start loading if queue has vehicles
        if (newState.queue.length > 0) {
          updatedFerry.state = 'loading';
        }
        break;

      case 'loading':
        // Load vehicles
        const loadCapacity = Math.min(
          config.ferryCapacity - updatedFerry.vehicles.length,
          newState.queue.length,
          Math.floor(deltaMinutes / config.embarkTimePerVehicle) || 1
        );

        if (loadCapacity > 0) {
          const vehiclesToLoad = newState.queue.slice(0, loadCapacity);
          updatedFerry.vehicles = [...updatedFerry.vehicles, ...vehiclesToLoad];
          newState.queue = newState.queue.slice(loadCapacity);
          
          // Calculate wait time
          vehiclesToLoad.forEach(v => {
            newState.totalWaitTime += newTime - v.arrivalTime;
          });
        }

        // Depart if full or scheduled
        if (
          updatedFerry.vehicles.length >= config.ferryCapacity ||
          (updatedFerry.vehicles.length > 0 && newState.queue.length === 0)
        ) {
          updatedFerry.state = 'crossing';
          updatedFerry.departureTime = newTime + config.crossingTime;
        }
        break;

      case 'crossing':
        if (updatedFerry.departureTime && newTime >= updatedFerry.departureTime) {
          updatedFerry.state = 'unloading';
        }
        break;

      case 'unloading':
        // Unload and return to idle
        newState.vehiclesProcessed += updatedFerry.vehicles.length;
        updatedFerry.vehicles = [];
        updatedFerry.state = 'idle';
        updatedFerry.departureTime = null;
        break;

      case 'maintenance':
        // Handled above
        break;
    }

    return updatedFerry;
  });

  return newState;
}

export function formatTime(minutes: number, config: SimulationConfig): string {
  const totalMinutes = config.operationStart * 60 + minutes;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = Math.floor(totalMinutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
