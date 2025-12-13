import { JourneyNode } from './BaseNode';
import { StartNode } from './StartNode';

export const nodeTypes = {
  // Start node
  start: StartNode,
  
  // All journey nodes use the base node with different data
  'occurrence-of-event': JourneyNode,
  'enter-segment': JourneyNode,
  'exit-segment': JourneyNode,
  'is-in-segment': JourneyNode,
  'change-user-attribute': JourneyNode,
  'specific-users': JourneyNode,
  'enter-geofence': JourneyNode,
  'exit-geofence': JourneyNode,
  
  // Actions
  'send-email': JourneyNode,
  'send-sms': JourneyNode,
  'send-rcs': JourneyNode,
  'send-push': JourneyNode,
  'send-whatsapp': JourneyNode,
  'send-web-push': JourneyNode,
  'show-in-app': JourneyNode,
  'show-onsite': JourneyNode,
  'show-app-inline': JourneyNode,
  'show-web-inline': JourneyNode,
  'call-api': JourneyNode,
  'set-user-attribute': JourneyNode,
  
  // Conditions
  'is-in-list': JourneyNode,
  'has-done-event': JourneyNode,
  'check-user-attribute': JourneyNode,
  'is-reachable': JourneyNode,
  'check-best-channel': JourneyNode,
  
  // Flow control
  'wait-time': JourneyNode,
  'wait-time-slot': JourneyNode,
  'wait-event': JourneyNode,
  'wait-date': JourneyNode,
  'split': JourneyNode,
  'end-journey': JourneyNode,
};

export { JourneyNode, StartNode };
