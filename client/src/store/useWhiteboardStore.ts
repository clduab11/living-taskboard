import { create } from 'zustand';
import type { DrawingTool, User, ViewportState } from '../types';

interface WhiteboardState {
  // Canvas state
  selectedTool: DrawingTool;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fontSize: number;
  
  // Viewport state
  viewport: ViewportState;
  
  // Collaboration state
  roomId: string | null;
  currentUser: User | null;
  users: User[];
  
  // UI state
  isDarkMode: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  
  // Actions
  setSelectedTool: (tool: DrawingTool) => void;
  setStrokeColor: (color: string) => void;
  setFillColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFontSize: (size: number) => void;
  setViewport: (viewport: ViewportState) => void;
  setRoomId: (roomId: string | null) => void;
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUserCursor: (userId: string, cursor: { x: number; y: number }) => void;
  toggleDarkMode: () => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
}

export const useWhiteboardStore = create<WhiteboardState>((set) => ({
  // Initial state
  selectedTool: 'select',
  strokeColor: '#000000',
  fillColor: 'transparent',
  strokeWidth: 2,
  fontSize: 16,
  
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  },
  
  roomId: null,
  currentUser: null,
  users: [],
  
  isDarkMode: false,
  showGrid: true,
  snapToGrid: false,
  
  // Actions
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setFontSize: (size) => set({ fontSize: size }),
  setViewport: (viewport) => set({ viewport }),
  setRoomId: (roomId) => set({ roomId }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  removeUser: (userId) => set((state) => ({ 
    users: state.users.filter(u => u.id !== userId) 
  })),
  updateUserCursor: (userId, cursor) => set((state) => ({
    users: state.users.map(u => 
      u.id === userId ? { ...u, cursor } : u
    )
  })),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
}));
