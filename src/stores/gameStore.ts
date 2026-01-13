'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  GameRoom,
  GamePlayer,
  AuctionState,
  Bid,
  SoldPlayer,
  GameResult,
  Player
} from '@/types';
import { getSocket, connectSocket, disconnectSocket, type GameSocket } from '@/lib/socket';

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

interface GameState {
  // Connection
  socket: GameSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Room
  room: GameRoom | null;
  currentPlayer: GamePlayer | null;
  opponent: GamePlayer | null;

  // Auction
  currentAuction: AuctionState | null;
  lastBid: Bid | null;

  // Game result
  gameResult: GameResult | null;

  // UI State
  notification: { message: string; type: 'info' | 'success' | 'error' } | null;
  chatMessages: ChatMessage[];

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  createRoom: (playerName: string) => Promise<GameRoom>;
  joinRoom: (roomId: string, playerName: string) => Promise<void>;
  leaveRoom: () => void;
  setReady: (isReady: boolean) => void;
  startGame: () => void;
  placeBid: (amount: number) => void;
  skipBid: () => void;
  setNotification: (notification: { message: string; type: 'info' | 'success' | 'error' } | null) => void;
  reset: () => void;
  rejoinSession: () => Promise<void>;
  sendMessage: (message: string) => void;
}

