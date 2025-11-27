import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as Y from 'yjs';
import { setupWSConnection } from 'y-socket.io/dist/server';
import { verifyToken } from '../utils/jwt';
import { boardService } from '../services/board.service';
import { WSEvent, UserPresence } from '@living-taskboard/shared';
import redisClient from '../config/redis';

export class WebSocketServer {
  private io: Server;
  // NOTE: Current implementation uses in-memory Maps for state management.
  // For multi-instance deployment (horizontal scaling), these should be migrated to Redis:
  // - Use Redis Sets for boardRooms to track room membership across instances
  // - Use Redis Hashes for userPresence to share presence state
  // - Implement Redis pub/sub for cross-instance real-time event broadcasting
  // This will enable load balancing and high availability in production environments.
  private boardRooms = new Map<string, Set<string>>();
  private userPresence = new Map<string, UserPresence>();

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = verifyToken(token);
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupHandlers() {
    this.io.on(WSEvent.CONNECT, (socket) => {
      console.log('Client connected:', socket.id, socket.data.user?.email);

      // Join board room
      socket.on(WSEvent.JOIN_BOARD, async (boardId: string) => {
        try {
          // Verify board access
          const hasAccess = await boardService.checkBoardAccess(
            boardId,
            socket.data.user.id
          );

          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied' });
            return;
          }

          // Join socket room
          socket.join(boardId);

          // Track room membership
          if (!this.boardRooms.has(boardId)) {
            this.boardRooms.set(boardId, new Set());
          }
          this.boardRooms.get(boardId)!.add(socket.id);

          // Create user presence
          const presence: UserPresence = {
            userId: socket.data.user.id,
            userName: socket.data.user.email,
            selectedObjects: [],
            color: this.generateUserColor(socket.data.user.id),
            lastActive: new Date()
          };

          this.userPresence.set(socket.id, presence);

          // Notify others
          socket.to(boardId).emit(WSEvent.USER_JOINED, presence);

          // Send current users to new joiner
          const currentUsers = Array.from(this.boardRooms.get(boardId)!)
            .filter(id => id !== socket.id)
            .map(id => this.userPresence.get(id))
            .filter(p => p !== undefined);

          socket.emit('current_users', currentUsers);

          // Setup Y.js CRDT sync
          this.setupYjsSync(socket, boardId);

          console.log(`User ${socket.data.user.email} joined board ${boardId}`);
        } catch (error) {
          console.error('Error joining board:', error);
          socket.emit('error', { message: 'Failed to join board' });
        }
      });

      // Leave board room
      socket.on(WSEvent.LEAVE_BOARD, (boardId: string) => {
        this.handleLeaveBoard(socket, boardId);
      });

      // Cursor movement
      socket.on(WSEvent.CURSOR_MOVE, ({ boardId, cursor }) => {
        const presence = this.userPresence.get(socket.id);
        if (presence) {
          presence.cursor = cursor;
          presence.lastActive = new Date();
          socket.to(boardId).emit(WSEvent.CURSOR_MOVE, {
            userId: socket.data.user.id,
            cursor
          });
        }
      });

      // Object updates
      socket.on(WSEvent.OBJECT_CREATED, ({ boardId, object }) => {
        socket.to(boardId).emit(WSEvent.OBJECT_CREATED, object);
        this.saveToCache(boardId, 'object_created', object);
      });

      socket.on(WSEvent.OBJECT_UPDATED, ({ boardId, object }) => {
        socket.to(boardId).emit(WSEvent.OBJECT_UPDATED, object);
        this.saveToCache(boardId, 'object_updated', object);
      });

      socket.on(WSEvent.OBJECT_DELETED, ({ boardId, objectId }) => {
        socket.to(boardId).emit(WSEvent.OBJECT_DELETED, objectId);
        this.saveToCache(boardId, 'object_deleted', { objectId });
      });

      // WebRTC signaling for voice/video
      socket.on(WSEvent.WEBRTC_OFFER, ({ boardId, targetUserId, offer }) => {
        socket.to(boardId).emit(WSEvent.WEBRTC_OFFER, {
          fromUserId: socket.data.user.id,
          targetUserId,
          offer
        });
      });

      socket.on(WSEvent.WEBRTC_ANSWER, ({ boardId, targetUserId, answer }) => {
        socket.to(boardId).emit(WSEvent.WEBRTC_ANSWER, {
          fromUserId: socket.data.user.id,
          targetUserId,
          answer
        });
      });

      socket.on(WSEvent.WEBRTC_ICE_CANDIDATE, ({ boardId, targetUserId, candidate }) => {
        socket.to(boardId).emit(WSEvent.WEBRTC_ICE_CANDIDATE, {
          fromUserId: socket.data.user.id,
          targetUserId,
          candidate
        });
      });

      // Disconnect
      socket.on(WSEvent.DISCONNECT, () => {
        console.log('Client disconnected:', socket.id);

        // Leave all rooms
        this.boardRooms.forEach((sockets, boardId) => {
          if (sockets.has(socket.id)) {
            this.handleLeaveBoard(socket, boardId);
          }
        });

        this.userPresence.delete(socket.id);
      });
    });
  }

  private setupYjsSync(socket: any, boardId: string) {
    // Create or get Y.Doc for this board
    const doc = new Y.Doc();

    // Setup WebSocket connection for Y.js
    setupWSConnection(socket, doc, {
      docName: boardId,
      gc: true
    });
  }

  private handleLeaveBoard(socket: any, boardId: string) {
    socket.leave(boardId);

    const room = this.boardRooms.get(boardId);
    if (room) {
      room.delete(socket.id);
      if (room.size === 0) {
        this.boardRooms.delete(boardId);
      }
    }

    const presence = this.userPresence.get(socket.id);
    if (presence) {
      socket.to(boardId).emit(WSEvent.USER_LEFT, {
        userId: socket.data.user.id
      });
    }
  }

  private generateUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  private async saveToCache(boardId: string, eventType: string, data: any) {
    try {
      const key = `board:${boardId}:events`;
      await redisClient.lpush(key, JSON.stringify({ eventType, data, timestamp: Date.now() }));
      await redisClient.ltrim(key, 0, 999); // Keep last 1000 events
      await redisClient.expire(key, 3600); // Expire after 1 hour
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  getIO() {
    return this.io;
  }
}
