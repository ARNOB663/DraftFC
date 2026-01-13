/**
 * AI Manager - Handles AI opponent logic for the auction game
 * 
 * The AI uses a strategy-based approach with configurable difficulty levels:
 * - EASY: Makes random bids, often underbids
 * - MEDIUM: Makes calculated bids based on player value
 * - HARD: Optimal bidding with squad composition awareness
 */

// AI Difficulty configurations
const AI_DIFFICULTY = {
  easy: {
    name: 'Easy',
    // How likely AI is to bid (0-1)
    bidProbability: 0.4,
    // Max percentage of budget to spend on a single player
    maxBidPercentage: 0.15,
    // How much to overbid the current bid (multiplier)
    bidAggressiveness: 1.05,
    // Reaction time range (ms) - adds human-like delay
    reactionTimeMin: 2000,
    reactionTimeMax: 5000,
    // Position awareness (how much AI cares about squad balance)
    positionAwareness: 0.3,
    // Rating threshold - only interested in players above this
    ratingThreshold: 85,
  },
  medium: {
    name: 'Medium',
    bidProbability: 0.6,
    maxBidPercentage: 0.20,
    bidAggressiveness: 1.10,
    reactionTimeMin: 1500,
    reactionTimeMax: 4000,
    positionAwareness: 0.6,
    ratingThreshold: 80,
  },
  hard: {
    name: 'Hard',
    bidProbability: 0.8,
    maxBidPercentage: 0.25,
    bidAggressiveness: 1.15,
    reactionTimeMin: 800,
    reactionTimeMax: 2500,
    positionAwareness: 0.9,
    ratingThreshold: 75,
  },
};

// AI Names pool
const AI_NAMES = [
  'CPU Magnus', 'Bot Pep', 'AI Ancelotti', 'Robo Klopp',
  'Neural Zidane', 'Deep Blue FC', 'Silicon Coach', 'Algorithm Alex',
  'Binary Boss', 'Cyber Mourinho', 'Digital Guardiola', 'Virtual Fergie',
];

class AIManager {
  constructor(difficulty = 'medium') {
    this.difficulty = AI_DIFFICULTY[difficulty] || AI_DIFFICULTY.medium;
    this.difficultyLevel = difficulty;
    this.pendingBids = new Map(); // roomId -> timeout
  }