const initialState = {
  socket: null,
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  room: null,
  currentPlayer: null,
  opponent: null,
  currentAuction: null,
  lastBid: null,
  gameResult: null,
  notification: null,
  chatMessages: [],
};

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    connect: async () => {
      const state = get();
      if (state.isConnected || state.isConnecting) return;

      set({ isConnecting: true, connectionError: null });

      try {
        const socket = await connectSocket();

        // Handle disconnection
        socket.on('disconnect', () => {
          console.log('🔌 Disconnected from server');
          set({ isConnected: false });
        });

        socket.on('connect', () => {
          console.log('🔌 Reconnected to server');
          set({ isConnected: true });
        });

        set({ socket, isConnected: true, isConnecting: false });

        // Set up event listeners
        socket.on('room:updated', (room) => {
          const currentPlayer = room.players.find(p => p.socketId === socket.id);
          const opponent = room.players.find(p => p.socketId !== socket.id);
          set({ room, currentPlayer: currentPlayer || null, opponent: opponent || null });
        });

        socket.on('room:player-left', (playerId) => {
          set({
            notification: { message: 'Opponent left the room', type: 'info' },
            opponent: null
          });
        });

        socket.on('room:error', (message) => {
          set({ notification: { message, type: 'error' } });
        });

        socket.on('game:started', (room) => {
          set({ room, notification: { message: 'Game started! Get ready to bid!', type: 'success' } });
        });

        socket.on('game:auction-start', (auction) => {
          set({
            currentAuction: auction,
            lastBid: null,
            notification: { message: `Now bidding: ${auction.player.name}`, type: 'info' }
          });
        });

        socket.on('game:bid-placed', (bid, auction) => {
          set({ currentAuction: auction, lastBid: bid });
        });

        socket.on('game:auction-update', (auction) => {
          set({ currentAuction: auction });
        });

        socket.on('game:player-sold', (sold, room) => {
          const currentPlayer = room.players.find(p => p.socketId === socket.id);
          const opponent = room.players.find(p => p.socketId !== socket.id);
          set({
            room,
            currentPlayer: currentPlayer || null,
            opponent: opponent || null,
            notification: {
              message: `${sold.player.name} sold to ${sold.buyerName} for ${formatMoney(sold.price)}!`,
              type: 'success'
            }
          });
        });

        socket.on('game:player-unsold', (player) => {
          set({
            notification: { message: `${player.name} went unsold`, type: 'info' }
          });
        });

        socket.on('room:chat', (message) => {
          set(state => ({
            chatMessages: [...state.chatMessages, message]
          }));
        });

        socket.on('game:finished', (result, room) => {
          set({
            gameResult: result,
            room,
            notification: {
              message: `Game Over! ${result.winner.name} wins!`,
              type: 'success'
            }
          });
        });

      } catch (error: any) {
        console.error('Connection failed:', error);
        set({
          isConnecting: false,
          isConnected: false,
          connectionError: error?.message || 'Failed to connect to game server'
        });
      }
    },

    disconnect: () => {
      disconnectSocket();
      set(initialState);
    },

    createRoom: async (playerName: string): Promise<GameRoom> => {
      const socket = get().socket;
      if (!socket) throw new Error('Not connected');

      return new Promise((resolve, reject) => {
        socket.emit('room:create', playerName, (room) => {
          const currentPlayer = room.players.find(p => p.socketId === socket.id);

          if (currentPlayer) {
            localStorage.setItem('football_auction_player_id', currentPlayer.id);
            localStorage.setItem('football_auction_room_id', room.id);
            localStorage.setItem('football_auction_player_name', currentPlayer.name);
          }

          set({ room, currentPlayer: currentPlayer || null });
          resolve(room);
        });

        setTimeout(() => reject(new Error('Timeout creating room')), 10000);
      });
    },

    joinRoom: async (roomId: string, playerName: string) => {
      const socket = get().socket;
      if (!socket) throw new Error('Not connected');

      // Check for stored playerId to attempt reconnection
      const storedPlayerId = localStorage.getItem('football_auction_player_id');

      return new Promise<void>((resolve, reject) => {
        // Pass storedPlayerId (or null) to server
        socket.emit('room:join', roomId, playerName, storedPlayerId, (success, room, player, error) => {
          if (success && room && player) {
            // Persist session
            localStorage.setItem('football_auction_player_id', player.id);
            localStorage.setItem('football_auction_room_id', roomId);
            localStorage.setItem('football_auction_player_name', player.name);

            const opponent = room.players.find(p => p.id !== player.id);
            set({ room, currentPlayer: player, opponent: opponent || null });
            resolve();
          } else {
            // If failed (e.g. room invalid), clear storage
            localStorage.removeItem('football_auction_player_id');
            localStorage.removeItem('football_auction_room_id');
            localStorage.removeItem('football_auction_player_name');
            reject(new Error(error || 'Failed to join room'));
          }
        });

        setTimeout(() => reject(new Error('Timeout joining room')), 10000);
      });
    },

    rejoinSession: async () => {
      const roomId = localStorage.getItem('football_auction_room_id');
      const playerName = localStorage.getItem('football_auction_player_name');

      if (roomId && playerName) {
        console.log('🔄 Attempting to rejoin session...', { roomId, playerName });
        try {
          await get().connect();
          // Short delay to ensure socket is ready
          await new Promise(resolve => setTimeout(resolve, 500));
          await get().joinRoom(roomId, playerName);
          console.log('✅ Rejoined session successfully');
        } catch (error) {
          console.warn('❌ Failed to rejoin session:', error);
          // Clear invalid session
          localStorage.removeItem('football_auction_player_id');
          localStorage.removeItem('football_auction_room_id');
          localStorage.removeItem('football_auction_player_name');
        }
      }
    },

    sendMessage: (message: string) => {
      const socket = get().socket;
      if (socket) {
        socket.emit('room:chat', message);
      }
    },

    leaveRoom: () => {
      const socket = get().socket;
      if (socket) {
        socket.emit('room:leave');
      }
      set({ room: null, currentPlayer: null, opponent: null, currentAuction: null, gameResult: null });
    },

    setReady: (isReady: boolean) => {
      const socket = get().socket;
      if (socket) {
        socket.emit('room:ready', isReady);
      }
    },

    startGame: () => {
      const socket = get().socket;
      if (socket) {
        socket.emit('game:start');
      }
    },

    placeBid: (amount: number) => {
      const socket = get().socket;
      if (socket) {
        socket.emit('game:bid', amount);
      }
    },

    skipBid: () => {
      // Just don't bid - timer will handle it
    },

    setNotification: (notification) => {
      set({ notification });
    },

    reset: () => {
      get().leaveRoom();
      set({ ...initialState, socket: get().socket, isConnected: get().isConnected });
    },
  }))
);

function formatMoney(amount: number): string {
  if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(2)}B`;
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  return `$${amount.toLocaleString()}`;
}
