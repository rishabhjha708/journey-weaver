import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge, addEdge, applyNodeChanges, applyEdgeChanges, Connection, NodeChange, EdgeChange } from 'reactflow';
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
        set({
          edges: addEdge(
            { 
              ...connection, 
              type: 'smoothstep',
              animated: true,
              style: { stroke: 'hsl(251, 91%, 62%)', strokeWidth: 2 }
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
