'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { PlayerCard } from './PlayerCard';
import { cn, formatBudget, formatCurrency } from '@/lib/utils';
import { 
  Trophy, 
  Crown, 
  Star, 
  Users, 
  DollarSign, 
  Target,
  Sparkles,
  Home,
  RotateCcw,
  TrendingUp
} from 'lucide-react';

export function GameResult() {
  const router = useRouter();
  const { gameResult, room, currentPlayer, reset } = useGameStore();

  if (!gameResult || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Loading results...</p>
        </div>
      </div>
    );
  }

  const { winner, loser, winnerScore, loserScore, scoreDifference, mvp } = gameResult;
  const isWinner = currentPlayer?.id === winner.id;

  const handlePlayAgain = () => {
    reset();
    router.push('/');
  };

  const handleGoHome = () => {
    reset();
    router.push('/');
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Winner Announcement */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Confetti-like decoration */}
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <div className="relative">
              <Trophy className="w-24 h-24 text-rarity-legendary" />
              <motion.div
                className="absolute -inset-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                {[...Array(8)].map((_, i) => (
                  <Sparkles
                    key={i}
                    className="absolute w-4 h-4 text-rarity-legendary"
                    style={{
                      top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 8)}%`,
                      left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 8)}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-display font-black mb-2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isWinner ? (
              <span className="gradient-text-gold">VICTORY!</span>
            ) : (
              <span className="text-dark-300">DEFEAT</span>
            )}
          </motion.h1>

          <motion.p
            className="text-xl text-dark-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {winner.name} wins with a score of {winnerScore.totalScore.toFixed(2)}!
          </motion.p>
        </motion.div>

        {/* Score Comparison */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {/* Winner Card */}
          <div className={cn(
            'glass-card p-6',
            isWinner ? 'neon-glow-gold border-rarity-legendary/50' : 'neon-glow-cyan border-neon-cyan/50'
          )}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-rarity-legendary/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-rarity-legendary" />
              </div>
              <div>
                <p className="text-xs text-rarity-legendary uppercase tracking-wide">Winner</p>
                <h3 className="text-2xl font-bold">{winner.name}</h3>
              </div>
              <div className="ml-auto text-right">
                <p className="text-3xl font-display font-black text-rarity-legendary">
                  {winnerScore.totalScore.toFixed(2)}
                </p>
                <p className="text-xs text-dark-400">Total Score</p>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-dark-800/50 rounded-xl p-3 text-center">
                <Star className="w-5 h-5 text-neon-cyan mx-auto mb-1" />
                <p className="text-lg font-bold">{winnerScore.breakdown.averageRating.toFixed(1)}</p>
                <p className="text-xs text-dark-400">Avg Rating</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-3 text-center">
                <Target className="w-5 h-5 text-neon-green mx-auto mb-1" />
                <p className="text-lg font-bold">{winnerScore.breakdown.positionBalance}%</p>
                <p className="text-xs text-dark-400">Position</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-3 text-center">
                <Users className="w-5 h-5 text-neon-purple mx-auto mb-1" />
                <p className="text-lg font-bold">{winnerScore.breakdown.synergy}</p>
                <p className="text-xs text-dark-400">Synergy</p>
              </div>
            </div>

            {/* Squad */}
            <div>
              <p className="text-sm text-dark-400 mb-3">Squad ({winner.squad.length} players)</p>
              <div className="flex flex-wrap gap-2">
                {winner.squad.map((player) => (
                  <motion.div
                    key={player._id}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium',
                      `bg-rarity-${player.rarity}/20 border border-rarity-${player.rarity}/30`
                    )}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="font-bold">{player.rating}</span>
                    <span className="mx-1 text-dark-400">|</span>
                    <span>{player.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-700 flex justify-between text-sm">
              <span className="text-dark-400">Remaining Budget</span>
              <span className="text-neon-green font-mono">{formatBudget(winner.budget)}</span>
            </div>
          </div>

          {/* Loser Card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-dark-700 flex items-center justify-center">
                <Users className="w-6 h-6 text-dark-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase tracking-wide">Runner Up</p>
                <h3 className="text-2xl font-bold text-dark-300">{loser.name}</h3>
              </div>
              <div className="ml-auto text-right">
                <p className="text-3xl font-display font-black text-dark-400">
                  {loserScore.totalScore.toFixed(2)}
                </p>
                <p className="text-xs text-dark-500">Total Score</p>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-dark-800/50 rounded-xl p-3 text-center">
                <Star className="w-5 h-5 text-dark-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-dark-300">{loserScore.breakdown.averageRating.toFixed(1)}</p>
                <p className="text-xs text-dark-500">Avg Rating</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-3 text-center">
                <Target className="w-5 h-5 text-dark-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-dark-300">{loserScore.breakdown.positionBalance}%</p>
                <p className="text-xs text-dark-500">Position</p>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-3 text-center">
                <Users className="w-5 h-5 text-dark-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-dark-300">{loserScore.breakdown.synergy}</p>
                <p className="text-xs text-dark-500">Synergy</p>
              </div>
            </div>

            {/* Squad */}
            <div>
              <p className="text-sm text-dark-500 mb-3">Squad ({loser.squad.length} players)</p>
              <div className="flex flex-wrap gap-2">
                {loser.squad.map((player) => (
                  <motion.div
                    key={player._id}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-dark-800/50 border border-dark-700"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="font-bold text-dark-300">{player.rating}</span>
                    <span className="mx-1 text-dark-500">|</span>
                    <span className="text-dark-400">{player.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-700 flex justify-between text-sm">
              <span className="text-dark-500">Remaining Budget</span>
              <span className="text-dark-400 font-mono">{formatBudget(loser.budget)}</span>
            </div>
          </div>
        </motion.div>

        {/* MVP Section */}
        {mvp && (
          <motion.div
            className="glass-card p-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-6 h-6 text-rarity-legendary" />
                  <h3 className="text-xl font-bold">Match MVP</h3>
                </div>
                <p className="text-dark-400">
                  The highest rated player in the winning squad
                </p>
              </div>
              <div className="flex-shrink-0">
                <PlayerCard player={mvp} size="md" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Game Stats */}
        <motion.div
          className="glass-card p-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neon-cyan" />
            Game Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-neon-cyan">
                {room.soldPlayers.length}
              </p>
              <p className="text-sm text-dark-400">Players Sold</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-neon-green">
                {formatCurrency(
                  room.soldPlayers.reduce((sum, sp) => sum + sp.price, 0)
                )}
              </p>
              <p className="text-sm text-dark-400">Total Spent</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-neon-purple">
                {formatCurrency(
                  Math.max(...room.soldPlayers.map(sp => sp.price))
                )}
              </p>
              <p className="text-sm text-dark-400">Highest Bid</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-display font-bold text-rarity-legendary">
                {scoreDifference.toFixed(2)}
              </p>
              <p className="text-sm text-dark-400">Score Diff</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <button
            onClick={handlePlayAgain}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
          <button
            onClick={handleGoHome}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
