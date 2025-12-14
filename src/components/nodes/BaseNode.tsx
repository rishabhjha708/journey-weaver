import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { JourneyNodeData, NodeCategory } from '@/types/journey';
import { cn } from '@/lib/utils';

interface BaseNodeProps extends NodeProps<JourneyNodeData> {}

// Define output handles for action nodes based on their type
const actionOutputHandles: Record<string, { id: string; label: string; color: string }[]> = {
  'send-email': [
    { id: 'on-sent', label: 'On Sent', color: 'hsl(var(--node-action))' },
    { id: 'on-delivered', label: 'On Delivered', color: 'hsl(142, 71%, 45%)' },
    { id: 'on-open', label: 'On Open', color: 'hsl(217, 91%, 60%)' },
    { id: 'on-click', label: 'On Click', color: 'hsl(251, 91%, 62%)' },
    { id: 'on-bounce', label: 'On Bounce', color: 'hsl(38, 92%, 50%)' },
    { id: 'on-unsubscribe', label: 'On Unsubscribe', color: 'hsl(0, 84%, 60%)' },
  ],
  'send-sms': [
    { id: 'on-sent', label: 'On Sent', color: 'hsl(var(--node-action))' },
    { id: 'on-delivered', label: 'On Delivered', color: 'hsl(142, 71%, 45%)' },
    { id: 'on-click', label: 'On Click', color: 'hsl(251, 91%, 62%)' },
    { id: 'on-failure', label: 'On Failure', color: 'hsl(0, 84%, 60%)' },
  ],
  'send-whatsapp': [
    { id: 'on-sent', label: 'On Sent', color: 'hsl(var(--node-action))' },
    { id: 'on-delivered', label: 'On Delivered', color: 'hsl(142, 71%, 45%)' },
    { id: 'on-read', label: 'On Read', color: 'hsl(217, 91%, 60%)' },
    { id: 'on-click', label: 'On Click', color: 'hsl(251, 91%, 62%)' },
    { id: 'on-failure', label: 'On Failure', color: 'hsl(0, 84%, 60%)' },
  ],
  'send-push': [
    { id: 'on-sent', label: 'On Sent', color: 'hsl(var(--node-action))' },
    { id: 'on-delivered', label: 'On Delivered', color: 'hsl(142, 71%, 45%)' },
    { id: 'on-click', label: 'On Click', color: 'hsl(251, 91%, 62%)' },
    { id: 'on-dismiss', label: 'On Dismiss', color: 'hsl(38, 92%, 50%)' },
  ],
  'send-web-push': [
    { id: 'on-sent', label: 'On Sent', color: 'hsl(var(--node-action))' },
    { id: 'on-click', label: 'On Click', color: 'hsl(251, 91%, 62%)' },
    { id: 'on-close', label: 'On Close', color: 'hsl(38, 92%, 50%)' },
  ],
  'send-rcs': [
    { id: 'on-sent', label: 'On Sent', color: 'hsl(var(--node-action))' },
    { id: 'on-delivered', label: 'On Delivered', color: 'hsl(142, 71%, 45%)' },
    { id: 'on-read', label: 'On Read', color: 'hsl(217, 91%, 60%)' },
    { id: 'on-click', label: 'On Click', color: 'hsl(251, 91%, 62%)' },
  ],
  'show-in-app': [
    { id: 'on-shown', label: 'On Shown', color: 'hsl(var(--node-action))' },
    { id: 'on-click', label: 'On Click', color: 'hsl(251, 91%, 62%)' },
    { id: 'on-dismiss', label: 'On Dismiss', color: 'hsl(38, 92%, 50%)' },
  ],
  'show-onsite': [
    { id: 'on-shown', label: 'On Shown', color: 'hsl(var(--node-action))' },
    { id: 'on-click', label: 'On Click', color: 'hsl(251, 91%, 62%)' },
    { id: 'on-close', label: 'On Close', color: 'hsl(38, 92%, 50%)' },
  ],
  'call-api': [
    { id: 'on-success', label: 'On Success', color: 'hsl(142, 71%, 45%)' },
    { id: 'on-failure', label: 'On Failure', color: 'hsl(0, 84%, 60%)' },
  ],
};

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
  const [showHandles, setShowHandles] = useState(false);
  const styles = categoryStyles[data.category];
  const IconComponent = (LucideIcons as any)[getIconName(data.type)] || LucideIcons.Circle;
  
  // Determine handles based on category
  const showTopHandle = data.category !== 'trigger';
  const showBottomHandle = data.type !== 'end-journey';
  const showBranchHandles = data.category === 'condition' || data.type === 'split';
  
  // Get action output handles if this is an action node
  const outputHandles = actionOutputHandles[data.type] || [];
  const hasMultipleOutputs = data.category === 'action' && outputHandles.length > 0;

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
      onMouseEnter={() => setShowHandles(true)}
      onMouseLeave={() => setShowHandles(false)}
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
        
        {/* Multi-output indicator */}
        {hasMultipleOutputs && (
          <div className="flex-shrink-0">
            <motion.div
              animate={{ rotate: showHandles ? 90 : 0 }}
              className={cn(
                'p-1.5 rounded-full cursor-pointer transition-colors',
                showHandles ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <LucideIcons.ArrowRight className="h-3.5 w-3.5" />
            </motion.div>
          </div>
        )}
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
        {!hasMultipleOutputs && <LucideIcons.ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>

      {/* Multiple Output Handles for Actions - Fan-out style */}
      {hasMultipleOutputs && (
        <>
          {/* Default bottom handle when collapsed */}
          <Handle
            type="source"
            position={Position.Right}
            id="default"
            style={{ top: '50%' }}
            className={cn('!w-3 !h-3 !border-2 !border-background', handleStyles[data.category])}
          />
          
          {/* Fan-out handles panel */}
          <AnimatePresence>
            {showHandles && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-10"
              >
                <div className="bg-card border border-border rounded-lg shadow-xl p-2 min-w-[120px]">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 px-1">
                    Next Steps
                  </div>
                  {outputHandles.map((handle, index) => (
                    <div
                      key={handle.id}
                      className="relative flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors group"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: handle.color }}
                      />
                      <span className="text-xs text-foreground whitespace-nowrap">
                        {handle.label}
                      </span>
                      <Handle
                        type="source"
                        position={Position.Right}
                        id={handle.id}
                        className="!w-2.5 !h-2.5 !border-2 !border-background !right-0 !translate-x-1/2"
                        style={{ 
                          backgroundColor: handle.color,
                          position: 'absolute',
                          top: '50%',
                          transform: 'translateY(-50%) translateX(50%)',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Simple Bottom Handle for non-action nodes */}
      {showBottomHandle && !showBranchHandles && !hasMultipleOutputs && (
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
