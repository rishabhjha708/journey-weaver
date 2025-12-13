import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Sidebar
  sidebarOpen: boolean;
  nodeSidebarOpen: boolean;
  editorSidebarOpen: boolean;
  toggleSidebar: () => void;
  toggleNodeSidebar: () => void;
  toggleEditorSidebar: () => void;
  setEditorSidebarOpen: (open: boolean) => void;
  
  // View preferences
  journeyListView: 'grid' | 'list';
  setJourneyListView: (view: 'grid' | 'list') => void;
  
  // Canvas
  showMinimap: boolean;
  toggleMinimap: () => void;
  
  // Context menu
  contextMenu: { x: number; y: number; nodeId?: string } | null;
  setContextMenu: (menu: { x: number; y: number; nodeId?: string } | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      },
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      sidebarOpen: true,
      nodeSidebarOpen: true,
      editorSidebarOpen: false,
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      toggleNodeSidebar: () => set({ nodeSidebarOpen: !get().nodeSidebarOpen }),
      toggleEditorSidebar: () => set({ editorSidebarOpen: !get().editorSidebarOpen }),
      setEditorSidebarOpen: (open) => set({ editorSidebarOpen: open }),

      journeyListView: 'grid',
      setJourneyListView: (view) => set({ journeyListView: view }),

      showMinimap: true,
      toggleMinimap: () => set({ showMinimap: !get().showMinimap }),

      contextMenu: null,
      setContextMenu: (menu) => set({ contextMenu: menu }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ 
        theme: state.theme, 
        journeyListView: state.journeyListView,
        showMinimap: state.showMinimap 
      }),
    }
  )
);
