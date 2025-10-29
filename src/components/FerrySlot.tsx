import { motion } from 'framer-motion';
import { AlertTriangle, Ship, Loader2 } from 'lucide-react';
import { Ferry } from '@/types/simulation';
import { VehicleChip } from './VehicleChip';

interface FerrySlotProps {
  ferry: Ferry;
}

const stateColors = {
  idle: 'border-ferry-inactive bg-ferry-inactive/10',
  loading: 'border-ferry-loading bg-ferry-loading/10 shadow-glow',
  crossing: 'border-ferry-crossing bg-ferry-crossing/10',
  unloading: 'border-ferry-active bg-ferry-active/10',
  maintenance: 'border-ferry-maintenance bg-ferry-maintenance/10',
};

const stateLabels = {
  idle: 'Idle',
  loading: 'Loading',
  crossing: 'Crossing',
  unloading: 'Unloading',
  maintenance: 'Maintenance',
};

export function FerrySlot({ ferry }: FerrySlotProps) {
  const colorClass = stateColors[ferry.state];
  const label = stateLabels[ferry.state];
  
  return (
    <motion.div
      layout
      className={`relative flex flex-col border-2 rounded-lg p-4 transition-all ${colorClass}`}
      animate={{
        x: ferry.state === 'crossing' ? [0, 10, 0] : 0,
      }}
      transition={{
        x: { repeat: ferry.state === 'crossing' ? Infinity : 0, duration: 2 },
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Ship className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">Ferry {ferry.id + 1}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {ferry.state === 'maintenance' && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <AlertTriangle className="w-4 h-4 text-warning" />
            </motion.div>
          )}
          {ferry.state === 'loading' && (
            <Loader2 className="w-4 h-4 text-success animate-spin" />
          )}
          <span className="text-xs font-semibold px-2 py-1 rounded bg-background/50 text-foreground/80">
            {label}
          </span>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="mb-3">
        <div className="h-2 bg-background/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(ferry.vehicles.length / ferry.capacity) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {ferry.vehicles.length} / {ferry.capacity} vehicles
        </div>
      </div>

      {/* Vehicles */}
      <div className="flex flex-wrap gap-2 min-h-[60px] overflow-hidden">
        {ferry.vehicles.slice(0, 6).map((vehicle, idx) => (
          <VehicleChip key={vehicle.id} vehicle={vehicle} index={idx} />
        ))}
        {ferry.vehicles.length > 6 && (
          <div className="px-3 py-1.5 rounded-md bg-secondary/30 border border-primary/20 text-xs text-muted-foreground">
            +{ferry.vehicles.length - 6} more
          </div>
        )}
      </div>

      {/* Maintenance Stripes */}
      {ferry.state === 'maintenance' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-warning/20 to-transparent animate-pulse" 
               style={{
                 backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(var(--warning) / 0.1) 10px, hsl(var(--warning) / 0.1) 20px)'
               }}
          />
        </div>
      )}
    </motion.div>
  );
}
