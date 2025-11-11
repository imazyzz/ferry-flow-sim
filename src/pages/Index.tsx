import { useState, useEffect, useRef } from "react";
import { Ship } from "lucide-react";
import {
  SimulationState,
  SimulationConfig,
  Terminal,
} from "@/types/simulation";
import {
  createInitialState,
  updateSimulation,
  formatTime,
  DEFAULT_CONFIG,
} from "@/lib/simulationEngine";
import { FerrySlot } from "@/components/FerrySlot";
import { QueueLane } from "@/components/QueueLane";
import { ControlPanel } from "@/components/ControlPanel";
import { ConfigPanel } from "@/components/ConfigPanel";
import { SystemStatusPanel } from "@/components/SystemStatusPanel";
import { AlertBanner } from "@/components/AlertBanner";
import { SummaryDialog, SimulationSummary } from "@/components/SummaryDialog";

const Index = () => {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [state, setState] = useState<SimulationState>(() =>
    createInitialState(DEFAULT_CONFIG)
  );
  const [speed, setSpeed] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const intervalRef = useRef<number>();
  const lastPauseTimeRef = useRef<number>(0);

  const isPeak = () => {
    const hour = config.operationStart + Math.floor(state.time / 60);
    return config.peakHours.some(([start, end]) => hour >= start && hour < end);
  };

  const calculateAvgUtilization = () => {
    if (state.ferries.length === 0) return 0;
    const activeUtilization = state.ferries.reduce((sum, ferry) => {
      if (ferry.state === "maintenance" || ferry.state === "idle") return sum;
      return sum + (ferry.vehicles.length / ferry.capacity) * 100;
    }, 0);
    return activeUtilization / state.ferries.length;
  };

  const calculateAvgWaitTime = () => {
    if (state.vehiclesProcessed === 0) return 0;
    return state.totalWaitTime / state.vehiclesProcessed;
  };

  const getSystemStatus = (): "NORMAL" | "ALERTA" | "COLAPSO" => {
    const queueLength = state.queueSLZ.length + state.queueCUJ.length;
    const avgUtil = calculateAvgUtilization();
    const avgWait = calculateAvgWaitTime();

    if (queueLength > 100 || avgUtil > 90 || avgWait > 90) {
      return "COLAPSO";
    }
    if (queueLength > 50 || avgUtil > 75 || avgWait > 45) {
      return "ALERTA";
    }
    return "NORMAL";
  };

  const generateSummary = (): SimulationSummary => {
    const avgQueueLength =
      state.queueLengthHistory.length > 0
        ? state.queueLengthHistory.reduce((a, b) => a + b, 0) /
          state.queueLengthHistory.length
        : 0;

    return {
      totalTime: state.time,
      avgQueueLength,
      maxQueueLength: state.maxQueueLength,
      avgWaitTime: calculateAvgWaitTime(),
      vehiclesProcessed: state.vehiclesProcessed,
      vehiclesRejected: 0,
      avgUtilization: calculateAvgUtilization(),
      maintenanceEvents: state.maintenanceEvents,
      failureEvents: state.failureEvents,
      peakEvents: state.peakEventCount,
    };
  };

  useEffect(() => {
    if (state.isRunning) {
      // Mantemos o intervalo real fixo e escalamos apenas o tempo lógico (fidedigno)
      intervalRef.current = window.setInterval(() => {
        setState((prev) => updateSimulation(prev, config, 1, speed));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, speed, config]);

  const handlePlayPause = () => {
    if (state.isRunning) {
      // Pausando - mostrar resumo se tempo suficiente passou
      if (state.time - lastPauseTimeRef.current > 60) {
        setShowSummary(true);
      }
      lastPauseTimeRef.current = state.time;
    }
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleReset = () => {
    setState(createInitialState(config));
    lastPauseTimeRef.current = 0;
    setShowSummary(false);
  };

  const handleConfigChange = (newConfig: SimulationConfig) => {
    setConfig(newConfig);
    // Adjust existing ferries to match new config
    setState((prev) => {
      const adjustedFerries = Array.from(
        { length: newConfig.ferryCount },
        (_, i) => {
          const existingFerry = prev.ferries[i];
          if (existingFerry) {
            return {
              ...existingFerry,
              capacity: newConfig.ferryCapacity,
            };
          }
          return {
            id: i,
            state: "idle" as const,
            vehicles: [],
            capacity: newConfig.ferryCapacity,
            departureTime: null,
            maintenanceUntil: null,
            location: (i % 2 === 0 ? "SLZ" : "CUJ") as Terminal,
            direction: null,
          };
        }
      );
      return { ...prev, ferries: adjustedFerries };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Alert Banner */}
      <AlertBanner
        queueLength={state.queueSLZ.length + state.queueCUJ.length}
        avgUtilization={calculateAvgUtilization()}
        avgWaitTime={calculateAvgWaitTime()}
      />

      {/* Summary Dialog */}
      <SummaryDialog
        open={showSummary}
        onClose={() => setShowSummary(false)}
        onRestart={handleReset}
        summary={generateSummary()}
        formatTime={(mins) => formatTime(mins, config)}
      />

      {/* Header */}
      <header className="border-b border-primary/30 bg-background/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Ship className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Simulação de Fila de Ferry
              </h1>
              <p className="text-sm text-muted-foreground">
                São Luís, Brasil — Sistema Interativo
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Simulation Area */}
          <div className="space-y-6">
            {/* Queue */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-2">
                  Fila — São Luís (SLZ)
                </h2>
                <QueueLane queue={state.queueSLZ} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-2">
                  Fila — Cujupe (CUJ)
                </h2>
                <QueueLane queue={state.queueCUJ} />
              </div>
            </div>

            {/* Ferries */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Ship className="w-5 h-5 text-primary" />
                Terminais de Ferry
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {state.ferries.map((ferry) => (
                  <FerrySlot key={ferry.id} ferry={ferry} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Control Panel + Status + Config */}
          <div className="lg:sticky lg:top-6 h-fit space-y-6">
            <ControlPanel
              isRunning={state.isRunning}
              time={formatTime(state.time, config)}
              isPeak={isPeak()}
              speed={speed}
              vehiclesProcessed={state.vehiclesProcessed}
              queueLength={state.queueSLZ.length + state.queueCUJ.length}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
              onSpeedChange={setSpeed}
            />

            <SystemStatusPanel
              queueLength={state.queueSLZ.length + state.queueCUJ.length}
              ferries={state.ferries}
              avgWaitTime={calculateAvgWaitTime()}
              systemStatus={getSystemStatus()}
            />

            <ConfigPanel config={config} onConfigChange={handleConfigChange} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
