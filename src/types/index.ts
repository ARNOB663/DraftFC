// Player Types
export interface Player {
  _id: string;
  name: string;
  rating: number;
  position: Position;
  version: string;
  age: number;
  club?: string;
  nation?: string;
  league?: string;
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

export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'FWD';

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
  totalSpent?: number; // Track total money spent
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

// ============================================
// ADVANCED SCORING SYSTEM - 5 PILLARS
// ============================================

// Squad Validation
export interface SquadValidation {
  isValid: boolean;
  hasElevenPlayers: boolean;
  hasGoalkeeper: boolean;
  hasMinDefenders: boolean; // At least 3
  hasMinMidfielders: boolean; // At least 2
  hasMinForwards: boolean; // At least 1
  errors: string[];
  positionCounts: {
    GK: number;
    DEF: number;
    MID: number;
    FWD: number;
  };
}

// Formation Types
export interface Formation {
  name: string;
  positions: Position[];
  displayName: string;
  structure: string; // e.g., "4-3-3"
}

// The 5 Pillars of Scoring
export interface PowerScore {
  total: number; // 0-100
  avgOverall: number;
  keyStatsAvg: number;
  superstarBonus: number; // Players 90+
  legendaryBonus: number; // Legendary rarity
  details: {
    attackPower: number;
    midfieldControl: number;
    defensiveSolidity: number;
    goalkeepingQuality: number;
  };
}

export interface TacticalScore {
  total: number; // 0-100
  naturalPositions: number; // Players in their main position
  secondaryPositions: number; // Players in alt positions
  outOfPosition: number; // Penalties
  formationFit: number;
  roleBalance: number;
  details: {
    positionMatches: { player: string; position: Position; bonus: number }[];
    penalties: { player: string; issue: string; penalty: number }[];
  };
}

export interface ChemistryScore {
  total: number; // 0-100
  clubLinks: number;
  leagueLinks: number;
  nationLinks: number;
  playstyleBonus: number;
  lineLinks: number; // DEF-MID, MID-ATK connections
  details: {
    links: { player1: string; player2: string; type: string; bonus: number }[];
    strongLinks: number;
    weakLinks: number;
  };
}

export interface BalanceScore {
  total: number; // 0-100
  positionCoverage: number;
  wingBalance: number; // Left/Right coverage
  ageDistribution: number;
  depthScore: number;
  details: {
    hasGK: boolean;
    defenderCount: number;
    midfielderCount: number;
    forwardCount: number;
    leftSideCount: number;
    rightSideCount: number;
    avgAge: number;
    penalties: { issue: string; penalty: number }[];
  };
}

export interface ManagerIQScore {
  total: number; // 0-100
  budgetEfficiency: number; // Power per dollar spent
  stealBids: number; // Players bought below market value
  squadCompletion: number; // How quickly 11 was reached
  riskManagement: number; // Balanced spending
  details: {
    totalSpent: number;
    remainingBudget: number;
    avgPricePerPlayer: number;
    bestValueSigning: { player: string; price: number; value: number } | null;
    worstValueSigning: { player: string; price: number; value: number } | null;
    earlySpending: number; // % spent in first half
    lateSpending: number; // % spent in second half
  };
}

// Complete Team Analysis
export interface TeamAnalysis {
  playerId: string;
  playerName: string;
  squad: Player[];
  validation: SquadValidation;
  
  // The 5 Pillars
  power: PowerScore;
  tactical: TacticalScore;
  chemistry: ChemistryScore;
  balance: BalanceScore;
  managerIQ: ManagerIQScore;
  
  // Final Score (weighted)
  finalScore: number;
  
  // Formation determined
  formation: Formation;
  
  // Awards & Highlights
  mvp: Player | null;
  bestTacticalChoice: Player | null;
  bestValueSigning: Player | null;
}

// Score Weights Configuration
export interface ScoreWeights {
  power: number; // 0.30
  tactical: number; // 0.20
  chemistry: number; // 0.20
  balance: number; // 0.15
  managerIQ: number; // 0.15
}

// Enhanced Team Score (replacing old TeamScore)
export interface TeamScore {
  playerId: string;
  playerName: string;
  totalScore: number;
  
  // Legacy compatibility
  breakdown: {
    averageRating: number;
    ratingScore: number;
    positionBalance: number;
    positionScore: number;
    synergy: number;
    synergyScore: number;
  };
  
  // New Advanced System
  analysis: TeamAnalysis;
  
  squad: Player[];
  formation: Formation;
}

// Enhanced Game Result
export interface GameResult {
  winner: GamePlayer;
  loser: GamePlayer;
  winnerScore: TeamScore;
  loserScore: TeamScore;
  scoreDifference: number;
  
  // Enhanced Results
  mvp: Player;
  bestTacticalChoice: Player | null;
  bestValueSigning: Player | null;
  
  // Match Summary
  matchSummary: {
    winnerValidSquad: boolean;
    loserValidSquad: boolean;
    winByDefault: boolean; // Winner won because opponent had invalid squad
    closestPillar: string; // Which score was closest
    dominantPillar: string; // Which score winner dominated most
  };
  
  // Comparison for radar chart
  radarComparison: {
    categories: string[];
    winnerValues: number[];
    loserValues: number[];
  };
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
