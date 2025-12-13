import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { JourneyNodeData, NodeCategory } from '@/types/journey';
import { cn } from '@/lib/utils';

interface BaseNodeProps extends NodeProps<JourneyNodeData> {}

const categoryStyles: Record<NodeCategory, { border: string; bg: string; icon: string }> = {
  trigger: {
    border: 'border-[hsl(var(--node-trigger))]',
    bg: 'bg-[hsl(var(--node-trigger-bg))]',
    icon: 'text-[hsl(var(--node-trigger))]',
  },
  action: {
    border: 'border-[hsl(var(--node-action))]',
    bg: 'bg-[hsl(var(--node-action-bg))]',
    icon: 'text-[hsl(var(--node-action))]',
  },
  condition: {
    border: 'border-[hsl(var(--node-condition))]',
    bg: 'bg-[hsl(var(--node-condition-bg))]',
    icon: 'text-[hsl(var(--node-condition))]',
  },
  flow: {
    border: 'border-[hsl(var(--node-flow))]',
    bg: 'bg-[hsl(var(--node-flow-bg))]',
    icon: 'text-[hsl(var(--node-flow))]',
  },
};

const handleStyles = {
  trigger: 'bg-[hsl(var(--node-trigger))]',
  action: 'bg-[hsl(var(--node-action))]',
  condition: 'bg-[hsl(var(--node-condition))]',
  flow: 'bg-[hsl(var(--node-flow))]',
};

function BaseNode({ data, selected, id }: BaseNodeProps) {
  const styles = categoryStyles[data.category];
  const IconComponent = (LucideIcons as any)[getIconName(data.type)] || LucideIcons.Circle;
  
  // Determine handles based on category
  const showTopHandle = data.category !== 'trigger';
  const showBottomHandle = data.type !== 'end-journey';
  const showBranchHandles = data.category === 'condition' || data.type === 'split';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative min-w-[200px] rounded-xl border-2 bg-card shadow-lg transition-all duration-200',
        styles.border,
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl scale-105'
      )}
    >
      {/* Top Handle */}
      {showTopHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className={cn('!w-3 !h-3 !border-2 !border-background', handleStyles[data.category])}
        />
      )}

      {/* Node Content */}
      <div className={cn('flex items-start gap-3 p-4', styles.bg, 'rounded-t-lg')}>
        <div className={cn('flex-shrink-0 p-2 rounded-lg bg-background/50', styles.icon)}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">{data.label}</h3>
          {data.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{data.description}</p>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 bg-background/50 rounded-b-lg">
        <span className={cn(
          'text-xs flex items-center gap-1.5',
          data.isConfigured ? 'text-[hsl(var(--node-action))]' : 'text-muted-foreground'
        )}>
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            data.isConfigured ? 'bg-[hsl(var(--node-action))]' : 'bg-muted-foreground'
          )} />
          {data.isConfigured ? 'Configured' : 'Not configured'}
        </span>
        <LucideIcons.ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Bottom Handle */}
      {showBottomHandle && !showBranchHandles && (
        <Handle
          type="source"
          position={Position.Bottom}
          className={cn('!w-3 !h-3 !border-2 !border-background', handleStyles[data.category])}
        />
      )}

      {/* Branch Handles for conditions */}
      {showBranchHandles && (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            style={{ left: '30%' }}
            className={cn('!w-3 !h-3 !border-2 !border-background bg-[hsl(var(--node-action))]')}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            style={{ left: '70%' }}
            className={cn('!w-3 !h-3 !border-2 !border-background bg-[hsl(var(--node-flow))]')}
          />
          <div className="absolute -bottom-6 left-[30%] -translate-x-1/2 text-[10px] text-[hsl(var(--node-action))] font-medium">
            Yes
          </div>
          <div className="absolute -bottom-6 left-[70%] -translate-x-1/2 text-[10px] text-[hsl(var(--node-flow))] font-medium">
            No
          </div>
        </>
      )}
    </motion.div>
  );
}

function getIconName(type: string): string {
  const iconMap: Record<string, string> = {
    // Triggers
    'occurrence-of-event': 'Zap',
    'enter-segment': 'LogIn',
    'exit-segment': 'LogOut',
    'is-in-segment': 'Users',
    'change-user-attribute': 'RefreshCw',
    'specific-users': 'FileSpreadsheet',
    'enter-geofence': 'MapPin',
    'exit-geofence': 'MapPinOff',
    // Actions
    'send-email': 'Mail',
    'send-sms': 'MessageSquare',
    'send-rcs': 'MessageCircle',
    'send-push': 'Bell',
    'send-whatsapp': 'MessageCircle',
    'send-web-push': 'Globe',
    'show-in-app': 'Smartphone',
    'show-onsite': 'MonitorSmartphone',
    'show-app-inline': 'LayoutTemplate',
    'show-web-inline': 'Layout',
    'call-api': 'Webhook',
    'set-user-attribute': 'UserCog',
    // Conditions
    'is-in-list': 'List',
    'has-done-event': 'CheckCircle',
    'check-user-attribute': 'UserCheck',
    'is-reachable': 'Radio',
    'check-best-channel': 'Shuffle',
    // Flow
    'wait-time': 'Clock',
    'wait-time-slot': 'Calendar',
    'wait-event': 'Hourglass',
    'wait-date': 'CalendarDays',
    'split': 'GitBranch',
    'end-journey': 'XCircle',
  };
  return iconMap[type] || 'Circle';
}

export const JourneyNode = memo(BaseNode);
