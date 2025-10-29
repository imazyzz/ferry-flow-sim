import { Play, Pause, RotateCcw, Gauge, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ControlPanelProps {
  isRunning: boolean;
  time: string;
  isPeak: boolean;
  speed: number;
  vehiclesProcessed: number;
  queueLength: number;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function ControlPanel({
  isRunning,
  time,
  isPeak,
  speed,
  vehiclesProcessed,
  queueLength,
  onPlayPause,
  onReset,
  onSpeedChange,
}: ControlPanelProps) {
  return (
    <div className="bg-card border-2 border-primary/30 rounded-lg p-6 space-y-4">
      {/* Time Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-primary" />
          <div>
            <div className="text-3xl font-bold font-mono text-foreground">
              {time}
            </div>
            <div className="text-xs text-muted-foreground">Tempo Atual</div>
          </div>
        </div>

        {isPeak && (
          <Badge variant="destructive" className="animate-pulse">
            Horário de Pico
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-primary">{queueLength}</div>
          <div className="text-xs text-muted-foreground">Na Fila</div>
        </div>
        <div className="bg-background/50 rounded-lg p-3">
          <div className="text-2xl font-bold text-success">
            {vehiclesProcessed}
          </div>
          <div className="text-xs text-muted-foreground">Processados</div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            onClick={onPlayPause}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Reproduzir
              </>
            )}
          </Button>

          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="border-primary/50 hover:bg-primary/10"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="w-4 h-4" />
            <span>Velocidade: {speed}x</span>
          </div>
          <div className="flex gap-2">
            {[0.5, 1, 2, 5].map((s) => (
              <Button
                key={s}
                onClick={() => onSpeedChange(s)}
                variant={speed === s ? "default" : "outline"}
                size="sm"
                className="flex-1"
              >
                {s}x
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
