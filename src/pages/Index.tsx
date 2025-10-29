import { useState, useEffect, useRef } from 'react';
import { Ship } from 'lucide-react';
import { SimulationState } from '@/types/simulation';
import { 
  createInitialState, 
  updateSimulation, 
  formatTime, 
  DEFAULT_CONFIG 
} from '@/lib/simulationEngine';
import { FerrySlot } from '@/components/FerrySlot';
import { QueueLane } from '@/components/QueueLane';
import { ControlPanel } from '@/components/ControlPanel';

const Index = () => {
  const [state, setState] = useState<SimulationState>(() => createInitialState(DEFAULT_CONFIG));
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<number>();

  const isPeak = () => {
    const hour = DEFAULT_CONFIG.operationStart + Math.floor(state.time / 60);
    return DEFAULT_CONFIG.peakHours.some(([start, end]) => hour >= start && hour < end);
  };

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = window.setInterval(() => {
        setState(prev => updateSimulation(prev, DEFAULT_CONFIG, speed));
      }, 1000 / speed);
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
  }, [state.isRunning, speed]);

  const handlePlayPause = () => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleReset = () => {
    setState(createInitialState(DEFAULT_CONFIG));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-primary/30 bg-background/50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Ship className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Ferry Queue Simulation
              </h1>
              <p className="text-sm text-muted-foreground">São Luís, Brazil</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Simulation Area */}
          <div className="space-y-6">
            {/* Queue */}
            <QueueLane queue={state.queue} />

            {/* Ferries */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Ship className="w-5 h-5 text-primary" />
                Ferry Terminals
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {state.ferries.map(ferry => (
                  <FerrySlot key={ferry.id} ferry={ferry} />
                ))}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="lg:sticky lg:top-6 h-fit">
            <ControlPanel
              isRunning={state.isRunning}
              time={formatTime(state.time, DEFAULT_CONFIG)}
              isPeak={isPeak()}
              speed={speed}
              vehiclesProcessed={state.vehiclesProcessed}
              queueLength={state.queue.length}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
              onSpeedChange={setSpeed}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
