import { createServer } from 'http';
import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { AIManager } = require('./ai/AIManager.js');
const ScoringEngine = require('./scoring/ScoringEngine.js');

// AI Managers pool (one per difficulty)
const aiManagers = {
  easy: new AIManager('easy'),
  medium: new AIManager('medium'),
  hard: new AIManager('hard'),
};

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Game State
const rooms = new Map();
const playerRooms = new Map(); // socketId -> roomId
const rateLimits = new Map(); // socketId -> { lastAction: timestamp, count: number }

// Rate limiting configuration
const RATE_LIMIT = {
  maxActions: 20,       // Max actions per window
  windowMs: 1000,       // 1 second window
  bidCooldownMs: 500,   // Minimum time between bids
};

// Room TTL - cleanup stale rooms after 2 hours
const ROOM_TTL_MS = 2 * 60 * 60 * 1000;

// Cleanup stale rooms every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    const roomAge = now - new Date(room.createdAt).getTime();
    const isStale = roomAge > ROOM_TTL_MS;
    const isEmpty = room.players.every(p => !p.isConnected);
    
    if (isStale || (isEmpty && room.status !== 'waiting')) {
      console.log(`🗑️ Cleaning up stale room: ${roomId}`);
      
      // Clear any running auction timer
      const timer = auctionTimers.get(roomId);
      if (timer) {
        clearInterval(timer);
        auctionTimers.delete(roomId);
      }
      
      rooms.delete(roomId);
    }
  }
}, 10 * 60 * 1000);

// Rate limiter check
function isRateLimited(socketId, actionType = 'general') {
  const now = Date.now();
  let limit = rateLimits.get(socketId);
  
  if (!limit || (now - limit.windowStart) > RATE_LIMIT.windowMs) {
    limit = { windowStart: now, count: 0, lastBid: 0 };
  }
  
  limit.count++;
  
  // Check bid cooldown
  if (actionType === 'bid') {
    if ((now - limit.lastBid) < RATE_LIMIT.bidCooldownMs) {
      return true;
    }
    limit.lastBid = now;
  }
  
  rateLimits.set(socketId, limit);
  return limit.count > RATE_LIMIT.maxActions;
}

// Sanitize chat input
function sanitizeMessage(message) {
  if (typeof message !== 'string') return '';
  return message
    .trim()
    .slice(0, 500) // Max 500 characters
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Default settings
const DEFAULT_SETTINGS = {
  startingBudget: 1000000000, // $1 billion
  squadSize: 16,
  auctionTimeLimit: 30, // seconds
  minBidIncrement: 1000000, // $1 million
  totalPlayers: 36, // 3 players * 12 positions
};

// Load players from the auction-game-data output
let allPlayers = [];

async function loadPlayers() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const playersPath = path.join(process.cwd(), '..', 'football-player-data-set', 'auction-game-data', 'output', 'players-simple.json');
    const data = await fs.readFile(playersPath, 'utf-8');
    allPlayers = JSON.parse(data);
    console.log(`✅ Loaded ${allPlayers.length} players`);
  } catch (error) {
    console.error('⚠️ Could not load players from file, using mock data');
    allPlayers = generateMockPlayers();
  }
}

function generateMockPlayers() {
  const positions = ['GK', 'CB', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'ST'];
  const names = ['Messi', 'Ronaldo', 'Mbappe', 'Haaland', 'De Bruyne', 'Salah', 'Bellingham', 'Vinicius Jr', 'Kane', 'Neymar'];

  return Array.from({ length: 50 }, (_, i) => ({
    _id: `player_${i}`,
    name: names[i % names.length] + (i >= 10 ? ` ${Math.floor(i / 10) + 1}` : ''),
    rating: 99 - Math.floor(i / 5),
    position: positions[i % positions.length],
    version: 'FUTTIES',
    age: 20 + (i % 15),
    images: {
      playerFace: 'https://via.placeholder.com/150',
      nationFlag: 'https://via.placeholder.com/50x30',
      clubBadge: 'https://via.placeholder.com/50',
      leagueLogo: 'https://via.placeholder.com/50',
    },
    overallStats: {
      paceOverall: 80 + Math.floor(Math.random() * 19),
      shootingOverall: 75 + Math.floor(Math.random() * 24),
      passingOverall: 78 + Math.floor(Math.random() * 21),
      dribblingOverall: 80 + Math.floor(Math.random() * 19),
      defendingOverall: 50 + Math.floor(Math.random() * 49),
      physicalOverall: 70 + Math.floor(Math.random() * 29),
    },
    basePrice: Math.floor((99 - Math.floor(i / 5)) * 1.5) * 1000000,
    rarity: i < 10 ? 'legendary' : i < 25 ? 'epic' : 'rare',
  }));
}

// Shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Create auction queue from players
// Create auction queue from players with strict position balancing
function createAuctionQueue() {
  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];
  let balancedQueue = [];

  positions.forEach(pos => {
    // Filter players by position
    const playersInPos = allPlayers.filter(p => p.position === pos);

    // Randomly select 3 players
    const selected = shuffleArray(playersInPos).slice(0, 3);

    // If not enough players in dataset (e.g. mock data might not have all positions), 
    // fill with randoms to ensure game doesn't break, but warn
    if (selected.length < 3) {
      console.warn(`⚠️ Not enough players for position ${pos}, filling with randoms`);
      const remaining = 3 - selected.length;
      const others = allPlayers.filter(p => !selected.includes(p));
      selected.push(...shuffleArray(others).slice(0, remaining));
    }

    balancedQueue.push(...selected);
  });

  return shuffleArray(balancedQueue);
}

// Calculate team score
/**
 * ============================================
 * ADVANCED SCORING SYSTEM - 5 PILLARS
 * ============================================
 * 
 * Final Score Composition:
 * - Power Score (30%): Raw football quality
 * - Tactical Score (20%): Position matching and formation
 * - Chemistry Score (20%): Team links and synergy
 * - Balance Score (15%): Squad structure
 * - Manager IQ Score (15%): Budget efficiency
 * 
 * REQUIRED: 11 valid players to win
 */

