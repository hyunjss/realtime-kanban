import { io, type Socket } from 'socket.io-client';
import { socketStore } from '@/store/socketStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000';
const DEFAULT_BOARD_ID = 'default';

let socket: Socket | null = null;

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected';

/**
 * Get or create the Socket.io client. Connects with boardId for room join.
 * Auto-reconnect is handled by Socket.io by default.
 */
export function getSocket(boardId: string = DEFAULT_BOARD_ID): Socket {
  if (socket?.connected) {
    return socket;
  }
  if (socket) {
    socket.connect();
    return socket;
  }

  socketStore.getState().setStatus('connecting');
  socketStore.getState().setError(null);

  const instance = io(SOCKET_URL, {
    query: { boardId },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  instance.on('connect', () => {
    socketStore.getState().setStatus('connected');
    socketStore.getState().setError(null);
    socketStore.getState().setMySocketId(instance.id ?? null);
  });

  instance.on('connect_error', (err) => {
    socketStore.getState().setStatus('disconnected');
    socketStore.getState().setError(err.message ?? 'Connection failed');
  });

  instance.on('disconnect', (reason) => {
    socketStore.getState().setStatus('disconnected');
    if (reason === 'io server disconnect') {
      socketStore.getState().setError('Server disconnected');
    }
  });

  socket = instance;
  return instance;
}

/**
 * Disconnect and clear the socket instance (e.g. on unmount or board change).
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
  }
  socketStore.getState().setStatus('idle');
  socketStore.getState().setError(null);
  socketStore.getState().setMySocketId(null);
}

export const SOCKET_EVENTS = {
  CARD_CREATED: 'card:created',
  CARD_UPDATED: 'card:updated',
  CARD_DELETED: 'card:deleted',
  CARD_MOVED: 'card:moved',
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
} as const;
