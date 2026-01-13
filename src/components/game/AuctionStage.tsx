'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { PlayerCard, MiniPlayerCard, PlayerDetailModal } from './PlayerCard';
import type { Player } from '@/types';
import { BidPanel } from './BidPanel';
import { cn, formatBudget, formatCurrency, getBidOptions } from '@/lib/utils';
import {
  DollarSign,
  Clock,
  Users,
  Gavel,
  TrendingUp,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { soundManager } from '@/lib/sounds';
import { ChatPanel } from './ChatPanel';

export function AuctionStage() {
  const {
    room,
    currentPlayer,
    opponent,
    currentAuction,
    lastBid,
    placeBid
  } = useGameStore();

  const [selectedBid, setSelectedBid] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPlayerPrice, setSelectedPlayerPrice] = useState<number | undefined>(undefined);

  // Helper to get purchase price for a player
  const getPurchasePrice = (playerId: string): number | undefined => {
    const soldPlayer = room?.soldPlayers.find(sp => sp.player._id === playerId);
    return soldPlayer?.price;
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setSelectedPlayerPrice(getPurchasePrice(player._id));
  };

  // Sound effects logic
  useEffect(() => {
    if (!currentAuction || !soundEnabled) return;

    // Play sound on new bid
    if (lastBid) {
      soundManager.play('bid_placed');

      // Specifically outbid sound if we were the previous high bidder? 
      // Simplified: Just play bid sound for now, maybe different one if we just got outbid
      if (lastBid.playerId !== currentPlayer?.id && currentAuction.currentBidder === currentPlayer?.id) {
        // We just got outbid (logic is tricky here without previous state, keeping simple)
      }
    }
  }, [lastBid, currentAuction?.currentBid, soundEnabled, currentPlayer?.id, currentAuction?.currentBidder]);

  useEffect(() => {
    if (!currentAuction || !soundEnabled) return;

    if (currentAuction.status === 'sold') {
      soundManager.play('sold');
    }

    // Timer ticks for last 5 seconds
    if (currentAuction.timeRemaining <= 5 && currentAuction.timeRemaining > 0 && currentAuction.status === 'active') {
      soundManager.play('timer_tick');
    }
  }, [currentAuction?.status, currentAuction?.timeRemaining, soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    soundManager.toggle(!soundEnabled);
  };

  if (!room || !currentPlayer || !currentAuction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Loading auction...</p>
        </div>
      </div>
    );
  }

  const { player, currentBid, currentBidder, timeRemaining, status, bidHistory } = currentAuction;
  const isHighestBidder = currentBidder === currentPlayer.id;
  const canBid = !isHighestBidder && currentBid < currentPlayer.budget;
  const bidOptions = getBidOptions(currentBid, currentPlayer.budget);

  const handleBid = (amount: number) => {
    placeBid(amount);
    setSelectedBid(null);
  };

  // Timer color based on time remaining
  const timerColor = timeRemaining <= 5
    ? 'text-red-500'
    : timeRemaining <= 10
      ? 'text-yellow-500'
      : 'text-neon-cyan';

  // Progress for timer ring
  const timerProgress = (timeRemaining / room.settings.auctionTimeLimit) * 100;

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar: Players & Budgets */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Current Player */}
          <motion.div
            className={cn(
              'glass-card p-4 relative',
              isHighestBidder && 'neon-glow-cyan border-neon-cyan/50'
            )}
            animate={isHighestBidder ? { scale: [1, 1.02, 1] } : {}}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
                <span className="text-neon-cyan font-bold">YOU</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{currentPlayer.name}</p>
                <p className="text-sm text-neon-green font-mono">
                  {formatBudget(currentPlayer.budget)}
                </p>
              </div>
              <button
                onClick={toggleSound}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title={soundEnabled ? "Mute sounds" : "Enable sounds"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Squad slots - Responsive Grid for 16 players */}
            <div className="flex flex-wrap gap-1 mt-3 justify-start content-start">
              {Array.from({ length: room.settings.squadSize }).map((_, i) => (
                <div key={i} className="w-[calc(25%-3px)] aspect-[3/4]">
                  {currentPlayer.squad[i] ? (
                    <MiniPlayerCard 
                      player={currentPlayer.squad[i]} 
                      onClick={() => handlePlayerClick(currentPlayer.squad[i])}
                    />
                  ) : (
                    <div className="squad-slot w-full h-full flex items-center justify-center">
                      <span className="text-[10px] text-dark-500">{i + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Auction Info (Center) */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gavel className="w-5 h-5 text-neon-cyan" />
              <span className="text-sm text-dark-400">
                Auction {room.soldPlayers.length + 1}/{room.settings.totalPlayers}
              </span>
            </div>

            {/* Timer */}
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-dark-700"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={226}
                  strokeDashoffset={226 - (226 * timerProgress) / 100}
                  className={cn('transition-all duration-1000', timerColor)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn('text-2xl font-display font-bold', timerColor)}>
                  {timeRemaining}
                </span>
              </div>
            </div>

            {/* Status */}
            <AnimatePresence mode="wait">
              {status !== 'active' && (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    'mt-2 text-lg font-display font-bold uppercase tracking-wider',
                    status === 'going_once' && 'text-yellow-400',
                    status === 'going_twice' && 'text-orange-400',
                    status === 'sold' && 'text-green-400',
                  )}
                >
                  {status === 'going_once' && 'Going Once!'}
                  {status === 'going_twice' && 'Going Twice!'}
                  {status === 'sold' && 'SOLD!'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Opponent */}
          <motion.div
            className={cn(
              'glass-card p-4',
              currentBidder === opponent?.id && 'neon-glow-purple border-neon-purple/50'
            )}
            animate={currentBidder === opponent?.id ? { scale: [1, 1.02, 1] } : {}}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-neon-purple" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{opponent?.name || 'Opponent'}</p>
                <p className="text-sm text-neon-green font-mono">
                  {opponent ? formatBudget(opponent.budget) : '-'}
                </p>
              </div>
            </div>

            {/* Opponent squad slots - Responsive Grid for 16 players */}
            {opponent && (
              <div className="flex flex-wrap gap-1 mt-3 justify-start content-start">
                {Array.from({ length: room.settings.squadSize }).map((_, i) => (
                  <div key={i} className="w-[calc(25%-3px)] aspect-[3/4]">
                    {opponent.squad[i] ? (
                      <MiniPlayerCard 
                        player={opponent.squad[i]} 
                        onClick={() => handlePlayerClick(opponent.squad[i])}
                      />
                    ) : (
                      <div className="squad-slot w-full h-full flex items-center justify-center">
                        <span className="text-[10px] text-dark-500">{i + 1}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Main Auction Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Bid History */}
          <div className="glass-card p-4 order-2 lg:order-1">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-cyan" />
              Bid History
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              <AnimatePresence>
                {bidHistory.slice().reverse().map((bid, i) => (
                  <motion.div
                    key={`${bid.timestamp}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'p-3 rounded-lg text-sm',
                      bid.playerId === currentPlayer.id
                        ? 'bg-neon-cyan/10 border border-neon-cyan/30'
                        : 'bg-dark-800/50'
                    )}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{bid.playerName}</span>
                      <span className="text-neon-green font-mono font-bold">
                        {formatCurrency(bid.amount)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {bidHistory.length === 0 && (
                <p className="text-dark-500 text-sm text-center py-4">
                  No bids yet. Be the first!
                </p>
              )}
            </div>
          </div>

          {/* Center: Player Card */}
          <div className="flex flex-col items-center order-1 lg:order-2">
            {/* Current Bid Display */}
            <motion.div
              className="mb-6 text-center"
              key={currentBid}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              <p className="text-dark-400 text-sm mb-1">Current Bid</p>
              <div className="text-4xl md:text-5xl font-display font-black text-neon-green">
                {formatCurrency(currentBid)}
              </div>
              {currentBidder && (
                <p className="text-sm mt-1">
                  by <span className={currentBidder === currentPlayer.id ? 'text-neon-cyan' : 'text-neon-purple'}>
                    {currentBidder === currentPlayer.id ? 'You' : opponent?.name}
                  </span>
                </p>
              )}
            </motion.div>

            {/* Player Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6"
            >
              <PlayerCard player={player} size="lg" showStats spotlight />
            </motion.div>

            {/* Bid Actions */}
            <BidPanel
              currentBid={currentBid}
              budget={currentPlayer.budget}
              canBid={canBid}
              isHighestBidder={isHighestBidder}
              onBid={handleBid}
              minIncrement={room.settings.minBidIncrement}
            />
          </div>

          {/* Right: Quick Stats */}
          <div className="glass-card p-4 order-3">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-cyan" />
              Player Stats
            </h3>

            {player.overallStats && (
              <div className="space-y-3">
                {[
                  { label: 'Pace', value: player.overallStats.paceOverall, color: 'bg-green-500' },
                  { label: 'Shooting', value: player.overallStats.shootingOverall, color: 'bg-red-500' },
                  { label: 'Passing', value: player.overallStats.passingOverall, color: 'bg-blue-500' },
                  { label: 'Dribbling', value: player.overallStats.dribblingOverall, color: 'bg-yellow-500' },
                  { label: 'Defending', value: player.overallStats.defendingOverall, color: 'bg-purple-500' },
                  { label: 'Physical', value: player.overallStats.physicalOverall, color: 'bg-orange-500' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-dark-400">{stat.label}</span>
                      <span className="font-bold">{stat.value}</span>
                    </div>
                    <div className="stat-bar">
                      <motion.div
                        className={cn('stat-bar-fill', stat.color)}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Player Info */}
            <div className="mt-6 pt-4 border-t border-dark-700 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Age</span>
                <span>{player.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Version</span>
                <span className="text-neon-cyan">{player.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Base Price</span>
                <span className="text-neon-green">{formatCurrency(player.basePrice * 1000000)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatPanel />
      
      {/* Player Detail Modal */}
      <AnimatePresence>
        <PlayerDetailModal
          player={selectedPlayer}
          isOpen={!!selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          purchasePrice={selectedPlayerPrice}
        />
      </AnimatePresence>
    </div>
  );
}