  /**
   * Create an AI player object
   */
  createAIPlayer(startingBudget) {
    return {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)],
      socketId: null, // AI has no socket
      budget: startingBudget,
      squad: [],
      isReady: true, // AI is always ready
      isConnected: true,
      isAI: true,
      color: 'purple',
      difficulty: this.difficultyLevel,
    };
  }

  /**
   * Evaluate how valuable a player is to the AI
   * Returns a value score from 0-100
   */
  evaluatePlayer(player, aiPlayer) {
    let score = 0;
    const config = this.difficulty;

    // Base score from rating (0-50 points)
    score += (player.rating / 99) * 50;

    // Rarity bonus (0-15 points)
    const rarityBonus = {
      legendary: 15,
      epic: 10,
      rare: 5,
      common: 0,
    };
    score += rarityBonus[player.rarity] || 0;

    // Position need bonus (0-20 points)
    const positionNeed = this.calculatePositionNeed(player.position, aiPlayer.squad);
    score += positionNeed * 20 * config.positionAwareness;

    // Stats bonus for key positions (0-15 points)
    if (player.overallStats) {
      const stats = player.overallStats;
      if (['ST', 'LW', 'RW'].includes(player.position)) {
        // Attackers: value shooting and pace
        score += ((stats.shootingOverall + stats.paceOverall) / 200) * 15;
      } else if (['CM', 'CAM', 'CDM'].includes(player.position)) {
        // Midfielders: value passing and dribbling
        score += ((stats.passingOverall + stats.dribblingOverall) / 200) * 15;
      } else if (['CB', 'LB', 'RB'].includes(player.position)) {
        // Defenders: value defending and physical
        score += ((stats.defendingOverall + stats.physicalOverall) / 200) * 15;
      } else if (player.position === 'GK') {
        // Goalkeepers are valuable if we don't have one
        const hasGK = aiPlayer.squad.some(p => p.position === 'GK');
        score += hasGK ? 0 : 20;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate how much the AI needs a specific position
   * Returns 0-1 (0 = don't need, 1 = desperately need)
   */
  calculatePositionNeed(position, squad) {
    const positionCounts = {
      GK: squad.filter(p => p.position === 'GK').length,
      DEF: squad.filter(p => ['CB', 'LB', 'RB'].includes(p.position)).length,
      MID: squad.filter(p => ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p.position)).length,
      ATT: squad.filter(p => ['LW', 'RW', 'ST'].includes(p.position)).length,
    };

    // Ideal distribution (for 16 players)
    const ideal = { GK: 2, DEF: 5, MID: 5, ATT: 4 };

    let posType;
    if (position === 'GK') posType = 'GK';
    else if (['CB', 'LB', 'RB'].includes(position)) posType = 'DEF';
    else if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) posType = 'MID';
    else posType = 'ATT';

    const current = positionCounts[posType];
    const needed = ideal[posType];

    // Special case: GK is critical
    if (posType === 'GK' && current === 0) return 1.0;

    // Calculate need based on deficit
    if (current >= needed) return 0.1; // Low need, but not zero
    return (needed - current) / needed;
  }

  /**
   * Calculate maximum bid AI is willing to make
   */
  calculateMaxBid(player, aiPlayer, valueScore) {
    const config = this.difficulty;

    // Base price multiplier based on value score
    const baseMultiplier = 0.5 + (valueScore / 100) * 1.5; // 0.5x to 2x

    // Calculate max based on player base price
    const baseMax = player.basePrice * 1000000 * baseMultiplier;

    // Cap based on budget percentage
    const budgetCap = aiPlayer.budget * config.maxBidPercentage;

    // Consider remaining auction count (save money for later)
    const auctionsRemaining = 36 - aiPlayer.squad.length * 2; // Rough estimate
    const budgetPerAuction = aiPlayer.budget / Math.max(1, auctionsRemaining / 2);

    return Math.min(baseMax, budgetCap, budgetPerAuction);
  }

  /**
   * Decide whether and how much to bid
   * Returns { shouldBid: boolean, amount: number }
   */
  decideBid(auction, aiPlayer, room) {
    const config = this.difficulty;
    const player = auction.player;

    // Don't bid if AI is already highest bidder
    if (auction.currentBidder === aiPlayer.id) {
      return { shouldBid: false, amount: 0 };
    }

    // Don't bid if squad is full
    if (aiPlayer.squad.length >= room.settings.squadSize) {
      return { shouldBid: false, amount: 0 };
    }

    // Evaluate the player
    const valueScore = this.evaluatePlayer(player, aiPlayer);

    // Check if player meets rating threshold
    if (player.rating < config.ratingThreshold && valueScore < 50) {
      // Low value player - reduce bid probability
      if (Math.random() > config.bidProbability * 0.5) {
        return { shouldBid: false, amount: 0 };
      }
    }

    // Random chance to pass based on difficulty
    if (Math.random() > config.bidProbability) {
      return { shouldBid: false, amount: 0 };
    }

    // Calculate max bid
    const maxBid = this.calculateMaxBid(player, aiPlayer, valueScore);

    // Don't bid if current bid exceeds our max
    if (auction.currentBid >= maxBid) {
      return { shouldBid: false, amount: 0 };
    }

    // Calculate actual bid amount
    const minIncrement = room.settings.minBidIncrement;
    let bidAmount = auction.currentBid + minIncrement;

    // Add aggressiveness factor
    const aggressiveBid = auction.currentBid * config.bidAggressiveness;
    if (aggressiveBid > bidAmount && aggressiveBid <= maxBid) {
      bidAmount = Math.ceil(aggressiveBid / minIncrement) * minIncrement;
    }

    // Random slight variation to seem more human
    const variation = (Math.random() * 0.1 - 0.05) * bidAmount;
    bidAmount = Math.ceil((bidAmount + variation) / minIncrement) * minIncrement;

    // Ensure within bounds
    bidAmount = Math.min(bidAmount, maxBid, aiPlayer.budget);
    bidAmount = Math.max(bidAmount, auction.currentBid + minIncrement);

    // Final check
    if (bidAmount > aiPlayer.budget || bidAmount <= auction.currentBid) {
      return { shouldBid: false, amount: 0 };
    }

    return { shouldBid: true, amount: bidAmount };
  }

  /**
   * Get reaction time (human-like delay before bidding)
   */
  getReactionTime() {
    const config = this.difficulty;
    return Math.floor(
      config.reactionTimeMin + 
      Math.random() * (config.reactionTimeMax - config.reactionTimeMin)
    );
  }

  /**
   * Process AI turn for an auction
   * This is called by the server when it's time for AI to potentially bid
   */
  processAuctionTurn(roomId, auction, aiPlayer, room, onBid) {
    // Clear any pending bid for this room
    if (this.pendingBids.has(roomId)) {
      clearTimeout(this.pendingBids.get(roomId));
    }

    // Decide if and how much to bid
    const decision = this.decideBid(auction, aiPlayer, room);

    if (!decision.shouldBid) {
      return;
    }

    // Schedule bid with human-like delay
    const reactionTime = this.getReactionTime();
    
    const timeout = setTimeout(() => {
      // Re-check conditions (auction might have changed)
      if (auction.currentBidder !== aiPlayer.id && 
          auction.timeRemaining > 2 &&
          decision.amount > auction.currentBid &&
          decision.amount <= aiPlayer.budget) {
        onBid(decision.amount);
      }
      this.pendingBids.delete(roomId);
    }, reactionTime);

    this.pendingBids.set(roomId, timeout);
  }

  /**
   * Cancel pending AI actions for a room
   */
  cancelPendingActions(roomId) {
    if (this.pendingBids.has(roomId)) {
      clearTimeout(this.pendingBids.get(roomId));
      this.pendingBids.delete(roomId);
    }
  }

  /**
   * Get difficulty info
   */
  static getDifficultyInfo() {
    return Object.entries(AI_DIFFICULTY).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: key === 'easy' 
        ? 'Relaxed gameplay, AI makes occasional mistakes'
        : key === 'medium'
          ? 'Balanced challenge, strategic bidding'
          : 'Competitive AI, optimal decisions',
    }));
  }
}

module.exports = { AIManager, AI_DIFFICULTY, AI_NAMES };