// Legacy wrapper for backward compatibility (uses new engine)
function calculateTeamScore(player, soldPlayers = [], startingBudget = DEFAULT_SETTINGS.startingBudget) {
  // Use the new scoring engine
  const analysis = ScoringEngine.analyzeTeam(player, soldPlayers, startingBudget);
  
  return {
    playerId: player.id,
    playerName: player.name,
    totalScore: analysis.finalScore,
    breakdown: {
      averageRating: analysis.power.avgOverall,
      ratingScore: analysis.power.total * 0.5,
      positionBalance: analysis.balance.total,
      positionScore: analysis.tactical.total * 0.5,
      synergy: analysis.chemistry.total,
      synergyScore: analysis.chemistry.total * 0.5,
    },
    analysis, // Full analysis for new UI
    squad: player.squad,
    formation: analysis.formation,
  };
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Player connected: ${socket.id}`);

  // Create a new room
  socket.on('room:create', (playerName, callback) => {
    const roomId = nanoid(8).toUpperCase();
    const playerId = nanoid(12);

    const player = {
      id: playerId,
      name: playerName,
      socketId: socket.id,
      budget: DEFAULT_SETTINGS.startingBudget,
      squad: [],
      isReady: false,
      isConnected: true,
      color: 'cyan',
    };

    const room = {
      id: roomId,
      name: `${playerName}'s Room`,
      players: [player],
      status: 'waiting',
      currentAuction: null,
      auctionQueue: [],
      soldPlayers: [],
      settings: { ...DEFAULT_SETTINGS },
      createdAt: new Date(),
    };

    rooms.set(roomId, room);
    playerRooms.set(socket.id, roomId);
    socket.join(roomId);

    console.log(`🏠 Room created: ${roomId} by ${playerName}`);
    callback(room);
  });

  // Create a room with AI opponent
  socket.on('room:create-with-ai', (playerName, difficulty, callback) => {
    const roomId = nanoid(8).toUpperCase();
    const playerId = nanoid(12);

    // Get AI manager for this difficulty
    const aiManager = aiManagers[difficulty] || aiManagers.medium;

    const player = {
      id: playerId,
      name: playerName,
      socketId: socket.id,
      budget: DEFAULT_SETTINGS.startingBudget,
      squad: [],
      isReady: false,
      isConnected: true,
      isAI: false,
      color: 'cyan',
    };

    // Create AI player
    const aiPlayer = aiManager.createAIPlayer(DEFAULT_SETTINGS.startingBudget);

    const room = {
      id: roomId,
      name: `${playerName} vs ${aiPlayer.name}`,
      players: [player, aiPlayer],
      status: 'waiting',
      currentAuction: null,
      auctionQueue: [],
      soldPlayers: [],
      settings: { ...DEFAULT_SETTINGS },
      createdAt: new Date(),
      isAIGame: true,
      aiDifficulty: difficulty,
    };

    rooms.set(roomId, room);
    playerRooms.set(socket.id, roomId);
    socket.join(roomId);

    console.log(`🤖 AI Game room created: ${roomId} by ${playerName} vs ${aiPlayer.name} (${difficulty})`);
    callback(room, player);
  });

  // Join an existing room
  socket.on('room:join', (roomId, playerName, playerId, callback) => {
    const room = rooms.get(roomId.toUpperCase());

    if (!room) {
      callback(false, undefined, undefined, 'Room not found');
      return;
    }

    // Check for reconnection
    if (playerId) {
      const existingPlayer = room.players.find(p => p.id === playerId);
      if (existingPlayer) {
        existingPlayer.socketId = socket.id;
        existingPlayer.isConnected = true;
        playerRooms.set(socket.id, roomId.toUpperCase());
        socket.join(roomId.toUpperCase());

        console.log(`🔌 ${existingPlayer.name} reconnected to room: ${roomId}`);

        io.to(roomId.toUpperCase()).emit('room:updated', room);

        // If game is in progress, send current game state
        if (room.status === 'auction') {
          socket.emit('game:started', room);
          if (room.currentAuction) {
            socket.emit('game:auction-start', room.currentAuction);
          }
        }

        callback(true, room, existingPlayer);
        return;
      }
    }

    if (room.players.length >= 2) {
      callback(false, undefined, undefined, 'Room is full');
      return;
    }

    if (room.status !== 'waiting') {
      callback(false, undefined, undefined, 'Game already in progress');
      return;
    }

    const newPlayerId = nanoid(12);
    const player = {
      id: newPlayerId,
      name: playerName,
      socketId: socket.id,
      budget: room.settings.startingBudget,
      squad: [],
      isReady: false,
      isConnected: true,
      color: 'purple',
    };

    room.players.push(player);
    playerRooms.set(socket.id, roomId.toUpperCase());
    socket.join(roomId.toUpperCase());

    console.log(`👤 ${playerName} joined room: ${roomId}`);

    io.to(roomId.toUpperCase()).emit('room:updated', room);
    callback(true, room, player);
  });

  // Player ready state
  socket.on('room:ready', (isReady) => {
    const roomId = playerRooms.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (player) {
      player.isReady = isReady;

      // Check if all players are ready
      if (room.players.length === 2 && room.players.every(p => p.isReady)) {
        room.status = 'ready';
      } else {
        room.status = 'waiting';
      }

      io.to(roomId).emit('room:updated', room);
    }
  });

  // Start game
  socket.on('game:start', () => {
    const roomId = playerRooms.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || room.status !== 'ready') return;

    // Initialize balanced auction queue
    room.auctionQueue = createAuctionQueue();
    room.status = 'auction';
    room.startedAt = new Date();

    console.log(`🎮 Game started in room: ${roomId}`);
    io.to(roomId).emit('game:started', room);

    // Start first auction
    startNextAuction(roomId);
  });

  // Place bid (with rate limiting)
  socket.on('game:bid', (amount) => {
    // Rate limit check for bids
    if (isRateLimited(socket.id, 'bid')) {
      socket.emit('room:error', 'Bidding too fast. Please wait.');
      return;
    }

    const roomId = playerRooms.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || room.status !== 'auction' || !room.currentAuction) return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    const auction = room.currentAuction;

    // Validate bid amount is a valid number
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      socket.emit('room:error', 'Invalid bid amount');
      return;
    }

    // Validate bid
    if (amount <= auction.currentBid) {
      socket.emit('room:error', 'Bid must be higher than current bid');
      return;
    }

    if (amount > player.budget) {
      socket.emit('room:error', 'Insufficient budget');
      return;
    }

    const minBid = auction.currentBid + room.settings.minBidIncrement;
    if (amount < minBid && auction.currentBid > 0) {
      socket.emit('room:error', `Minimum bid is $${minBid.toLocaleString()}`);
      return;
    }

    // Place the bid
    const bid = {
      playerId: player.id,
      playerName: player.name,
      amount,
      timestamp: new Date(),
    };

    auction.currentBid = amount;
    auction.currentBidder = player.id;
    auction.bidHistory.push(bid);
    auction.status = 'active';

    // Reset timer on bid
    auction.timeRemaining = Math.max(10, auction.timeRemaining);

    console.log(`💰 ${player.name} bid $${amount.toLocaleString()} on ${auction.player.name}`);
    io.to(roomId).emit('game:bid-placed', bid, auction);
  });

  // Chat message (with rate limiting and sanitization)
  socket.on('room:chat', (message) => {
    // Rate limit check
    if (isRateLimited(socket.id, 'chat')) {
      socket.emit('room:error', 'Too many messages. Please slow down.');
      return;
    }

    const roomId = playerRooms.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    // Sanitize message
    const sanitizedMessage = sanitizeMessage(message);
    if (!sanitizedMessage) return;

    const chatMessage = {
      id: nanoid(),
      playerId: player.id,
      playerName: player.name,
      message: sanitizedMessage,
      timestamp: new Date(),
    };

    io.to(roomId).emit('room:chat', chatMessage);
  });

  // Leave room
  socket.on('room:leave', () => {
    handleDisconnect(socket);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Player disconnected: ${socket.id}`);
    handleDisconnect(socket);
  });
});

function handleDisconnect(socket) {
  const roomId = playerRooms.get(socket.id);
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  const player = room.players.find(p => p.socketId === socket.id);
  if (player) {
    player.isConnected = false;

    // If game hasn't started, remove the player
    if (room.status === 'waiting') {
      room.players = room.players.filter(p => p.socketId !== socket.id);

      if (room.players.length === 0) {
        rooms.delete(roomId);
        console.log(`🗑️ Room deleted: ${roomId}`);
      } else {
        io.to(roomId).emit('room:player-left', player.id);
        io.to(roomId).emit('room:updated', room);
      }
    } else {
      // Mark as disconnected but keep in game
      io.to(roomId).emit('room:updated', room);
    }
  }

  playerRooms.delete(socket.id);
}

// Auction timer management
const auctionTimers = new Map();

function startNextAuction(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.auctionQueue.length === 0) {
    endGame(roomId);
    return;
  }

  const nextPlayer = room.auctionQueue.shift();

  room.currentAuction = {
    player: nextPlayer,
    currentBid: nextPlayer.basePrice * 1000000, // Convert to actual amount
    currentBidder: null,
    timeRemaining: room.settings.auctionTimeLimit,
    bidHistory: [],
    status: 'active',
  };

  io.to(roomId).emit('game:auction-start', room.currentAuction);

  // Trigger AI bidding if this is an AI game
  if (room.isAIGame) {
    triggerAIBidding(roomId);
  }

  // Start countdown timer
  const timer = setInterval(() => {
    const currentRoom = rooms.get(roomId);
    if (!currentRoom || !currentRoom.currentAuction) {
      clearInterval(timer);
      return;
    }

    currentRoom.currentAuction.timeRemaining--;

    // Trigger AI bidding periodically during auction
    if (currentRoom.isAIGame && currentRoom.currentAuction.timeRemaining > 3) {
      // AI might bid every few seconds
      if (currentRoom.currentAuction.timeRemaining % 5 === 0 || 
          currentRoom.currentAuction.timeRemaining === 15 ||
          currentRoom.currentAuction.timeRemaining === 10) {
        triggerAIBidding(roomId);
      }
    }

    // Status updates
    if (currentRoom.currentAuction.timeRemaining === 5 && currentRoom.currentAuction.currentBidder) {
      currentRoom.currentAuction.status = 'going_once';
    } else if (currentRoom.currentAuction.timeRemaining === 3 && currentRoom.currentAuction.currentBidder) {
      currentRoom.currentAuction.status = 'going_twice';
    }

    io.to(roomId).emit('game:auction-update', currentRoom.currentAuction);

    if (currentRoom.currentAuction.timeRemaining <= 0) {
      clearInterval(timer);
      auctionTimers.delete(roomId);
      endCurrentAuction(roomId);
    }
  }, 1000);

  auctionTimers.set(roomId, timer);
}

// AI Bidding Logic
function triggerAIBidding(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.currentAuction || !room.isAIGame) return;

  const aiPlayer = room.players.find(p => p.isAI);
  if (!aiPlayer) return;

  const aiManager = aiManagers[room.aiDifficulty] || aiManagers.medium;
  
  // Process AI decision
  aiManager.processAuctionTurn(
    roomId,
    room.currentAuction,
    aiPlayer,
    room,
    (bidAmount) => {
      // Place the AI bid
      placeAIBid(roomId, aiPlayer, bidAmount);
    }
  );
}

function placeAIBid(roomId, aiPlayer, amount) {
  const room = rooms.get(roomId);
  if (!room || !room.currentAuction) return;

  const auction = room.currentAuction;

  // Validate bid
  if (amount <= auction.currentBid) return;
  if (amount > aiPlayer.budget) return;
  if (auction.currentBidder === aiPlayer.id) return;

  // Place the bid
  const bid = {
    playerId: aiPlayer.id,
    playerName: aiPlayer.name,
    amount,
    timestamp: new Date(),
    isAI: true,
  };

  auction.currentBid = amount;
  auction.currentBidder = aiPlayer.id;
  auction.bidHistory.push(bid);
  auction.status = 'active';

  // Reset timer on bid
  auction.timeRemaining = Math.max(10, auction.timeRemaining);

  console.log(`🤖 AI ${aiPlayer.name} bid $${amount.toLocaleString()} on ${auction.player.name}`);
  io.to(roomId).emit('game:bid-placed', bid, auction);

  // Update room state
  io.to(roomId).emit('room:updated', room);
}

function endCurrentAuction(roomId) {
  const room = rooms.get(roomId);
  if (!room || !room.currentAuction) return;

  const auction = room.currentAuction;

  if (auction.currentBidder) {
    // Player was sold
    const winner = room.players.find(p => p.id === auction.currentBidder);
    if (winner) {
      winner.budget -= auction.currentBid;
      winner.squad.push(auction.player);

      const sold = {
        player: auction.player,
        buyerId: winner.id,
        buyerName: winner.name,
        price: auction.currentBid,
        auctionNumber: room.soldPlayers.length + 1,
      };

      room.soldPlayers.push(sold);
      auction.status = 'sold';

      console.log(`✅ ${auction.player.name} sold to ${winner.name} for $${auction.currentBid.toLocaleString()}`);
      io.to(roomId).emit('game:player-sold', sold, room);
    }
  } else {
    // Player went unsold
    auction.status = 'unsold';
    console.log(`❌ ${auction.player.name} went unsold`);
    io.to(roomId).emit('game:player-unsold', auction.player);
  }

  room.currentAuction = null;

  // Check if game should end
  const totalSquadSize = room.players.reduce((sum, p) => sum + p.squad.length, 0);
  const maxSquadSize = room.settings.squadSize * 2;

  if (room.auctionQueue.length === 0 || totalSquadSize >= maxSquadSize) {
    endGame(roomId);
  } else {
    // Start next auction after delay
    setTimeout(() => startNextAuction(roomId), 3000);
  }
}

function endGame(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.status = 'finished';
  room.endedAt = new Date();

  // Use the new Advanced Scoring Engine
  const result = ScoringEngine.calculateGameResult(room);

  // Log match summary
  const { matchSummary, winnerScore, loserScore } = result;
  console.log(`\n🏆 === GAME FINISHED: ${roomId} ===`);
  console.log(`👑 Winner: ${result.winner.name} (Score: ${winnerScore.totalScore})`);
  console.log(`   Squad Valid: ${matchSummary.winnerValidSquad ? '✅' : '❌'}`);
  console.log(`📊 5-Pillar Breakdown:`);
  console.log(`   Power: ${winnerScore.analysis.power.total} vs ${loserScore.analysis.power.total}`);
  console.log(`   Tactical: ${winnerScore.analysis.tactical.total} vs ${loserScore.analysis.tactical.total}`);
  console.log(`   Chemistry: ${winnerScore.analysis.chemistry.total} vs ${loserScore.analysis.chemistry.total}`);
  console.log(`   Balance: ${winnerScore.analysis.balance.total} vs ${loserScore.analysis.balance.total}`);
  console.log(`   Manager IQ: ${winnerScore.analysis.managerIQ.total} vs ${loserScore.analysis.managerIQ.total}`);
  console.log(`🎯 Dominant Pillar: ${matchSummary.dominantPillar}`);
  console.log(`⚔️ Closest Pillar: ${matchSummary.closestPillar}`);
  if (matchSummary.winByDefault) {
    console.log(`⚠️ Win by default (opponent had invalid squad)`);
  }
  console.log(`===========================\n`);

  io.to(roomId).emit('game:finished', result, room);
}

// Start server
const PORT = process.env.SOCKET_PORT || process.env.PORT || 3001;

loadPlayers().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`\n🎮 Football Auction Socket Server`);
    console.log(`📡 Running on http://localhost:${PORT}`);
    console.log(`⚽ ${allPlayers.length} players loaded\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Error: Port ${PORT} is already in use`);
      console.error(`💡 Try killing the process using the port or use a different port:`);
      console.error(`   Set SOCKET_PORT environment variable, e.g.: SOCKET_PORT=3002 npm run dev:socket\n`);
      process.exit(1);
    } else {
      console.error(`\n❌ Server error:`, err.message);
      process.exit(1);
    }
  });
}).catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
