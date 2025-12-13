import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { JourneyNodeData } from '@/types/journey';
import { cn } from '@/lib/utils';

function StartNodeComponent({ data, selected }: NodeProps<JourneyNodeData>) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[hsl(var(--node-trigger))] shadow-lg transition-all duration-200',
        selected && 'ring-4 ring-primary/30 scale-110'
      )}
    >
      <PlayCircle className="h-8 w-8 text-primary-foreground" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-background !bg-primary"
      />
    </motion.div>
  );
}

export const StartNode = memo(StartNodeComponent);
