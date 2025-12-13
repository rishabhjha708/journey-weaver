import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Segment, SegmentConditionGroup, SegmentCondition } from '@/types/journey';

interface SegmentState {
  segments: Segment[];
  currentSegment: Segment | null;
  
  // CRUD
  createSegment: (name: string, description?: string) => Segment;
  updateSegment: (segmentId: string, updates: Partial<Segment>) => void;
  deleteSegment: (segmentId: string) => void;
  setCurrentSegment: (segment: Segment | null) => void;
  
  // Condition building
  addCondition: (groupId: string, condition: SegmentCondition) => void;
  updateCondition: (groupId: string, conditionId: string, updates: Partial<SegmentCondition>) => void;
  removeCondition: (groupId: string, conditionId: string) => void;
  addConditionGroup: (parentGroupId: string) => void;
  toggleGroupOperator: (groupId: string) => void;
}

const createEmptyConditionGroup = (): SegmentConditionGroup => ({
  id: `group-${Date.now()}`,
  operator: 'and',
  conditions: [],
});

export const useSegmentStore = create<SegmentState>()(
  persist(
    (set, get) => ({
      segments: [],
      currentSegment: null,

      createSegment: (name, description) => {
        const segment: Segment = {
          id: `segment-${Date.now()}`,
          name,
          description,
          conditions: createEmptyConditionGroup(),
          count: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set({ segments: [...get().segments, segment] });
        return segment;
      },

      updateSegment: (segmentId, updates) => {
        set({
          segments: get().segments.map((s) =>
            s.id === segmentId ? { ...s, ...updates, updatedAt: new Date() } : s
          ),
        });
      },

      deleteSegment: (segmentId) => {
        set({
          segments: get().segments.filter((s) => s.id !== segmentId),
          currentSegment: get().currentSegment?.id === segmentId ? null : get().currentSegment,
        });
      },

      setCurrentSegment: (segment) => set({ currentSegment: segment }),

      addCondition: (groupId, condition) => {
        const { currentSegment } = get();
        if (!currentSegment) return;

        const updateGroup = (group: SegmentConditionGroup): SegmentConditionGroup => {
          if (group.id === groupId) {
            return { ...group, conditions: [...group.conditions, condition] };
          }
          return {
            ...group,
            conditions: group.conditions.map((c) =>
              'operator' in c ? updateGroup(c as SegmentConditionGroup) : c
            ),
          };
        };

        const updatedConditions = updateGroup(currentSegment.conditions);
        set({
          currentSegment: { ...currentSegment, conditions: updatedConditions },
        });
      },

      updateCondition: (groupId, conditionId, updates) => {
        const { currentSegment } = get();
        if (!currentSegment) return;

        const updateGroup = (group: SegmentConditionGroup): SegmentConditionGroup => {
          if (group.id === groupId) {
            return {
              ...group,
              conditions: group.conditions.map((c): SegmentCondition | SegmentConditionGroup =>
                'type' in c && c.id === conditionId ? { ...c, ...updates } as SegmentCondition : c
              ),
            };
          }
          return {
            ...group,
            conditions: group.conditions.map((c) =>
              'operator' in c ? updateGroup(c as SegmentConditionGroup) : c
            ),
          };
        };

        const updatedConditions = updateGroup(currentSegment.conditions);
        set({
          currentSegment: { ...currentSegment, conditions: updatedConditions },
        });
      },

      removeCondition: (groupId, conditionId) => {
        const { currentSegment } = get();
        if (!currentSegment) return;

        const updateGroup = (group: SegmentConditionGroup): SegmentConditionGroup => {
          if (group.id === groupId) {
            return {
              ...group,
              conditions: group.conditions.filter((c) => !('id' in c) || c.id !== conditionId),
            };
          }
          return {
            ...group,
            conditions: group.conditions.map((c) =>
              'operator' in c ? updateGroup(c as SegmentConditionGroup) : c
            ),
          };
        };

        const updatedConditions = updateGroup(currentSegment.conditions);
        set({
          currentSegment: { ...currentSegment, conditions: updatedConditions },
        });
      },

      addConditionGroup: (parentGroupId) => {
        const { currentSegment } = get();
        if (!currentSegment) return;

        const updateGroup = (group: SegmentConditionGroup): SegmentConditionGroup => {
          if (group.id === parentGroupId) {
            return { ...group, conditions: [...group.conditions, createEmptyConditionGroup()] };
          }
          return {
            ...group,
            conditions: group.conditions.map((c) =>
              'operator' in c ? updateGroup(c as SegmentConditionGroup) : c
            ),
          };
        };

        const updatedConditions = updateGroup(currentSegment.conditions);
        set({
          currentSegment: { ...currentSegment, conditions: updatedConditions },
        });
      },

      toggleGroupOperator: (groupId) => {
        const { currentSegment } = get();
        if (!currentSegment) return;

        const updateGroup = (group: SegmentConditionGroup): SegmentConditionGroup => {
          if (group.id === groupId) {
            return { ...group, operator: group.operator === 'and' ? 'or' : 'and' };
          }
          return {
            ...group,
            conditions: group.conditions.map((c) =>
              'operator' in c ? updateGroup(c as SegmentConditionGroup) : c
            ),
          };
        };

        const updatedConditions = updateGroup(currentSegment.conditions);
        set({
          currentSegment: { ...currentSegment, conditions: updatedConditions },
        });
      },
    }),
    {
      name: 'segment-store',
      partialize: (state) => ({ segments: state.segments }),
    }
  )
);
