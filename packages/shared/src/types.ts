// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  TEAM = 'team'
}

// Board types
export interface Board {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  visibility: BoardVisibility;
  settings: BoardSettings;
  createdAt: Date;
  updatedAt: Date;
}

export enum BoardVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  TEAM = 'team'
}

export interface BoardSettings {
  backgroundColor: string;
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  width?: number;
  height?: number;
}

// Board object types
export interface CanvasObject {
  id: string;
  boardId: string;
  type: ObjectType;
  position: Position;
  size: Size;
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  layerId?: string;
  groupId?: string;
  data: ObjectData;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ObjectType {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  TRIANGLE = 'triangle',
  LINE = 'line',
  ARROW = 'arrow',
  TEXT = 'text',
  STICKY_NOTE = 'stickyNote',
  IMAGE = 'image',
  SHAPE = 'shape',
  PATH = 'path',
  GROUP = 'group'
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type ObjectData =
  | RectangleData
  | CircleData
  | TextData
  | StickyNoteData
  | ImageData
  | PathData;

export interface RectangleData {
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
}

export interface CircleData {
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
}

export interface TextData {
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface StickyNoteData {
  text: string;
  color: string;
  fontSize: number;
}

export interface ImageData {
  url: string;
  opacity: number;
}

export interface PathData {
  pathData: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

// Layer types
export interface Layer {
  id: string;
  boardId: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
}

// Permission types
export interface BoardPermission {
  id: string;
  boardId: string;
  userId: string;
  role: BoardRole;
  createdAt: Date;
}

export enum BoardRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

// Comment types
export interface Comment {
  id: string;
  boardId: string;
  objectId?: string;
  userId: string;
  parentId?: string;
  content: string;
  position?: Position;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Template types
export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  data: CanvasObject[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
}

export enum TemplateCategory {
  FLOWCHART = 'flowchart',
  MIND_MAP = 'mindMap',
  WIREFRAME = 'wireframe',
  DIAGRAM = 'diagram',
  KANBAN = 'kanban',
  OTHER = 'other'
}

// Real-time collaboration types
export interface UserPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  cursor?: Position;
  selectedObjects: string[];
  color: string;
  lastActive: Date;
}

// WebSocket events
export enum WSEvent {
  // Connection
  CONNECT = 'connection',
  DISCONNECT = 'disconnect',
  JOIN_BOARD = 'join_board',
  LEAVE_BOARD = 'leave_board',

  // Object updates
  OBJECT_CREATED = 'object_created',
  OBJECT_UPDATED = 'object_updated',
  OBJECT_DELETED = 'object_deleted',
  OBJECTS_BATCH_UPDATE = 'objects_batch_update',

  // Collaboration
  CURSOR_MOVE = 'cursor_move',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  PRESENCE_UPDATE = 'presence_update',

  // Comments
  COMMENT_ADDED = 'comment_added',
  COMMENT_UPDATED = 'comment_updated',
  COMMENT_DELETED = 'comment_deleted',

  // Voice/Video
  WEBRTC_OFFER = 'webrtc_offer',
  WEBRTC_ANSWER = 'webrtc_answer',
  WEBRTC_ICE_CANDIDATE = 'webrtc_ice_candidate'
}

// API Request/Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateBoardRequest {
  name: string;
  description?: string;
  visibility: BoardVisibility;
  settings?: Partial<BoardSettings>;
}

export interface UpdateBoardRequest {
  name?: string;
  description?: string;
  visibility?: BoardVisibility;
  settings?: Partial<BoardSettings>;
}

// AI types
export interface AIGenerateRequest {
  prompt: string;
  boardId: string;
  type: AIGenerationType;
  context?: any;
}

export enum AIGenerationType {
  MIND_MAP = 'mindMap',
  FLOWCHART = 'flowchart',
  DIAGRAM = 'diagram',
  SKETCH_TO_DIAGRAM = 'sketchToDiagram',
  AUTO_LAYOUT = 'autoLayout',
  MEETING_NOTES = 'meetingNotes',
  SMART_SHAPES = 'smartShapes'
}

export interface AIGenerateResponse {
  objects: CanvasObject[];
  suggestions?: string[];
}

// Export types
export interface ExportRequest {
  boardId: string;
  format: ExportFormat;
  quality?: number;
  scale?: number;
  area?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export enum ExportFormat {
  PNG = 'png',
  PDF = 'pdf',
  SVG = 'svg',
  JSON = 'json'
}

// Version history
export interface BoardVersion {
  id: string;
  boardId: string;
  version: number;
  snapshot: CanvasObject[];
  createdBy: string;
  createdAt: Date;
  description?: string;
}
