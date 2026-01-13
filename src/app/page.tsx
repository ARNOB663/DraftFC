'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { Loader2, Users, Plus, LogIn, Trophy, Zap, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { connect, isConnected, isConnecting, createRoom, joinRoom, room } = useGameStore();

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (room) {
      router.push(`/game/${room.id}`);
    }
  }, [room, router]);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createRoom(playerName.trim());
    } catch (err) {
      setError('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div 
          className="text-center mb-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-6xl font-display font-black mb-3">
            <span className="gradient-text">FOOTBALL</span>
          </h1>
          <h2 className="text-4xl md:text-5xl font-display font-black text-white">
            AUCTION
          </h2>
          <p className="mt-4 text-dark-400 text-lg">
            Draft Your Dream Team
          </p>
        </motion.div>

        {/* Connection status */}
        {isConnecting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-neon-cyan mb-6"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting to server...</span>
          </motion.div>
        )}

        {!isConnected && !isConnecting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-2 text-red-400 mb-6"
          >
            <span>Unable to connect to server</span>
            <button 
              onClick={() => connect()}
              className="text-sm text-neon-cyan hover:underline"
            >
              Click to retry
            </button>
          </motion.div>
        )}

        {isConnected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-green-400 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm">Connected</span>
          </motion.div>
        )}

        {/* Main card */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {mode === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Features */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <p className="text-xs text-dark-400">Compete</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-neon-green/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-neon-green" />
                    </div>
                    <p className="text-xs text-dark-400">Real-time</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-neon-purple" />
                    </div>
                    <p className="text-xs text-dark-400">Strategy</p>
                  </div>
                </div>

                <button
                  onClick={() => setMode('create')}
                  disabled={!isConnected}
                  className="btn-primary w-full flex items-center justify-center gap-3"
                >
                  <Plus className="w-5 h-5" />
                  Create Game
                </button>

                <button
                  onClick={() => setMode('join')}
                  disabled={!isConnected}
                  className="btn-secondary w-full flex items-center justify-center gap-3"
                >
                  <Users className="w-5 h-5" />
                  Join Game
                </button>
              </motion.div>
            )}

            {mode === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold mb-1">Create New Game</h3>
                  <p className="text-dark-400 text-sm">Start a room and invite a friend</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    className="input-field"
                    maxLength={20}
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setMode('menu'); setError(''); }}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    disabled={isLoading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {mode === 'join' && (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-xl font-bold mb-1">Join Game</h3>
                  <p className="text-dark-400 text-sm">Enter the room code to join</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name..."
                    className="input-field"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code..."
                    className="input-field font-mono text-center text-xl tracking-widest"
                    maxLength={8}
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setMode('menu'); setError(''); }}
                    className="btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleJoinRoom}
                    disabled={isLoading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-5 h-5" />
                        Join
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-dark-500 text-sm mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          $1B Budget • Real-time Bidding • Build Your Dream Team
        </motion.p>
      </motion.div>
    </div>
  );
}
