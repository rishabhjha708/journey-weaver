import { useCallback, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AnimatePresence } from 'framer-motion';

import { useJourneyStore } from '@/stores/journeyStore';
import { useUIStore } from '@/stores/uiStore';
import { nodeTypes } from '@/components/nodes';
import { NodeSidebar } from './NodeSidebar';
import { NodeEditor } from './NodeEditor';
import { ContextMenu } from './ContextMenu';
import { JourneyProperties } from './JourneyProperties';
import { NodeTemplate, JourneyNodeData } from '@/types/journey';
import { Button } from '@/components/ui/button';
import { PanelRight, PanelRightClose, Map, EyeOff } from 'lucide-react';

function JourneyCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  
  const {
    nodes,
    edges,
    selectedNodeId,
    currentJourney,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    updateNode,
    deleteNode,
    duplicateNode,
    selectNode,
    saveCurrentJourney,
    publishJourney,
    pauseJourney,
    updateJourney,
  } = useJourneyStore();

  const { contextMenu, setContextMenu, showMinimap, toggleMinimap } = useUIStore();
  const [showProperties, setShowProperties] = useState(true);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId)?.data,
    [nodes, selectedNodeId]
  );

  const onDragStart = useCallback(
    (event: React.DragEvent, template: NodeTemplate) => {
      event.dataTransfer.setData('application/reactflow', JSON.stringify(template));
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData('application/reactflow');
      if (!data || !reactFlowWrapper.current) return;

      const template: NodeTemplate = JSON.parse(data);
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const newNode: Node<JourneyNodeData> = {
        id: `${template.type}-${Date.now()}`,
        type: template.type,
        position,
        data: {
          id: `${template.type}-${Date.now()}`,
          type: template.type,
          category: template.category,
          label: template.label,
          description: template.description,
          config: { ...template.defaultConfig },
          isConfigured: false,
        },
      };

      addNode(newNode);
    },
    [project, addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      selectNode(node.id);
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    },
    [selectNode, setContextMenu]
  );

  const onPaneClick = useCallback(() => {
    selectNode(null);
    setContextMenu(null);
  }, [selectNode, setContextMenu]);

  const handleUpdateNode = useCallback(
    (data: Partial<JourneyNodeData>) => {
      if (selectedNodeId) {
        updateNode(selectedNodeId, data);
      }
    },
    [selectedNodeId, updateNode]
  );

  const handleDeleteNode = useCallback(() => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  }, [selectedNodeId, deleteNode]);

  const handleDuplicateNode = useCallback(() => {
    if (selectedNodeId) {
      duplicateNode(selectedNodeId);
    }
  }, [selectedNodeId, duplicateNode]);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Node Palette */}
      <NodeSidebar onDragStart={onDragStart} />

      {/* Canvas */}
      <div ref={reactFlowWrapper} className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[16, 16]}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: 'hsl(251, 91%, 62%)', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'hsl(251, 91%, 62%)',
              width: 20,
              height: 20,
            },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls className="!bg-card !border-border !rounded-lg !shadow-lg" />
          {showMinimap && (
            <MiniMap
              className="!bg-card !border-border"
              nodeColor={(node) => {
                const category = (node.data as JourneyNodeData)?.category;
                switch (category) {
                  case 'trigger':
                    return 'hsl(217, 91%, 60%)';
                  case 'action':
                    return 'hsl(142, 71%, 45%)';
                  case 'condition':
                    return 'hsl(38, 92%, 50%)';
                  case 'flow':
                    return 'hsl(0, 84%, 60%)';
                  default:
                    return 'hsl(251, 91%, 62%)';
                }
              }}
            />
          )}
        </ReactFlow>

        {/* Canvas Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMinimap}
            className="bg-card shadow-md"
          >
            {showMinimap ? <EyeOff className="h-4 w-4" /> : <Map className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowProperties(!showProperties)}
            className="bg-card shadow-md"
          >
            {showProperties ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Context Menu */}
        <AnimatePresence>
          {contextMenu && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              nodeId={contextMenu.nodeId}
              onEdit={() => selectNode(contextMenu.nodeId || null)}
              onDuplicate={handleDuplicateNode}
              onDelete={handleDeleteNode}
              onClose={() => setContextMenu(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Right Sidebar - Node Editor or Journey Properties */}
      <AnimatePresence mode="wait">
        {selectedNodeId && selectedNode ? (
          <NodeEditor
            key="node-editor"
            node={selectedNode}
            onUpdate={handleUpdateNode}
            onClose={() => selectNode(null)}
          />
        ) : showProperties && currentJourney ? (
          <JourneyProperties
            key="journey-properties"
            journey={currentJourney}
            onUpdate={(updates) => updateJourney(currentJourney.id, updates)}
            onPublish={() => publishJourney(currentJourney.id)}
            onPause={() => pauseJourney(currentJourney.id)}
            onSave={saveCurrentJourney}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function JourneyBuilder() {
  return (
    <ReactFlowProvider>
      <JourneyCanvas />
    </ReactFlowProvider>
  );
}
