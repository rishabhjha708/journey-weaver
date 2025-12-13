import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Grid3X3, List, MoreHorizontal, Play, Pause, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useJourneyStore } from '@/stores/journeyStore';
import { useUIStore } from '@/stores/uiStore';
import { mockJourneys } from '@/data/mockData';
import { Journey } from '@/types/journey';
import { cn } from '@/lib/utils';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-[hsl(var(--node-action))]/10 text-[hsl(var(--node-action))] border-[hsl(var(--node-action))]/30',
  paused: 'bg-[hsl(var(--node-condition))]/10 text-[hsl(var(--node-condition))] border-[hsl(var(--node-condition))]/30',
  archived: 'bg-muted text-muted-foreground',
};

export default function JourneysListPage() {
  const { journeys, deleteJourney, publishJourney, pauseJourney } = useJourneyStore();
  const { journeyListView, setJourneyListView } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (journeys.length === 0) {
      mockJourneys.forEach((j) => {
        useJourneyStore.setState((state) => ({ journeys: [...state.journeys, j] }));
      });
    }
  }, [journeys.length]);

  const allJourneys = journeys.length > 0 ? journeys : mockJourneys;
  const filteredJourneys = allJourneys.filter((j) => {
    const matchesSearch = j.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Journeys</h1>
          <p className="text-muted-foreground">Create and manage customer journeys</p>
        </div>
        <Link to="/journeys/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Journey
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search journeys..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {['all', 'draft', 'published', 'paused'].map((status) => (
            <Button key={status} variant={statusFilter === status ? 'secondary' : 'ghost'} size="sm" onClick={() => setStatusFilter(status)} className="capitalize">
              {status}
            </Button>
          ))}
        </div>
        <div className="flex border rounded-lg">
          <Button variant={journeyListView === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setJourneyListView('grid')}>
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant={journeyListView === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setJourneyListView('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Journey Cards */}
      <motion.div layout className={cn('grid gap-4', journeyListView === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
        {filteredJourneys.map((journey, i) => (
          <motion.div key={journey.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <JourneyCard journey={journey} view={journeyListView} onPublish={() => publishJourney(journey.id)} onPause={() => pauseJourney(journey.id)} onDelete={() => deleteJourney(journey.id)} />
          </motion.div>
        ))}
      </motion.div>

      {filteredJourneys.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No journeys found</p>
        </div>
      )}
    </div>
  );
}

function JourneyCard({ journey, view, onPublish, onPause, onDelete }: { journey: Journey; view: 'grid' | 'list'; onPublish: () => void; onPause: () => void; onDelete: () => void }) {
  return (
    <Link to={`/journeys/${journey.id}`}>
      <div className={cn('group p-4 rounded-xl border bg-card hover:shadow-lg transition-all duration-200 hover:border-primary/50', view === 'list' && 'flex items-center gap-4')}>
        <div className={cn('flex-1', view === 'list' && 'flex items-center gap-4')}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">{journey.name}</h3>
              {journey.description && <p className="text-sm text-muted-foreground line-clamp-2">{journey.description}</p>}
            </div>
            <Badge variant="outline" className={cn('ml-2', statusColors[journey.status])}>{journey.status}</Badge>
          </div>
          {journey.stats && (
            <div className="flex gap-4 text-sm text-muted-foreground mt-3">
              <span>{journey.stats.entered.toLocaleString()} entered</span>
              <span>{journey.stats.active.toLocaleString()} active</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-3">
            {journey.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {journey.status === 'published' ? (
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); onPause(); }}><Pause className="mr-2 h-4 w-4" />Pause</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={(e) => { e.preventDefault(); onPublish(); }}><Play className="mr-2 h-4 w-4" />Publish</DropdownMenuItem>
            )}
            <DropdownMenuItem><Copy className="mr-2 h-4 w-4" />Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={(e) => { e.preventDefault(); onDelete(); }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Link>
  );
}
