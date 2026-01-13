import { createServer } from 'http';
import { Server } from 'socket.io';
import { nanoid } from 'nanoid';

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
function calculateTeamScore(player) {
  const squad = player.squad;
  if (squad.length === 0) {
    return {
      playerId: player.id,
      playerName: player.name,
      totalScore: 0,
      breakdown: {
        averageRating: 0,
        ratingScore: 0,
        positionBalance: 0,
        positionScore: 0,
        synergy: 0,
        synergyScore: 0,
      },
      squad,
      formation: { name: 'None', positions: [] },
    };
  }

  // Calculate average rating
  const avgRating = squad.reduce((sum, p) => sum + p.rating, 0) / squad.length;
  const ratingScore = avgRating * 0.5;

  // Calculate position balance (ideal: 1 GK, 4 DEF, 3 MID, 3 ATT)
  const positions = {
    GK: squad.filter(p => p.position === 'GK').length,
    DEF: squad.filter(p => ['CB', 'LB', 'RB'].includes(p.position)).length,
    MID: squad.filter(p => ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p.position)).length,
    ATT: squad.filter(p => ['LW', 'RW', 'ST'].includes(p.position)).length,
  };

  // Ideal distribution for 11 players
  const idealPositions = { GK: 1, DEF: 4, MID: 3, ATT: 3 };
  let positionScore = 100;

  // Penalty for missing or excess positions
  positionScore -= Math.abs(positions.GK - idealPositions.GK) * 25;
  positionScore -= Math.abs(positions.DEF - idealPositions.DEF) * 10;
  positionScore -= Math.abs(positions.MID - idealPositions.MID) * 10;
  positionScore -= Math.abs(positions.ATT - idealPositions.ATT) * 10;

  positionScore = Math.max(0, positionScore);
  const positionScoreFinal = positionScore * 0.3;

  // Calculate synergy (same nation/club bonuses)
  const nations = {};
  const clubs = {};
  squad.forEach(p => {
    const nation = p.images?.nationFlag || 'unknown';
    const club = p.images?.clubBadge || 'unknown';
    nations[nation] = (nations[nation] || 0) + 1;
    clubs[club] = (clubs[club] || 0) + 1;
  });

  let synergyBonus = 0;
  Object.values(nations).forEach(count => {
    if (count >= 3) synergyBonus += (count - 2) * 5;
  });
  Object.values(clubs).forEach(count => {
    if (count >= 2) synergyBonus += (count - 1) * 10;
  });

  const synergy = Math.min(100, synergyBonus);
  const synergyScore = synergy * 0.2;

  const totalScore = ratingScore + positionScoreFinal + synergyScore;

  return {
    playerId: player.id,
    playerName: player.name,
    totalScore: Math.round(totalScore * 100) / 100,
    breakdown: {
      averageRating: Math.round(avgRating * 100) / 100,
      ratingScore: Math.round(ratingScore * 100) / 100,
      positionBalance: positionScore,
      positionScore: Math.round(positionScoreFinal * 100) / 100,
      synergy,
      synergyScore: Math.round(synergyScore * 100) / 100,
    },
    squad,
    formation: { name: '4-3-3', positions: Object.keys(positions) },
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

  // Place bid
  socket.on('game:bid', (amount) => {
    const roomId = playerRooms.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || room.status !== 'auction' || !room.currentAuction) return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    const auction = room.currentAuction;

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

  // Chat message
  socket.on('room:chat', (message) => {
    const roomId = playerRooms.get(socket.id);
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.socketId === socket.id);
    if (!player) return;

    const chatMessage = {
      id: nanoid(),
      playerId: player.id,
      playerName: player.name,
      message,
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

  // Start countdown timer
  const timer = setInterval(() => {
    const currentRoom = rooms.get(roomId);
    if (!currentRoom || !currentRoom.currentAuction) {
      clearInterval(timer);
      return;
    }

    currentRoom.currentAuction.timeRemaining--;

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

  // Calculate scores
  const scores = room.players.map(p => calculateTeamScore(p));

  // Determine winner
  const [score1, score2] = scores;
  const winner = score1.totalScore >= score2.totalScore ? room.players[0] : room.players[1];
  const loser = winner === room.players[0] ? room.players[1] : room.players[0];
  const winnerScore = scores.find(s => s.playerId === winner.id);
  const loserScore = scores.find(s => s.playerId === loser.id);

  // Find MVP (highest rated player from winner's squad)
  const mvp = winner.squad.reduce((best, p) => (p.rating > (best?.rating || 0) ? p : best), null);

  const result = {
    winner,
    loser,
    winnerScore,
    loserScore,
    scoreDifference: Math.abs(score1.totalScore - score2.totalScore),
    mvp,
  };

  console.log(`🏆 Game finished in room ${roomId}. Winner: ${winner.name}`);
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
