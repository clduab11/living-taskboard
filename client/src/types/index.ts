export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  viewport?: { x: number; y: number; zoom: number };
}

export interface CanvasObject {
  id: string;
  type: 'path' | 'rect' | 'circle' | 'text' | 'sticky' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  text?: string;
  path?: string;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
}

export type DrawingTool = 
  | 'select' 
  | 'pen' 
  | 'eraser' 
  | 'text' 
  | 'rectangle' 
  | 'circle' 
  | 'line' 
  | 'sticky'
  | 'pan';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'flowchart' | 'wireframe' | 'mindmap' | 'kanban' | 'other';
  thumbnail?: string;
  objects: CanvasObject[];
}

export type ExportFormat = 'png' | 'pdf' | 'svg' | 'json';

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}
