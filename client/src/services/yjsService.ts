import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'ws://localhost:3001';

export class YjsService {
  private doc: Y.Doc | null = null;
  private provider: WebsocketProvider | null = null;
  private roomId: string | null = null;

  connect(roomId: string) {
    if (this.doc && this.roomId === roomId) {
      return { doc: this.doc, provider: this.provider };
    }

    // Disconnect existing connection
    this.disconnect();

    // Create new Y.Doc
    this.doc = new Y.Doc();
    this.roomId = roomId;

    // Create WebSocket provider
    const wsUrl = SERVER_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    this.provider = new WebsocketProvider(
      `${wsUrl}/yjs?room=${roomId}`,
      roomId,
      this.doc,
      {
        connect: true,
      }
    );

    this.provider.on('status', (event: { status: string }) => {
      console.log(`Y.js connection status: ${event.status}`);
    });

    this.provider.on('sync', (isSynced: boolean) => {
      console.log(`Y.js synced: ${isSynced}`);
    });

    return { doc: this.doc, provider: this.provider };
  }

  disconnect() {
    if (this.provider) {
      this.provider.disconnect();
      this.provider.destroy();
      this.provider = null;
    }
    if (this.doc) {
      this.doc.destroy();
      this.doc = null;
    }
    this.roomId = null;
  }

  getDoc() {
    return this.doc;
  }

  getProvider() {
    return this.provider;
  }

  isConnected() {
    return this.provider?.wsconnected || false;
  }
}

export const yjsService = new YjsService();
