// Player Types
export interface Player {
  _id: string;
  name: string;
  rating: number;
  position: Position;
  version: string;
  age: number;
  images: {
    playerFace: string;
    nationFlag: string;
    clubBadge: string;
    leagueLogo: string;
  };
  overallStats: {
    paceOverall: number;
    shootingOverall: number;
    passingOverall: number;
    dribblingOverall: number;
    defendingOverall: number;
    physicalOverall: number;
  };
  basePrice: number;
  rarity: Rarity;
  altPositions?: string[];
}

export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' | 'LW' | 'RW' | 'ST';

export type Rarity = 'legendary' | 'epic' | 'rare' | 'common';

// AI Difficulty
export type AIDifficulty = 'easy' | 'medium' | 'hard';

// Game Types
export interface GameRoom {
  id: string;
  name: string;
  players: GamePlayer[];
  status: GameStatus;
  currentAuction: AuctionState | null;
  auctionQueue: Player[];
  soldPlayers: SoldPlayer[];
  settings: GameSettings;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  isAIGame?: boolean;
  aiDifficulty?: AIDifficulty;
}

export interface GamePlayer {
  id: string;
  name: string;
  socketId: string | null;
  budget: number;
  squad: Player[];
  isReady: boolean;
  isConnected: boolean;
  color: 'cyan' | 'purple';
  isAI?: boolean;
  difficulty?: AIDifficulty;
}

export interface GameSettings {
  startingBudget: number;
  squadSize: number;
  auctionTimeLimit: number; // seconds
  minBidIncrement: number;
  totalPlayers: number; // number of players to auction
}

export type GameStatus = 'waiting' | 'ready' | 'auction' | 'finished';

// Auction Types
export interface AuctionState {
  player: Player;
  currentBid: number;
  currentBidder: string | null;
  timeRemaining: number;
  bidHistory: Bid[];
  status: 'active' | 'going_once' | 'going_twice' | 'sold' | 'unsold';
}

export interface Bid {
  playerId: string;
  playerName: string;
  amount: number;
  timestamp: Date;
  isAI?: boolean;
}

export interface SoldPlayer {
  player: Player;
  buyerId: string;
  buyerName: string;
  price: number;
  auctionNumber: number;
}

// Scoring Types
export interface TeamScore {
  playerId: string;
  playerName: string;
  totalScore: number;
  breakdown: {
    averageRating: number;
    ratingScore: number;
    positionBalance: number;
    positionScore: number;
    synergy: number;
    synergyScore: number;
  };
  squad: Player[];
  formation: Formation;
}

export interface Formation {
  name: string;
  positions: Position[];
}

export interface GameResult {
  winner: GamePlayer;
  loser: GamePlayer;
  winnerScore: TeamScore;
  loserScore: TeamScore;
  scoreDifference: number;
  mvp: Player;
}

// Socket Events
export interface ServerToClientEvents {
  'room:created': (room: GameRoom) => void;
  'room:joined': (room: GameRoom, player: GamePlayer) => void;
  'room:updated': (room: GameRoom) => void;
  'room:player-left': (playerId: string) => void;
  'room:error': (message: string) => void;
  
  'game:started': (room: GameRoom) => void;
  'game:auction-start': (auction: AuctionState) => void;
  'game:bid-placed': (bid: Bid, auction: AuctionState) => void;
  'game:auction-update': (auction: AuctionState) => void;
  'game:player-sold': (sold: SoldPlayer, room: GameRoom) => void;
  'game:player-unsold': (player: Player) => void;
  'game:finished': (result: GameResult, room: GameRoom) => void;
  
  'player:budget-updated': (playerId: string, newBudget: number) => void;
  'player:reconnected': (player: GamePlayer) => void;
}

export interface ClientToServerEvents {
  'room:create': (playerName: string, callback: (room: GameRoom) => void) => void;
  'room:create-with-ai': (playerName: string, difficulty: AIDifficulty, callback: (room: GameRoom, player: GamePlayer) => void) => void;
  'room:join': (roomId: string, playerName: string, callback: (success: boolean, room?: GameRoom, player?: GamePlayer, error?: string) => void) => void;
  'room:leave': () => void;
  'room:ready': (isReady: boolean) => void;
  
  'game:start': () => void;
  'game:bid': (amount: number) => void;
  'game:skip': () => void;
}
