import { Server as SocketIOServer, Socket } from 'socket.io';

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  viewport?: { x: number; y: number; zoom: number };
}

interface Room {
  users: Map<string, User>;
}

const rooms = new Map<string, Room>();

export function setupCollaborationHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a room
    socket.on('join-room', ({ roomId, user }: { roomId: string; user: User }) => {
      socket.join(roomId);

      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { users: new Map() });
      }

      const room = rooms.get(roomId)!;
      user.id = socket.id;
      room.users.set(socket.id, user);

      // Notify others in the room
      socket.to(roomId).emit('user-joined', user);

      // Send current users to the new user
      const currentUsers = Array.from(room.users.values()).filter(u => u.id !== socket.id);
      socket.emit('room-users', currentUsers);

      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle cursor movement
    socket.on('cursor-move', ({ roomId, cursor }: { roomId: string; cursor: { x: number; y: number } }) => {
      const room = rooms.get(roomId);
      if (room && room.users.has(socket.id)) {
        const user = room.users.get(socket.id)!;
        user.cursor = cursor;
        socket.to(roomId).emit('user-cursor-move', { userId: socket.id, cursor });
      }
    });

    // Handle viewport changes
    socket.on('viewport-change', ({ roomId, viewport }: { roomId: string; viewport: { x: number; y: number; zoom: number } }) => {
      const room = rooms.get(roomId);
      if (room && room.users.has(socket.id)) {
        const user = room.users.get(socket.id)!;
        user.viewport = viewport;
        socket.to(roomId).emit('user-viewport-change', { userId: socket.id, viewport });
      }
    });

    // Handle voice/video signaling
    socket.on('webrtc-offer', ({ roomId, targetUserId, offer }) => {
      socket.to(targetUserId).emit('webrtc-offer', { userId: socket.id, offer });
    });

    socket.on('webrtc-answer', ({ roomId, targetUserId, answer }) => {
      socket.to(targetUserId).emit('webrtc-answer', { userId: socket.id, answer });
    });

    socket.on('webrtc-ice-candidate', ({ roomId, targetUserId, candidate }) => {
      socket.to(targetUserId).emit('webrtc-ice-candidate', { userId: socket.id, candidate });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      // Remove user from all rooms
      rooms.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          socket.to(roomId).emit('user-left', socket.id);
          
          // Clean up empty rooms
          if (room.users.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });

    // Leave room
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      const room = rooms.get(roomId);
      if (room && room.users.has(socket.id)) {
        room.users.delete(socket.id);
        socket.to(roomId).emit('user-left', socket.id);
      }
    });
  });

  console.log('Collaboration handlers configured');
}
