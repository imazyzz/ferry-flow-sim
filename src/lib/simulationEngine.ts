import {
  SimulationConfig,
  SimulationState,
  Ferry,
  Vehicle,
  FerryState,
  Terminal,
} from "@/types/simulation";

// All time-based values expressed in MINUTES.
// For per-vehicle operations that are given in seconds, we convert to fractional minutes.
// Dataset especificado pelo usuário:
// - 4 ferries
// - capacidade 50 veículos
// - frequência média de saída: 60 min (intercalada) -> usada como referência para cadência mínima
// - operação: 06h às 22h (16h = 960 min)
// - chegadas diárias: 1200 (picos 40% entre 7-9 e 17-19)
// - composição frota: 80% carros, 20% caminhões
// - tempo médio embarque por veículo: 15 min (IMPORTANTE: user forneceu 15 minutos, porém isso é atípico.
//   Assumiremos que quis dizer 15 segundos; se realmente fossem 15 minutos não haveria fluxo suficiente.
//   Mantemos conversão para 15 segundos = 0.25 min. Caso deseje 15 minutos, ajustar para 15.)
// - travessia: 1h20 = 80 min
// - tempo médio desembarque por veículo: 15 segundos = 0.25 min
// - espera fila normal: 20 min (usado apenas para métricas, não diretamente aqui)
// - espera fila pico: 90 min (idem)
// Observação: departureFrequency permanece para possíveis extensões, não usada diretamente na lógica atual.
export const DEFAULT_CONFIG: SimulationConfig = {
  ferryCount: 4,
  ferryCapacity: 50,
  departureFrequency: 60,
  operationStart: 6,
  operationEnd: 22,
  dailyArrivals: 1200,
  peakHours: [
    [7, 9],
    [17, 19],
  ],
  peakPercentage: 0.4,
  carPercentage: 0.8,
  embarkTimePerVehicle: 0.25, // 15 segundos (~0.25 min)
  crossingTime: 80, // 1h20
  disembarkTimePerVehicle: 0.25, // 15 segundos (~0.25 min)
  maintenanceInterval: 30,
  maintenanceDuration: 4 * 60, // 4 horas em minutos
  downtimeProbability: 0.05,
  minDepartureFillRatio: 1.0,
};

