import { AlertTriangle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertBannerProps {
  queueLength: number;
  avgUtilization: number;
  avgWaitTime: number;
}

export function AlertBanner({ queueLength, avgUtilization, avgWaitTime }: AlertBannerProps) {
  const isCriticalQueue = queueLength > 100;
  const isHighUtilization = avgUtilization > 90;
  const isHighWaitTime = avgWaitTime > 90; // 1h30 in minutes

  const showAlert = isCriticalQueue || isHighUtilization || isHighWaitTime;

  return (
    <AnimatePresence>
      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full mx-4"
        >
          <div className="bg-destructive/95 backdrop-blur-lg border-2 border-destructive text-destructive-foreground rounded-lg p-4 shadow-2xl animate-pulse">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-bold text-lg">⚠️ SISTEMA EM COLAPSO</p>
                <div className="space-y-1 text-sm">
                  {isCriticalQueue && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <p>FILA CRÍTICA: {queueLength} veículos aguardando</p>
                    </div>
                  )}
                  {isHighUtilization && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <p>ESTRANGULAMENTO: Utilização média de {avgUtilization.toFixed(0)}%</p>
                    </div>
                  )}
                  {isHighWaitTime && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <p>ATRASO EXTREMO: Tempo médio de espera {avgWaitTime.toFixed(0)} minutos</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
