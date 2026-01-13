'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { PlayerCard, MiniPlayerCard, PlayerDetailModal } from './PlayerCard';
import type { Player } from '@/types';
import { BidPanel } from './BidPanel';
import { cn, formatBudget, formatCurrency, parseAltPositions, getPositionDisplayColor } from '@/lib/utils';
import {
  DollarSign,
  Users,
  Gavel,
  TrendingUp,
  Zap,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  Trophy,
  Target
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

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedPlayerPrice, setSelectedPlayerPrice] = useState<number | undefined>(undefined);
  const [showMySquad, setShowMySquad] = useState(false);
  const [showOpponentSquad, setShowOpponentSquad] = useState(false);

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
    if (lastBid) {
      soundManager.play('bid_placed');
    }
  }, [lastBid, currentAuction?.currentBid, soundEnabled]);

  useEffect(() => {
    if (!currentAuction || !soundEnabled) return;
    if (currentAuction.status === 'sold') {
      soundManager.play('sold');
    }
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
  const timerProgress = (timeRemaining / room.settings.auctionTimeLimit) * 100;
  
  const timerColor = timeRemaining <= 5
    ? 'text-red-500 border-red-500'
    : timeRemaining <= 10
      ? 'text-yellow-500 border-yellow-500'
      : 'text-neon-cyan border-neon-cyan';

  const handleBid = (amount: number) => {
    placeBid(amount);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Floating Header Bar */}
      <div className="sticky top-0 z-40 bg-dark-950/90 backdrop-blur-lg border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Auction Progress */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-neon-cyan" />
                <span className="text-sm font-medium">
                  Auction <span className="text-neon-cyan">{room.soldPlayers.length + 1}</span>/{room.settings.totalPlayers}
                </span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-dark-700" />
              <div className="hidden sm:flex items-center gap-2">
                <Trophy className="w-4 h-4 text-rarity-legendary" />
                <span className="text-xs text-dark-400">
                  {room.soldPlayers.length} sold
                </span>
              </div>
            </div>

            {/* Center: Timer */}
            <div className="flex items-center gap-3">
              <motion.div
                className={cn(
                  'relative flex items-center justify-center w-14 h-14 rounded-full border-4 transition-colors',
                  timerColor
                )}
                animate={timeRemaining <= 5 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <span className={cn('text-xl font-display font-black', timerColor.split(' ')[0])}>
                  {timeRemaining}
                </span>
                {/* Progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={151}
                    strokeDashoffset={151 - (151 * timerProgress) / 100}
                    className={cn('transition-all duration-1000 opacity-30', timerColor.split(' ')[0])}
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
              
              {/* Status Badge */}
              <AnimatePresence mode="wait">
                {status !== 'active' && (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider',
                      status === 'going_once' && 'bg-yellow-500/20 text-yellow-400',
                      status === 'going_twice' && 'bg-orange-500/20 text-orange-400',
                      status === 'sold' && 'bg-green-500/20 text-green-400',
                    )}
                  >
                    {status === 'going_once' && 'Going Once!'}
                    {status === 'going_twice' && 'Going Twice!'}
                    {status === 'sold' && 'SOLD!'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-dark-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Player Info Panels */}
          <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            {/* Your Panel */}
            <motion.div
              className={cn(
                'glass-card overflow-hidden transition-all',
                isHighestBidder && 'ring-2 ring-neon-cyan'
              )}
            >
              <div 
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setShowMySquad(!showMySquad)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      isHighestBidder ? 'bg-neon-cyan/30' : 'bg-neon-cyan/20'
                    )}>
                      <User className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{currentPlayer.name}</p>
                      <p className="text-neon-green font-mono text-lg font-bold">
                        {formatBudget(currentPlayer.budget)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400 bg-dark-800 px-2 py-1 rounded-full">
                      {currentPlayer.squad.length}/{room.settings.squadSize}
                    </span>
                    {showMySquad ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
                {isHighestBidder && (
                  <div className="mt-2 text-xs text-neon-cyan flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Highest Bidder
                  </div>
                )}
              </div>
              
              {/* Squad Grid */}
              <AnimatePresence>
                {showMySquad && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-dark-700"
                  >
                    <div className="p-3 grid grid-cols-4 gap-1.5">
                      {Array.from({ length: room.settings.squadSize }).map((_, i) => (
                        <div key={i} className="aspect-[3/4]">
                          {currentPlayer.squad[i] ? (
                            <MiniPlayerCard 
                              player={currentPlayer.squad[i]} 
                              onClick={() => handlePlayerClick(currentPlayer.squad[i])}
                            />
                          ) : (
                            <div className="w-full h-full rounded-lg border border-dashed border-dark-600 flex items-center justify-center bg-dark-800/30">
                              <span className="text-[10px] text-dark-500">{i + 1}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Opponent Panel */}
            <motion.div
              className={cn(
                'glass-card overflow-hidden transition-all',
                currentBidder === opponent?.id && 'ring-2 ring-neon-purple'
              )}
            >
              <div 
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setShowOpponentSquad(!showOpponentSquad)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      currentBidder === opponent?.id ? 'bg-neon-purple/30' : 'bg-neon-purple/20'
                    )}>
                      {opponent?.isAI ? (
                        <Bot className="w-5 h-5 text-neon-purple" />
                      ) : (
                        <Users className="w-5 h-5 text-neon-purple" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm flex items-center gap-2">
                        {opponent?.name || 'Opponent'}
                        {opponent?.isAI && (
                          <span className="text-[10px] bg-neon-purple/20 text-neon-purple px-1.5 py-0.5 rounded">
                            AI
                          </span>
                        )}
                      </p>
                      <p className="text-neon-green font-mono text-lg font-bold">
                        {opponent ? formatBudget(opponent.budget) : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-400 bg-dark-800 px-2 py-1 rounded-full">
                      {opponent?.squad.length || 0}/{room.settings.squadSize}
                    </span>
                    {showOpponentSquad ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
                {currentBidder === opponent?.id && (
                  <div className="mt-2 text-xs text-neon-purple flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Highest Bidder
                  </div>
                )}
              </div>
              
              {/* Opponent Squad Grid */}
              <AnimatePresence>
                {showOpponentSquad && opponent && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-dark-700"
                  >
                    <div className="p-3 grid grid-cols-4 gap-1.5">
                      {Array.from({ length: room.settings.squadSize }).map((_, i) => (
                        <div key={i} className="aspect-[3/4]">
                          {opponent.squad[i] ? (
                            <MiniPlayerCard 
                              player={opponent.squad[i]} 
                              onClick={() => handlePlayerClick(opponent.squad[i])}
                            />
                          ) : (
                            <div className="w-full h-full rounded-lg border border-dashed border-dark-600 flex items-center justify-center bg-dark-800/30">
                              <span className="text-[10px] text-dark-500">{i + 1}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Bid History - Desktop */}
            <div className="glass-card p-4 hidden lg:block">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-neon-cyan" />
                Recent Bids
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {bidHistory.slice().reverse().slice(0, 5).map((bid, i) => (
                    <motion.div
                      key={`${bid.timestamp}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        'p-2 rounded-lg text-sm',
                        bid.playerId === currentPlayer.id
                          ? 'bg-neon-cyan/10 border border-neon-cyan/30'
                          : 'bg-dark-800/50'
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-xs truncate">{bid.playerName}</span>
                        <span className="text-neon-green font-mono font-bold text-xs">
                          {formatCurrency(bid.amount)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {bidHistory.length === 0 && (
                  <p className="text-dark-500 text-xs text-center py-2">
                    No bids yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Center - Player Card & Bidding */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            {/* Current Bid Display */}
            <motion.div
              className="text-center mb-6"
              key={currentBid}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
            >
              <p className="text-dark-400 text-sm mb-1">Current Bid</p>
              <div className="text-5xl md:text-6xl font-display font-black text-neon-green">
                {formatCurrency(currentBid)}
              </div>
              {currentBidder && (
                <p className="text-sm mt-2">
                  by{' '}
                  <span className={cn(
                    'font-medium',
                    currentBidder === currentPlayer.id ? 'text-neon-cyan' : 'text-neon-purple'
                  )}>
                    {currentBidder === currentPlayer.id ? 'You' : opponent?.name}
                  </span>
                </p>
              )}
            </motion.div>

            {/* Player Card */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <PlayerCard player={player} size="lg" showStats spotlight />
              </motion.div>
            </div>

            {/* Bid Panel */}
            <div className="max-w-md mx-auto">
              <BidPanel
                currentBid={currentBid}
                budget={currentPlayer.budget}
                canBid={canBid}
                isHighestBidder={isHighestBidder}
                onBid={handleBid}
                minIncrement={room.settings.minBidIncrement}
              />
            </div>
          </div>

          {/* Right Sidebar - Stats & Info */}
          <div className="lg:col-span-3 space-y-4 order-3">
            {/* Player Stats Card */}
            <div className="glass-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-neon-cyan" />
                Player Attributes
              </h3>

              {player.overallStats && (
                <div className="space-y-3">
                  {[
                    { label: 'PAC', full: 'Pace', value: player.overallStats.paceOverall, color: '#22C55E' },
                    { label: 'SHO', full: 'Shooting', value: player.overallStats.shootingOverall, color: '#EF4444' },
                    { label: 'PAS', full: 'Passing', value: player.overallStats.passingOverall, color: '#3B82F6' },
                    { label: 'DRI', full: 'Dribbling', value: player.overallStats.dribblingOverall, color: '#F59E0B' },
                    { label: 'DEF', full: 'Defending', value: player.overallStats.defendingOverall, color: '#8B5CF6' },
                    { label: 'PHY', full: 'Physical', value: player.overallStats.physicalOverall, color: '#F97316' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: stat.color }}
                      >
                        {stat.value}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-dark-400">{stat.full}</span>
                        </div>
                        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: stat.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.value}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Player Info Card */}
            <div className="glass-card p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-neon-cyan" />
                Player Info
              </h3>
              <div className="space-y-3 text-sm">
                {/* Position Section - Main + Alternates */}
                <div className="py-2 border-b border-dark-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-dark-400">Position</span>
                    <span className="font-bold text-neon-cyan">{player.position}</span>
                  </div>
                  {/* Alternate Positions */}
                  {parseAltPositions(player.altPositions).length > 0 && (
                    <div className="mt-2">
                      <span className="text-dark-500 text-xs">Can also play:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {parseAltPositions(player.altPositions).map((altPos) => {
                          const posColors = getPositionDisplayColor(altPos);
                          return (
                            <span
                              key={altPos}
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-bold border',
                                posColors.bg,
                                posColors.text,
                                posColors.border
                              )}
                            >
                              {altPos}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dark-700">
                  <span className="text-dark-400">Age</span>
                  <span className="font-medium">{player.age} years</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dark-700">
                  <span className="text-dark-400">Version</span>
                  <span className="font-medium text-neon-purple">{player.version}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dark-700">
                  <span className="text-dark-400">Rarity</span>
                  <span className={cn(
                    'font-bold uppercase text-xs px-2 py-0.5 rounded',
                    player.rarity === 'legendary' && 'bg-rarity-legendary/20 text-rarity-legendary',
                    player.rarity === 'epic' && 'bg-rarity-epic/20 text-rarity-epic',
                    player.rarity === 'rare' && 'bg-rarity-rare/20 text-rarity-rare',
                  )}>
                    {player.rarity}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-dark-400">Base Price</span>
                  <span className="font-bold text-neon-green">{formatCurrency(player.basePrice * 1000000)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions - Mobile */}
            <div className="lg:hidden glass-card p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-neon-cyan" />
                Recent Bids
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {bidHistory.slice().reverse().slice(0, 3).map((bid, i) => (
                  <div
                    key={`${bid.timestamp}-${i}`}
                    className={cn(
                      'p-2 rounded-lg text-sm flex justify-between',
                      bid.playerId === currentPlayer.id
                        ? 'bg-neon-cyan/10'
                        : 'bg-dark-800/50'
                    )}
                  >
                    <span className="text-xs">{bid.playerName}</span>
                    <span className="text-neon-green font-mono text-xs font-bold">
                      {formatCurrency(bid.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel */}
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
