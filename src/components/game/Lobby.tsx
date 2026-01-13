'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { 
  Copy, 
  Check, 
  Users, 
  Crown, 
  Clock, 
  DollarSign, 
  PlayCircle,
  LogOut,
  UserCheck,
  UserX
} from 'lucide-react';
import { formatBudget } from '@/lib/utils';

export function Lobby() {
  const router = useRouter();
  const { room, currentPlayer, opponent, setReady, startGame, leaveRoom } = useGameStore();
  const [copied, setCopied] = useState(false);

  if (!room || !currentPlayer) return null;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    leaveRoom();
    router.push('/');
  };

  const canStart = room.players.length === 2 && room.players.every(p => p.isReady);
  const isHost = room.players[0]?.id === currentPlayer.id;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold gradient-text mb-2">
            Game Lobby
          </h1>
          <p className="text-dark-400">Waiting for players to get ready</p>
        </motion.div>

        {/* Room Code */}
        <motion.div 
          className="glass-card p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-dark-400 text-sm mb-1">Room Code</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-display font-bold tracking-widest text-neon-cyan">
                  {room.id}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-dark-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-dark-400">
              <Users className="w-5 h-5" />
              <span>{room.players.length}/2 Players</span>
            </div>
          </div>
        </motion.div>

        {/* Players */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Player 1 (Host) */}
          <motion.div
            className={`glass-card p-6 ${room.players[0]?.isReady ? 'neon-glow-cyan' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-neon-cyan" />
              </div>
              <div>
                <p className="text-xs text-dark-400 uppercase tracking-wide">Host</p>
                <h3 className="text-xl font-bold">{room.players[0]?.name || 'Waiting...'}</h3>
              </div>
              {room.players[0]?.isReady && (
                <UserCheck className="w-6 h-6 text-green-400 ml-auto" />
              )}
            </div>

            {room.players[0] && (
              <div className="flex items-center gap-4 text-sm text-dark-400">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {formatBudget(room.players[0].budget)}
                </span>
              </div>
            )}
          </motion.div>

          {/* Player 2 */}
          <motion.div
            className={`glass-card p-6 ${room.players[1]?.isReady ? 'neon-glow-purple' : ''} ${!opponent ? 'border-dashed' : ''}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {opponent ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-neon-purple" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-400 uppercase tracking-wide">Challenger</p>
                    <h3 className="text-xl font-bold">{opponent.name}</h3>
                  </div>
                  {opponent.isReady && (
                    <UserCheck className="w-6 h-6 text-green-400 ml-auto" />
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-dark-400">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatBudget(opponent.budget)}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-4">
                <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center mb-3">
                  <UserX className="w-6 h-6 text-dark-500" />
                </div>
                <p className="text-dark-400">Waiting for opponent...</p>
                <p className="text-dark-500 text-sm mt-1">Share the room code to invite</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Game Settings */}
        <motion.div
          className="glass-card p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon-cyan" />
            Game Settings
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <p className="text-dark-400 mb-1">Starting Budget</p>
              <p className="font-bold text-neon-green">{formatBudget(room.settings.startingBudget)}</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <p className="text-dark-400 mb-1">Squad Size</p>
              <p className="font-bold">{room.settings.squadSize} Players</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <p className="text-dark-400 mb-1">Auction Time</p>
              <p className="font-bold">{room.settings.auctionTimeLimit}s</p>
            </div>
            <div className="bg-dark-800/50 rounded-xl p-4 text-center">
              <p className="text-dark-400 mb-1">Total Auctions</p>
              <p className="font-bold">{room.settings.totalPlayers}</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleLeave}
            className="btn-danger flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Leave Room
          </button>

          <button
            onClick={() => setReady(!currentPlayer.isReady)}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              currentPlayer.isReady
                ? 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
                : 'btn-secondary'
            }`}
          >
            {currentPlayer.isReady ? (
              <>
                <UserCheck className="w-5 h-5" />
                Ready!
              </>
            ) : (
              <>
                <UserX className="w-5 h-5" />
                Not Ready
              </>
            )}
          </button>

          {isHost && (
            <button
              onClick={startGame}
              disabled={!canStart}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Start Game
            </button>
          )}
        </motion.div>

        {!canStart && room.players.length === 2 && (
          <p className="text-center text-dark-400 text-sm mt-4">
            Both players must be ready to start
          </p>
        )}
      </div>
    </div>
  );
}
