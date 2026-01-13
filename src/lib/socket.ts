import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: GameSocket | null = null;

export const getSocket = (): GameSocket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const connectSocket = (): Promise<GameSocket> => {
  return new Promise((resolve, reject) => {
    const s = getSocket();
    
    if (s.connected) {
      console.log('🔌 Already connected');
      resolve(s);
      return;
    }

    // Set up one-time listeners for this connection attempt
    const onConnect = () => {
      console.log('🔌 Connected to game server');
      cleanup();
      resolve(s);
    };

    const onConnectError = (error: Error) => {
      console.error('❌ Connection error:', error.message);
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      s.off('connect', onConnect);
      s.off('connect_error', onConnectError);
    };

    s.on('connect', onConnect);
    s.on('connect_error', onConnectError);

    // Set a timeout for connection
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Connection timeout'));
    }, 10000);

    s.once('connect', () => clearTimeout(timeout));

    s.connect();
  });
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
