import { motion } from 'framer-motion';
import { Car, Truck } from 'lucide-react';
import { Vehicle } from '@/types/simulation';

interface VehicleChipProps {
  vehicle: Vehicle;
  index?: number;
}

export function VehicleChip({ vehicle, index = 0 }: VehicleChipProps) {
  const Icon = vehicle.type === 'car' ? Car : Truck;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary/50 border border-primary/30 backdrop-blur-sm"
    >
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-mono text-foreground/80">{vehicle.type}</span>
    </motion.div>
  );
}
