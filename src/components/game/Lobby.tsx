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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <div className="w-full max-w-2xl bg-fc-mid/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-fc-blue-900 to-fc-dark border-b border-white/5 p-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-xl font-bold font-display text-white uppercase tracking-wider mb-0.5">
              Game Lobby
            </h1>
            <p className="text-xs text-white/50">Waiting for players to get ready</p>
          </motion.div>
        </div>

        <div className="p-5 space-y-4">
          {/* Room Code */}
          <motion.div
            className="bg-black/20 rounded-xl border border-white/5 p-3 flex items-center justify-between"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wide">Room Code:</span>
              <span className="text-xl font-mono font-bold tracking-widest text-fc-cyan">
                {room.id}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded text-[10px] text-white/50 font-bold uppercase tracking-wider">
                <Users className="w-3 h-3" />
                <span>{room.players.length}/2</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>

          {/* Players Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Player 1 (Host) */}
            <motion.div
              className={`p-3 rounded-xl border transition-all relative overflow-hidden group ${room.players[0]?.isReady ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute top-2 right-2">
                {room.players[0]?.isReady ? (
                  <UserCheck className="w-4 h-4 text-green-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                )}
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-fc-cyan/20 flex items-center justify-center shadow-lg shadow-fc-cyan/10">
                  <Crown className="w-4 h-4 text-fc-cyan" />
                </div>
                <div>
                  <p className="text-[9px] text-fc-cyan font-bold uppercase tracking-widest">Host</p>
                  <h3 className="text-sm font-bold text-white truncate max-w-[100px]">{room.players[0]?.name || 'Waiting...'}</h3>
                </div>
              </div>

              {room.players[0] && (
                <div className="px-2 py-1 bg-black/20 rounded-lg inline-flex items-center gap-1.5 border border-white/5">
                  <DollarSign className="w-3 h-3 text-fc-gold" />
                  <span className="text-xs font-mono font-medium text-white/80">{formatBudget(room.players[0].budget)}</span>
                </div>
              )}
            </motion.div>

            {/* Player 2 */}
            <motion.div
              className={`p-3 rounded-xl border transition-all relative overflow-hidden ${opponent
                  ? room.players[1]?.isReady ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'
                  : 'bg-white/5 border-white/10 border-dashed flex flex-col items-center justify-center text-center py-6'
                }`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {opponent ? (
                <>
                  <div className="absolute top-2 right-2">
                    {opponent.isReady ? (
                      <UserCheck className="w-4 h-4 text-green-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-500/10">
                      <Users className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[9px] text-purple-400 font-bold uppercase tracking-widest">Guest</p>
                      <h3 className="text-sm font-bold text-white truncate max-w-[100px]">{opponent.name}</h3>
                    </div>
                  </div>

                  <div className="px-2 py-1 bg-black/20 rounded-lg inline-flex items-center gap-1.5 border border-white/5">
                    <DollarSign className="w-3 h-3 text-fc-gold" />
                    <span className="text-xs font-mono font-medium text-white/80">{formatBudget(opponent.budget)}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white">Waiting for Opponent</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Game Settings Grid */}
          <motion.div
            className="grid grid-cols-4 gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { label: 'Budget', value: formatBudget(room.settings.startingBudget), color: 'text-fc-green' },
              { label: 'Squad', value: room.settings.squadSize, color: 'text-white' },
              { label: 'Time', value: `${room.settings.auctionTimeLimit}s`, color: 'text-white' },
              { label: 'Rounds', value: room.settings.totalPlayers, color: 'text-white' }
            ].map((setting, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-2 text-center">
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider mb-0.5">{setting.label}</p>
                <p className={`text-xs font-bold ${setting.color}`}>{setting.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div
            className="pt-2 flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleLeave}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/5 hover:border-white/10"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => setReady(!currentPlayer.isReady)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${currentPlayer.isReady
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
                  : 'bg-white/10 border border-white/10 text-white hover:bg-white/20'
                }`}
            >
              {currentPlayer.isReady ? 'Ready!' : 'Not Ready'}
            </button>

            {isHost && (
              <button
                onClick={startGame}
                disabled={!canStart}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-fc-cyan to-fc-blue-600 text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-fc-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
              >
                <PlayCircle className="w-4 h-4" />
                Start
              </button>
            )}
          </motion.div>

          {!canStart && room.players.length === 2 && (
            <p className="text-center text-[10px] text-white/30 uppercase tracking-widest animate-pulse">Waiting for all players</p>
          )}
        </div>
      </div>
    </div>
  );
}