export function createInitialState(config: SimulationConfig): SimulationState {
  const ferries: Ferry[] = Array.from(
    { length: config.ferryCount },
    (_, i) => ({
      id: i,
      state: "idle" as FerryState,
      vehicles: [],
      capacity: config.ferryCapacity,
      departureTime: null,
      maintenanceUntil: null,
      location: (i % 2 === 0 ? "SLZ" : "CUJ") as Terminal, // intercalada nas bases
      direction: null,
    })
  );

  return {
    time: 0,
    ferries,
    queueSLZ: [],
    queueCUJ: [],
    isRunning: false,
    vehiclesProcessed: 0,
    totalWaitTime: 0,
    queueLengthHistory: [],
    maxQueueLength: 0,
    maintenanceEvents: 0,
    failureEvents: 0,
    peakEventCount: 0,
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
  const peakMinutes = config.peakHours.reduce(
    (sum, [start, end]) => sum + (end - start) * 60,
    0
  );
  const normalMinutes = operationMinutes - peakMinutes;

  const peakVehicles = config.dailyArrivals * config.peakPercentage;
  const normalVehicles = config.dailyArrivals * (1 - config.peakPercentage);

  const peakRate = peakVehicles / peakMinutes; // vehicles per minute
  const normalRate = normalVehicles / normalMinutes;

  return isPeakHour(time, config) ? peakRate : normalRate;
}

function generateVehicle(
  time: number,
  config: SimulationConfig,
  origin: Terminal
): Vehicle {
  return {
    id: `v-${time}-${Math.random().toString(36).substr(2, 9)}`,
    type: Math.random() < config.carPercentage ? "car" : "truck",
    arrivalTime: time,
    origin,
  };
}

function shouldScheduleMaintenance(
  ferry: Ferry,
  time: number,
  config: SimulationConfig
): boolean {
  if (ferry.maintenanceUntil && time < ferry.maintenanceUntil) return false;

  // Simplified: check if it's been ~8 hours of operation (schedule maintenance at night)
  const hour = getCurrentHour(time, config);
  return hour >= 20 && Math.random() < 0.01; // 1% chance per tick after 8pm
}

export function updateSimulation(
  state: SimulationState,
  config: SimulationConfig,
  deltaMinutes: number = 1,
  timeScale: number = 1 // permite acelerar o relógio lógico (1x,2x,5x,10x)
): SimulationState {
  if (!state.isRunning) return state;
  // timeScale aplica-se ao avanço do tempo lógico sem alterar granularidade de processos
  // Isso mantém fidelidade dos tempos relativos independentemente da velocidade de execução.
  const scaledDelta = deltaMinutes * timeScale;
  const newTime = state.time + scaledDelta;
  const hour = getCurrentHour(newTime, config);

  // Stop if outside operation hours
  if (hour >= config.operationEnd) {
    return { ...state, isRunning: false };
  }

  const newState = { ...state, time: newTime };

  // Track metrics
  const totalQueueLen = state.queueSLZ.length + state.queueCUJ.length;
  newState.queueLengthHistory = [...state.queueLengthHistory, totalQueueLen];
  newState.maxQueueLength = Math.max(state.maxQueueLength, totalQueueLen);

  // Track peak events
  if (isPeakHour(newTime, config) && !isPeakHour(state.time, config)) {
    newState.peakEventCount = state.peakEventCount + 1;
  }

  // Generate new arrivals
  const arrivalRate = calculateArrivalRate(newTime, config);
  const expectedArrivals = arrivalRate * scaledDelta; // total do sistema
  const arrivalsThisTick = Math.floor(expectedArrivals + Math.random());
  for (let i = 0; i < arrivalsThisTick; i++) {
    const toSLZ = Math.random() < 0.5; // chegada na base de origem: SLZ ou CUJ
    if (toSLZ) {
      newState.queueSLZ = [
        ...newState.queueSLZ,
        generateVehicle(newTime, config, "SLZ"),
      ];
    } else {
      newState.queueCUJ = [
        ...newState.queueCUJ,
        generateVehicle(newTime, config, "CUJ"),
      ];
    }
  }

  // Update ferries
  newState.ferries = state.ferries.map((ferry) => {
    const updatedFerry = { ...ferry };

    // Check for maintenance
    if (shouldScheduleMaintenance(ferry, newTime, config)) {
      updatedFerry.state = "maintenance";
      updatedFerry.maintenanceUntil = newTime + config.maintenanceDuration;
      updatedFerry.departureTime = null;
      updatedFerry.vehicles = [];
      newState.maintenanceEvents = state.maintenanceEvents + 1;
      return updatedFerry;
    }

    // Resume from maintenance
    if (ferry.maintenanceUntil && newTime >= ferry.maintenanceUntil) {
      updatedFerry.state = "idle";
      updatedFerry.maintenanceUntil = null;
    }

    // Handle states
    switch (ferry.state) {
      case "idle":
        // Start loading if queue has vehicles at current location
        if (updatedFerry.location === "SLZ") {
          if (newState.queueSLZ.length > 0) updatedFerry.state = "loading";
        } else if (updatedFerry.location === "CUJ") {
          if (newState.queueCUJ.length > 0) updatedFerry.state = "loading";
        }
        break;

      case "loading":
        // Load vehicles from the current terminal queue
        const currentQueue =
          updatedFerry.location === "SLZ"
            ? newState.queueSLZ
            : newState.queueCUJ;
        const loadCapacity = Math.min(
          config.ferryCapacity - updatedFerry.vehicles.length,
          currentQueue.length,
          Math.floor(scaledDelta / config.embarkTimePerVehicle) || 1
        );

        if (loadCapacity > 0) {
          const vehiclesToLoad = currentQueue.slice(0, loadCapacity);
          updatedFerry.vehicles = [...updatedFerry.vehicles, ...vehiclesToLoad];
          if (updatedFerry.location === "SLZ") {
            newState.queueSLZ = currentQueue.slice(loadCapacity);
          } else {
            newState.queueCUJ = currentQueue.slice(loadCapacity);
          }

          // Calculate wait time
          vehiclesToLoad.forEach((v) => {
            newState.totalWaitTime += newTime - v.arrivalTime;
          });
        }

        // Depart rule: require minimum fill ratio (default 100%).
        // Não parte com fila vazia se não estiver cheio.
        const ratio = config.minDepartureFillRatio ?? 1.0;
        const minCapacity = Math.ceil(ratio * config.ferryCapacity);
        if (updatedFerry.vehicles.length >= minCapacity) {
          updatedFerry.state = "crossing";
          updatedFerry.direction =
            updatedFerry.location === "SLZ" ? "SLZ_TO_CUJ" : "CUJ_TO_SLZ";
          updatedFerry.departureTime = newTime + config.crossingTime; // chegada prevista
          updatedFerry.location = null; // em travessia
        }
        break;

      case "crossing":
        if (
          updatedFerry.departureTime &&
          newTime >= updatedFerry.departureTime
        ) {
          updatedFerry.state = "unloading";
          // ao chegar, define localização de destino
          updatedFerry.location =
            updatedFerry.direction === "SLZ_TO_CUJ" ? "CUJ" : "SLZ";
        }
        break;

      case "unloading":
        // Unload vehicles gradually
        const unloadCapacity =
          Math.floor(scaledDelta / config.disembarkTimePerVehicle) || 1;
        const vehiclesToUnload = Math.min(
          unloadCapacity,
          updatedFerry.vehicles.length
        );

        if (vehiclesToUnload > 0) {
          newState.vehiclesProcessed += vehiclesToUnload;
          updatedFerry.vehicles = updatedFerry.vehicles.slice(vehiclesToUnload);
        }

        // Return to idle when all vehicles unloaded
        if (updatedFerry.vehicles.length === 0) {
          updatedFerry.state = "idle";
          updatedFerry.departureTime = null;
          updatedFerry.direction = null;
        }
        break;

      case "maintenance":
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
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}
