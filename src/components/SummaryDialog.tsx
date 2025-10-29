import { 
  BarChart3, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface SimulationSummary {
  totalTime: number;
  avgQueueLength: number;
  maxQueueLength: number;
  avgWaitTime: number;
  vehiclesProcessed: number;
  vehiclesRejected: number;
  avgUtilization: number;
  maintenanceEvents: number;
  failureEvents: number;
  peakEvents: number;
}

interface SummaryDialogProps {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
  summary: SimulationSummary;
  formatTime: (minutes: number) => string;
}

export function SummaryDialog({ 
  open, 
  onClose, 
  onRestart, 
  summary,
  formatTime 
}: SummaryDialogProps) {
  const getSystemEvaluation = () => {
    if (summary.maxQueueLength > 150 || summary.avgUtilization > 90) {
      return {
        status: 'CRÍTICO',
        icon: AlertTriangle,
        color: 'text-destructive',
        message: 'Sistema operou em colapso durante a simulação. Recomenda-se aumentar capacidade ou reduzir tempos de processamento.'
      };
    }
    if (summary.maxQueueLength > 80 || summary.avgUtilization > 75) {
      return {
        status: 'ATENÇÃO',
        icon: AlertTriangle,
        color: 'text-warning',
        message: 'Sistema operou próximo ao limite. Considere ajustes para evitar saturação em picos.'
      };
    }
    return {
      status: 'SAUDÁVEL',
      icon: CheckCircle2,
      color: 'text-success',
      message: 'Sistema operou dentro dos parâmetros adequados. Performance satisfatória.'
    };
  };

  const evaluation = getSystemEvaluation();
  const EvaluationIcon = evaluation.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="w-6 h-6 text-primary" />
            Resumo da Execução
          </DialogTitle>
          <DialogDescription>
            Análise completa da simulação executada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* System Evaluation */}
          <div className={`p-4 rounded-lg border-2 ${
            evaluation.status === 'CRÍTICO' ? 'bg-destructive/10 border-destructive' :
            evaluation.status === 'ATENÇÃO' ? 'bg-warning/10 border-warning' :
            'bg-success/10 border-success'
          }`}>
            <div className="flex items-start gap-3">
              <EvaluationIcon className={`w-6 h-6 shrink-0 mt-0.5 ${evaluation.color}`} />
              <div className="space-y-1">
                <p className={`font-bold text-lg ${evaluation.color}`}>
                  Sistema: {evaluation.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  {evaluation.message}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Tempo Total</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatTime(summary.totalTime)}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Veículos Atendidos</span>
              </div>
              <p className="text-2xl font-bold text-success">
                {summary.vehiclesProcessed}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium">Fila Média / Máx</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {summary.avgQueueLength.toFixed(0)} / {summary.maxQueueLength}
              </p>
            </div>

            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Utilização Média</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {summary.avgUtilization.toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Wait Time Analysis */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-semibold text-foreground">Análise de Tempo de Espera</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {summary.avgWaitTime.toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground">minutos em média</span>
            </div>
            {summary.avgWaitTime > 90 && (
              <p className="text-xs text-destructive">
                ⚠️ Tempo de espera acima do aceitável (meta: &lt;30 min)
              </p>
            )}
          </div>

          {/* Events Summary */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Eventos Relevantes</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold text-warning">{summary.maintenanceEvents}</p>
                <p className="text-xs text-muted-foreground">Manutenções</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold text-destructive">{summary.failureEvents}</p>
                <p className="text-xs text-muted-foreground">Falhas</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold text-primary">{summary.peakEvents}</p>
                <p className="text-xs text-muted-foreground">Picos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onRestart}
            className="flex-1 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar Simulação
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
          >
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
