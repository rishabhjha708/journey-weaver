import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ChevronDown, Search, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  triggerTemplates,
  actionTemplates,
  conditionTemplates,
  flowTemplates,
  categoryConfig,
} from '@/data/nodeTemplates';
import { NodeTemplate, NodeCategory } from '@/types/journey';
import { cn } from '@/lib/utils';

interface NodeSidebarProps {
  onDragStart: (event: React.DragEvent, template: NodeTemplate) => void;
}

const categories: { key: NodeCategory; templates: NodeTemplate[] }[] = [
  { key: 'trigger', templates: triggerTemplates },
  { key: 'action', templates: actionTemplates },
  { key: 'condition', templates: conditionTemplates },
  { key: 'flow', templates: flowTemplates },
];

export function NodeSidebar({ onDragStart }: NodeSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<NodeCategory[]>([
    'trigger',
    'action',
    'condition',
    'flow',
  ]);

  const toggleCategory = (category: NodeCategory) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    templates: cat.templates.filter(
      (t) =>
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  }));

  return (
    <div className="w-72 border-r border-border bg-sidebar-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sidebar-foreground mb-3">Add Node</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Node Categories */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-3">
          {filteredCategories.map((category) => (
            <div key={category.key} className="mb-2">
              <button
                onClick={() => toggleCategory(category.key)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg transition-colors',
                  'hover:bg-sidebar-accent text-sidebar-foreground'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      category.key === 'trigger' && 'bg-[hsl(var(--node-trigger))]',
                      category.key === 'action' && 'bg-[hsl(var(--node-action))]',
                      category.key === 'condition' && 'bg-[hsl(var(--node-condition))]',
                      category.key === 'flow' && 'bg-[hsl(var(--node-flow))]'
                    )}
                  />
                  <span className="font-medium text-sm">
                    {categoryConfig[category.key].label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({category.templates.length})
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: expandedCategories.includes(category.key) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {expandedCategories.includes(category.key) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-2 py-2 space-y-1">
                      {category.templates.map((template) => (
                        <NodeItem
                          key={template.type}
                          template={template}
                          onDragStart={onDragStart}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface NodeItemProps {
  template: NodeTemplate;
  onDragStart: (event: React.DragEvent, template: NodeTemplate) => void;
}

function NodeItem({ template, onDragStart }: NodeItemProps) {
  const IconComponent = (LucideIcons as any)[template.icon] || LucideIcons.Circle;

  const getBorderColor = () => {
    switch (template.category) {
      case 'trigger':
        return 'border-[hsl(var(--node-trigger))]/30 hover:border-[hsl(var(--node-trigger))]';
      case 'action':
        return 'border-[hsl(var(--node-action))]/30 hover:border-[hsl(var(--node-action))]';
      case 'condition':
        return 'border-[hsl(var(--node-condition))]/30 hover:border-[hsl(var(--node-condition))]';
      case 'flow':
        return 'border-[hsl(var(--node-flow))]/30 hover:border-[hsl(var(--node-flow))]';
      default:
        return 'border-border hover:border-primary';
    }
  };

  const getIconColor = () => {
    switch (template.category) {
      case 'trigger':
        return 'text-[hsl(var(--node-trigger))]';
      case 'action':
        return 'text-[hsl(var(--node-action))]';
      case 'condition':
        return 'text-[hsl(var(--node-condition))]';
      case 'flow':
        return 'text-[hsl(var(--node-flow))]';
      default:
        return 'text-primary';
    }
  };

  return (
    <motion.div
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, template)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border-2 bg-card cursor-grab transition-all duration-200',
        getBorderColor(),
        'hover:shadow-md active:cursor-grabbing'
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
      <div className={cn('p-1.5 rounded-md bg-muted/50', getIconColor())}>
        <IconComponent className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{template.label}</p>
        <p className="text-xs text-muted-foreground truncate">{template.description}</p>
      </div>
    </motion.div>
  );
}
