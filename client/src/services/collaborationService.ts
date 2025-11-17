import { io, Socket } from 'socket.io-client';
import type { User } from '../types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export class CollaborationService {
  private socket: Socket | null = null;
  private roomId: string | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SERVER_URL, {
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to collaboration server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from collaboration server');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      if (this.roomId) {
        this.socket.emit('leave-room', this.roomId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.roomId = null;
    }
  }

  joinRoom(roomId: string, user: User) {
    if (!this.socket) {
      this.connect();
    }
    
    this.roomId = roomId;
    this.socket?.emit('join-room', { roomId, user });
  }

  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit('leave-room', this.roomId);
      this.roomId = null;
    }
  }

  sendCursorMove(cursor: { x: number; y: number }) {
    if (this.socket && this.roomId) {
      this.socket.emit('cursor-move', { roomId: this.roomId, cursor });
    }
  }

  sendViewportChange(viewport: { x: number; y: number; zoom: number }) {
    if (this.socket && this.roomId) {
      this.socket.emit('viewport-change', { roomId: this.roomId, viewport });
    }
  }

  onUserJoined(callback: (user: User) => void) {
    this.socket?.on('user-joined', callback);
  }

  onUserLeft(callback: (userId: string) => void) {
    this.socket?.on('user-left', callback);
  }

  onRoomUsers(callback: (users: User[]) => void) {
    this.socket?.on('room-users', callback);
  }

  onUserCursorMove(callback: (data: { userId: string; cursor: { x: number; y: number } }) => void) {
    this.socket?.on('user-cursor-move', callback);
  }

  onUserViewportChange(callback: (data: { userId: string; viewport: { x: number; y: number; zoom: number } }) => void) {
    this.socket?.on('user-viewport-change', callback);
  }

  // WebRTC signaling methods
  sendOffer(targetUserId: string, offer: RTCSessionDescriptionInit) {
    if (this.socket && this.roomId) {
      this.socket.emit('webrtc-offer', { roomId: this.roomId, targetUserId, offer });
    }
  }

  sendAnswer(targetUserId: string, answer: RTCSessionDescriptionInit) {
    if (this.socket && this.roomId) {
      this.socket.emit('webrtc-answer', { roomId: this.roomId, targetUserId, answer });
    }
  }

  sendIceCandidate(targetUserId: string, candidate: RTCIceCandidate) {
    if (this.socket && this.roomId) {
      this.socket.emit('webrtc-ice-candidate', { roomId: this.roomId, targetUserId, candidate });
    }
  }

  onWebRTCOffer(callback: (data: { userId: string; offer: RTCSessionDescriptionInit }) => void) {
    this.socket?.on('webrtc-offer', callback);
  }

  onWebRTCAnswer(callback: (data: { userId: string; answer: RTCSessionDescriptionInit }) => void) {
    this.socket?.on('webrtc-answer', callback);
  }

  onWebRTCIceCandidate(callback: (data: { userId: string; candidate: RTCIceCandidate }) => void) {
    this.socket?.on('webrtc-ice-candidate', callback);
  }
}

export const collaborationService = new CollaborationService();
