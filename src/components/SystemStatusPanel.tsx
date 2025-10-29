import { Activity, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ferry } from '@/types/simulation';
import { Progress } from '@/components/ui/progress';

interface SystemStatusPanelProps {
  queueLength: number;
  ferries: Ferry[];
  avgWaitTime: number;
  systemStatus: 'NORMAL' | 'ALERTA' | 'COLAPSO';
}

export function SystemStatusPanel({
  queueLength,
  ferries,
  avgWaitTime,
  systemStatus,
}: SystemStatusPanelProps) {
  const getStatusColor = () => {
    switch (systemStatus) {
      case 'NORMAL':
        return 'bg-success text-success-foreground';
      case 'ALERTA':
        return 'bg-warning text-warning-foreground';
      case 'COLAPSO':
        return 'bg-destructive text-destructive-foreground';
    }
  };

  const getStatusMessage = () => {
    if (systemStatus === 'COLAPSO') {
      const maintenanceFerries = ferries.filter(f => f.state === 'maintenance');
      if (maintenanceFerries.length > 0) {
        return `Manutenção ativa em ${maintenanceFerries.length} ferry(s) — capacidade reduzida`;
      }
      return 'Sistema operando acima da capacidade — gargalo crítico detectado';
    }
    if (systemStatus === 'ALERTA') {
      return 'Demanda elevada — monitorar operação de perto';
    }
    return 'Sistema operando dentro dos parâmetros normais';
  };

  const calculateUtilization = (ferry: Ferry) => {
    if (ferry.state === 'maintenance') return 0;
    if (ferry.state === 'idle') return 0;
    return (ferry.vehicles.length / ferry.capacity) * 100;
  };

  const avgUtilization = ferries.length > 0
    ? ferries.reduce((sum, f) => sum + calculateUtilization(f), 0) / ferries.length
    : 0;

  return (
    <Card className="p-4 space-y-4 bg-card border-2 border-primary/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Telemetria ao Vivo</h3>
        </div>
        <Badge className={getStatusColor()}>
          {systemStatus}
        </Badge>
      </div>

      {/* System Message */}
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {getStatusMessage()}
        </p>
      </div>

      {/* Real-time Metrics */}
      <div className="space-y-3">
        {/* Queue Status */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Fila Atual</span>
            <span className="font-bold text-foreground">{queueLength}</span>
          </div>
          <Progress 
            value={Math.min((queueLength / 150) * 100, 100)} 
            className="h-2"
          />
        </div>

        {/* Average Utilization */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Utilização Média
            </span>
            <span className="font-bold text-foreground">{avgUtilization.toFixed(0)}%</span>
          </div>
          <Progress 
            value={avgUtilization} 
            className="h-2"
          />
        </div>

        {/* Average Wait Time */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Tempo Médio de Espera
            </span>
            <span className="font-bold text-foreground">{avgWaitTime.toFixed(0)} min</span>
          </div>
          <Progress 
            value={Math.min((avgWaitTime / 120) * 100, 100)} 
            className="h-2"
          />
        </div>

        {/* Individual Ferry Status */}
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground">Status por Ferry</p>
          {ferries.map((ferry) => {
            const utilization = calculateUtilization(ferry);
            const stateLabel = {
              idle: 'Ocioso',
              loading: 'Embarcando',
              crossing: 'Travessia',
              unloading: 'Desembarcando',
              maintenance: 'Manutenção',
            }[ferry.state];

            return (
              <div key={ferry.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ferry {ferry.id + 1}</span>
                  <span className="text-foreground font-medium">{stateLabel}</span>
                </div>
                <Progress 
                  value={utilization} 
                  className="h-1.5"
                />
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
