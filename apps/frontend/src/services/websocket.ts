import { io, Socket } from 'socket.io-client';
import { WSEvent, UserPresence } from '@living-taskboard/shared';
import { useAuthStore } from '../store/authStore';
import { useCanvasStore } from '../store/canvasStore';
import { useCollaborationStore } from '../store/collaborationStore';

class WebSocketService {
  private socket: Socket | null = null;
  private currentBoardId: string | null = null;

  connect() {
    const token = useAuthStore.getState().token;

    if (!token) {
      console.error('No auth token available');
      return;
    }

    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
    });

    // User presence
    this.socket.on(WSEvent.USER_JOINED, (user: UserPresence) => {
      useCollaborationStore.getState().addUser(user);
    });

    this.socket.on(WSEvent.USER_LEFT, ({ userId }: { userId: string }) => {
      useCollaborationStore.getState().removeUser(userId);
    });

    this.socket.on('current_users', (users: UserPresence[]) => {
      users.forEach(user => {
        useCollaborationStore.getState().addUser(user);
      });
    });

    // Cursor updates
    this.socket.on(WSEvent.CURSOR_MOVE, ({ userId, cursor }: any) => {
      useCollaborationStore.getState().updateUserCursor(userId, cursor);
    });

    // Object updates
    this.socket.on(WSEvent.OBJECT_CREATED, (object: any) => {
      useCanvasStore.getState().addObject(object);
    });

    this.socket.on(WSEvent.OBJECT_UPDATED, (object: any) => {
      useCanvasStore.getState().updateObject(object.id, object);
    });

    this.socket.on(WSEvent.OBJECT_DELETED, (objectId: string) => {
      useCanvasStore.getState().deleteObject(objectId);
    });
  }

  joinBoard(boardId: string) {
    if (!this.socket) return;

    this.currentBoardId = boardId;
    this.socket.emit(WSEvent.JOIN_BOARD, boardId);
  }

  leaveBoard(boardId: string) {
    if (!this.socket) return;

    this.socket.emit(WSEvent.LEAVE_BOARD, boardId);
    this.currentBoardId = null;
  }

  sendCursorMove(cursor: { x: number; y: number }) {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit(WSEvent.CURSOR_MOVE, {
      boardId: this.currentBoardId,
      cursor,
    });
  }

  sendObjectCreated(object: any) {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit(WSEvent.OBJECT_CREATED, {
      boardId: this.currentBoardId,
      object,
    });
  }

  sendObjectUpdated(object: any) {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit(WSEvent.OBJECT_UPDATED, {
      boardId: this.currentBoardId,
      object,
    });
  }

  sendObjectDeleted(objectId: string) {
    if (!this.socket || !this.currentBoardId) return;

    this.socket.emit(WSEvent.OBJECT_DELETED, {
      boardId: this.currentBoardId,
      objectId,
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const wsService = new WebSocketService();
