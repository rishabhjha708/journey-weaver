export type NodeCategory = 'trigger' | 'action' | 'condition' | 'flow';

export type TriggerNodeType = 
  | 'occurrence-of-event'
  | 'enter-segment'
  | 'exit-segment'
  | 'is-in-segment'
  | 'change-user-attribute'
  | 'specific-users'
  | 'enter-geofence'
  | 'exit-geofence';

export type ActionNodeType =
  | 'send-email'
  | 'send-sms'
  | 'send-rcs'
  | 'send-push'
  | 'send-whatsapp'
  | 'send-web-push'
  | 'show-in-app'
  | 'show-onsite'
  | 'show-app-inline'
  | 'show-web-inline'
  | 'call-api'
  | 'set-user-attribute';

export type ConditionNodeType =
  | 'is-in-segment'
  | 'is-in-list'
  | 'has-done-event'
  | 'check-user-attribute'
  | 'is-reachable'
  | 'check-best-channel';

export type FlowNodeType =
  | 'wait-time'
  | 'wait-time-slot'
  | 'wait-event'
  | 'wait-date'
  | 'split'
  | 'end-journey';

export type JourneyNodeType = TriggerNodeType | ActionNodeType | ConditionNodeType | FlowNodeType;

export interface JourneyNodeData {
  id: string;
  type: JourneyNodeType;
  category: NodeCategory;
  label: string;
  description?: string;
  config: Record<string, any>;
  isConfigured: boolean;
}

export interface Journey {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  status: 'draft' | 'published' | 'paused' | 'archived';
  nodes: any[];
  edges: any[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  version: number;
  stats?: JourneyStats;
}

export interface JourneyStats {
  entered: number;
  active: number;
  completed: number;
  exited: number;
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  conditions: SegmentConditionGroup;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCondition {
  id: string;
  type: 'attribute' | 'event';
  attribute?: string;
  event?: string;
  operator: string;
  value: any;
}

export interface SegmentConditionGroup {
  id: string;
  operator: 'and' | 'or';
  conditions: (SegmentCondition | SegmentConditionGroup)[];
}

export interface NodeTemplate {
  type: JourneyNodeType;
  category: NodeCategory;
  label: string;
  description: string;
  icon: string;
  defaultConfig: Record<string, any>;
}
