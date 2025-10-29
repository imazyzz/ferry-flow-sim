import { motion, AnimatePresence } from "framer-motion";
import { Vehicle } from "@/types/simulation";
import { VehicleChip } from "./VehicleChip";
import { ArrowRight } from "lucide-react";

interface QueueLaneProps {
  queue: Vehicle[];
}

export function QueueLane({ queue }: QueueLaneProps) {
  const displayQueue = queue.slice(0, 20);

  return (
    <div className="w-full border-2 border-primary/30 rounded-lg bg-card/50 backdrop-blur-sm p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <span className="font-bold text-foreground">Fila</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {queue.length} veículos aguardando
        </span>
        <ArrowRight className="w-4 h-4 text-primary ml-auto" />
      </div>

      <div className="flex flex-wrap gap-2 min-h-[80px]">
        <AnimatePresence mode="popLayout">
          {displayQueue.map((vehicle, idx) => (
            <VehicleChip key={vehicle.id} vehicle={vehicle} index={idx} />
          ))}
        </AnimatePresence>

        {queue.length > 20 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-2 rounded-md bg-primary/10 border border-primary/30 text-sm font-semibold text-primary"
          >
            +{queue.length - 20} mais na fila
          </motion.div>
        )}

        {queue.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground italic"
          >
            Nenhum veículo na fila
          </motion.div>
        )}
      </div>
    </div>
  );
}
