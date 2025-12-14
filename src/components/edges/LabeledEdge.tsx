import { memo } from 'react';
import {
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';
import { cn } from '@/lib/utils';

export const LabeledEdge = memo(function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const edgeLabel = label || data?.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={style}
        markerEnd={markerEnd}
      />
      {edgeLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={cn(
              'px-2 py-1 rounded-md text-xs font-medium',
              'bg-card border border-border shadow-sm',
              'text-foreground/80',
              'transition-all duration-200 hover:shadow-md hover:scale-105',
              data?.labelType === 'success' && 'bg-node-action/10 border-node-action/30 text-node-action',
              data?.labelType === 'failure' && 'bg-destructive/10 border-destructive/30 text-destructive',
              data?.labelType === 'timeout' && 'bg-node-condition/10 border-node-condition/30 text-node-condition',
            )}
          >
            {edgeLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

export const edgeTypes = {
  labeled: LabeledEdge,
};
