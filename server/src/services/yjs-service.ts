import { WebSocketServer } from 'ws';
import * as Y from 'yjs';
// @ts-ignore - y-websocket utils
import { setupWSConnection } from 'y-websocket/bin/utils.js';
import http from 'http';

// Store Y.js documents in memory (for production, use a persistent store)
const docs = new Map<string, Y.Doc>();

export function setupYjsWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ 
    noServer: true,
    path: '/yjs'
  });

  server.on('upgrade', (request, socket, head) => {
    if (request.url?.startsWith('/yjs')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (conn, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const roomName = url.searchParams.get('room') || 'default';
    
    console.log(`New Y.js connection to room: ${roomName}`);

    // Get or create Y.Doc for this room
    if (!docs.has(roomName)) {
      docs.set(roomName, new Y.Doc());
      console.log(`Created new Y.Doc for room: ${roomName}`);
    }

    const doc = docs.get(roomName)!;

    // Setup WebSocket connection with Y.js
    setupWSConnection(conn as any, req, { 
      docName: roomName,
      gc: true 
    });

    conn.on('close', () => {
      console.log(`Y.js connection closed for room: ${roomName}`);
    });
  });

  console.log('Y.js WebSocket server configured');

  return wss;
}

// Cleanup old documents (optional, for memory management)
export function cleanupOldDocs() {
  // Implement cleanup logic based on your requirements
  // For example, remove docs that haven't been accessed in X hours
}
