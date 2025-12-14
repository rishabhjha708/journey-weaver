import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge, addEdge, applyNodeChanges, applyEdgeChanges, Connection, NodeChange, EdgeChange, MarkerType } from 'reactflow';
import { Journey, JourneyNodeData } from '@/types/journey';

interface JourneyState {
  // Current journey being edited
  currentJourney: Journey | null;
  nodes: Node<JourneyNodeData>[];
  edges: Edge[];
  
  // Selection state
  selectedNodeId: string | null;
  
  // All journeys
  journeys: Journey[];
  
  // Actions
  setCurrentJourney: (journey: Journey | null) => void;
  setNodes: (nodes: Node<JourneyNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<JourneyNodeData>) => void;
  updateNode: (nodeId: string, data: Partial<JourneyNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  
  // Journey CRUD
  createJourney: (name: string, description?: string) => Journey;
  updateJourney: (journeyId: string, updates: Partial<Journey>) => void;
  deleteJourney: (journeyId: string) => void;
  saveCurrentJourney: () => void;
  publishJourney: (journeyId: string) => void;
  pauseJourney: (journeyId: string) => void;
}

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      currentJourney: null,
      nodes: [],
      edges: [],
      selectedNodeId: null,
      journeys: [],

      setCurrentJourney: (journey) => {
        set({ 
          currentJourney: journey,
          nodes: journey?.nodes || [],
          edges: journey?.edges || [],
          selectedNodeId: null
        });
      },

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        const sourceNode = get().nodes.find(n => n.id === connection.source);
        const sourceCategory = sourceNode?.data?.category;
        const sourceType = sourceNode?.data?.type;
        const sourceHandle = connection.sourceHandle;
        
        // Determine edge label based on source node type and handle
        let label = '';
        let labelType = '';
        
        if (sourceCategory === 'condition') {
          // For condition nodes, use handle ID to determine Yes/No
          if (sourceHandle === 'yes' || sourceHandle === 'true') {
            label = 'Yes';
            labelType = 'success';
          } else if (sourceHandle === 'no' || sourceHandle === 'false') {
            label = 'No';
            labelType = 'failure';
          } else {
            label = 'Match';
            labelType = 'success';
          }
        } else if (sourceCategory === 'action' && sourceHandle && sourceHandle !== 'default') {
          // For action nodes with specific outcome handles
          const handleLabels: Record<string, { label: string; type: string }> = {
            'on-sent': { label: 'On Sent', type: 'success' },
            'on-delivered': { label: 'On Delivered', type: 'success' },
            'on-open': { label: 'On Open', type: 'success' },
            'on-read': { label: 'On Read', type: 'success' },
            'on-click': { label: 'On Click', type: 'success' },
            'on-bounce': { label: 'On Bounce', type: 'failure' },
            'on-unsubscribe': { label: 'On Unsubscribe', type: 'failure' },
            'on-failure': { label: 'On Failure', type: 'failure' },
            'on-dismiss': { label: 'On Dismiss', type: 'timeout' },
            'on-close': { label: 'On Close', type: 'timeout' },
            'on-shown': { label: 'On Shown', type: 'success' },
            'on-success': { label: 'On Success', type: 'success' },
          };
          const handleConfig = handleLabels[sourceHandle];
          if (handleConfig) {
            label = handleConfig.label;
            labelType = handleConfig.type;
          }
        } else if (sourceType === 'split') {
          label = 'Branch';
        } else if (sourceCategory === 'flow' && sourceType?.includes('wait')) {
          label = 'Continue';
          labelType = 'timeout';
        }
        
        set({
          edges: addEdge(
            { 
              ...connection, 
              type: 'labeled',
              animated: true,
              style: { stroke: 'hsl(251, 91%, 62%)', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'hsl(251, 91%, 62%)',
                width: 20,
                height: 20,
              },
              label,
              data: { label, labelType },
            }, 
            get().edges
          ),
        });
      },

      addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
      },

      updateNode: (nodeId, data) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
          ),
        });
      },

      deleteNode: (nodeId) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
          selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
        });
      },

      duplicateNode: (nodeId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (node) {
          const newNode: Node<JourneyNodeData> = {
            ...node,
            id: `${node.type}-${Date.now()}`,
            position: { x: node.position.x + 50, y: node.position.y + 50 },
            data: { ...node.data, id: `${node.type}-${Date.now()}` },
            selected: false,
          };
          set({ nodes: [...get().nodes, newNode] });
        }
      },

      selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

      createJourney: (name, description) => {
        const journey: Journey = {
          id: `journey-${Date.now()}`,
          name,
          description,
          tags: [],
          status: 'draft',
          nodes: [],
          edges: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        };
        set({ journeys: [...get().journeys, journey] });
        return journey;
      },

      updateJourney: (journeyId, updates) => {
        set({
          journeys: get().journeys.map((j) =>
            j.id === journeyId ? { ...j, ...updates, updatedAt: new Date() } : j
          ),
        });
      },

      deleteJourney: (journeyId) => {
        set({
          journeys: get().journeys.filter((j) => j.id !== journeyId),
          currentJourney: get().currentJourney?.id === journeyId ? null : get().currentJourney,
        });
      },

      saveCurrentJourney: () => {
        const { currentJourney, nodes, edges, journeys } = get();
        if (currentJourney) {
          const updated = {
            ...currentJourney,
            nodes,
            edges,
            updatedAt: new Date(),
          };
          set({
            currentJourney: updated,
            journeys: journeys.map((j) => (j.id === currentJourney.id ? updated : j)),
          });
        }
      },

      publishJourney: (journeyId) => {
        set({
          journeys: get().journeys.map((j) =>
            j.id === journeyId
              ? { ...j, status: 'published', publishedAt: new Date(), updatedAt: new Date() }
              : j
          ),
        });
      },

      pauseJourney: (journeyId) => {
        set({
          journeys: get().journeys.map((j) =>
            j.id === journeyId ? { ...j, status: 'paused', updatedAt: new Date() } : j
          ),
        });
      },
    }),
    {
      name: 'journey-store',
      partialize: (state) => ({ journeys: state.journeys }),
    }
  )
);
