import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { setupYjsWebSocket } from './services/yjs-service';
import { setupCollaborationHandlers } from './services/collaboration-service';
import aiRoutes from './routes/ai-routes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Socket.IO setup for real-time collaboration
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Setup Y.js WebSocket server for CRDT sync
setupYjsWebSocket(server);

// Setup collaboration handlers
setupCollaborationHandlers(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'Living Taskboard API' });
});

// AI routes
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time collaboration`);
  console.log(`📡 Y.js WebSocket server ready on ws://localhost:${PORT}`);
});

export { app, server, io };
