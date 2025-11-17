import { create } from 'zustand';
import { CanvasObject, ObjectType } from '@living-taskboard/shared';

interface Tool {
  type: 'select' | 'pen' | 'rectangle' | 'circle' | 'text' | 'sticky' | 'eraser';
  color?: string;
  strokeWidth?: number;
}

interface CanvasState {
  objects: CanvasObject[];
  selectedIds: string[];
  activeTool: Tool;
  zoom: number;
  pan: { x: number; y: number };
  gridEnabled: boolean;
  snapToGrid: boolean;

  setObjects: (objects: CanvasObject[]) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  deleteObject: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  setActiveTool: (tool: Tool) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  objects: [],
  selectedIds: [],
  activeTool: { type: 'select' },
  zoom: 1,
  pan: { x: 0, y: 0 },
  gridEnabled: true,
  snapToGrid: false,

  setObjects: (objects) => set({ objects }),

  addObject: (object) => set((state) => ({
    objects: [...state.objects, object]
  })),

  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map(obj =>
      obj.id === id ? { ...obj, ...updates, updatedAt: new Date() } : obj
    )
  })),

  deleteObject: (id) => set((state) => ({
    objects: state.objects.filter(obj => obj.id !== id),
    selectedIds: state.selectedIds.filter(selId => selId !== id)
  })),

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  setPan: (pan) => set({ pan }),

  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
}));
