import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Save, Play, Pause, History, Tag, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Journey } from '@/types/journey';
import { cn } from '@/lib/utils';

interface JourneyPropertiesProps {
  journey: Journey;
  onUpdate: (updates: Partial<Journey>) => void;
  onPublish: () => void;
  onPause: () => void;
  onSave: () => void;
}

export function JourneyProperties({
  journey,
  onUpdate,
  onPublish,
  onPause,
  onSave,
}: JourneyPropertiesProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !journey.tags.includes(newTag.trim())) {
      onUpdate({ tags: [...journey.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    onUpdate({ tags: journey.tags.filter((t) => t !== tag) });
  };

  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    published: 'bg-[hsl(var(--node-action))]/10 text-[hsl(var(--node-action))]',
    paused: 'bg-[hsl(var(--node-condition))]/10 text-[hsl(var(--node-condition))]',
    archived: 'bg-muted text-muted-foreground',
  };

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 border-l border-border bg-sidebar-background flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Journey Properties</h2>
          <Badge className={cn(statusColors[journey.status], 'capitalize')}>
            {journey.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Version {journey.version} • Last saved {journey.updatedAt.toLocaleTimeString()}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-4">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Journey Name</Label>
            <Input
              value={journey.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Enter journey name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={journey.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Describe this journey..."
              rows={3}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {journey.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Version History */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Version History
              </span>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-2">
              {[...Array(Math.min(journey.version, 5))].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-lg text-sm',
                    i === 0 ? 'bg-accent' : 'hover:bg-muted'
                  )}
                >
                  <span>Version {journey.version - i}</span>
                  <span className="text-xs text-muted-foreground">
                    {i === 0 ? 'Current' : `${i + 1}d ago`}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button onClick={onSave} variant="outline" className="w-full gap-2">
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
        {journey.status === 'published' ? (
          <Button
            onClick={onPause}
            variant="secondary"
            className="w-full gap-2 text-[hsl(var(--node-condition))]"
          >
            <Pause className="h-4 w-4" />
            Pause Journey
          </Button>
        ) : (
          <Button onClick={onPublish} className="w-full gap-2">
            <Play className="h-4 w-4" />
            Publish Journey
          </Button>
        )}
      </div>
    </motion.div>
  );
}
