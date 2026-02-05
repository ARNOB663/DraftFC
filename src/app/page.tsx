'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGameStore } from '@/stores/gameStore';
import { Loader2, Users, Plus, LogIn, Trophy, Zap, Shield, Bot, Brain, Target, Flame, Newspaper, Gift, Star, Gem, Mail, Settings, User, Coins, ShoppingCart, ArrowLeftRight, Store } from 'lucide-react';
import type { AIDifficulty } from '@/types';

// Bottom Nav Tabs
const bottomTabs = [
  { icon: <Target className="w-5 h-5" />, label: 'QUESTS', id: 'quests' },
  { icon: <Trophy className="w-5 h-5" />, label: 'LEAGUES', id: 'leagues' },
  { icon: <ShoppingCart className="w-5 h-5" />, label: 'MARKET', id: 'market' },
  { icon: <ArrowLeftRight className="w-5 h-5" />, label: 'EXCHANGE', id: 'exchange' },
  { icon: <Store className="w-5 h-5" />, label: 'STORE', id: 'store' },
];

// Sidebar Nav Items
const sidebarItems = [
  { icon: <Newspaper className="w-5 h-5" />, label: 'NEWS' },
  { icon: <Gift className="w-5 h-5" />, label: 'DAILY LOGIN' },
  { icon: <Star className="w-5 h-5" />, label: 'STAR PASS' },
  { icon: <Gem className="w-5 h-5" />, label: 'EARN GEMS' },
];

export default function HomePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'ai'>('menu');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('market');
  const [activeSidebar, setActiveSidebar] = useState<string | null>(null);

  const { connect, isConnected, isConnecting, createRoom, createAIGame, createTestSquadRoom, joinRoom, room } = useGameStore();

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

  const handlePlayAI = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createAIGame(playerName.trim(), aiDifficulty);
    } catch (err: any) {
      setError(err.message || 'Failed to start AI game');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSquad = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!isConnected) {
      setError('Not connected to server. Please wait...');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createTestSquadRoom(playerName.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to create test room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-fc-dark">
      {/* Background layers - Premium Esports Aesthetic */}
      <div className="fixed inset-0 z-0">
        {/* Deep radial glow base gradient */}
        <div className="absolute inset-0 bg-hero-premium" />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-grid-subtle opacity-40" />

        {/* Animated diagonal light streaks */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-1/4 top-0 w-[150%] h-[150%] bg-gradient-to-br from-indigo-600/10 via-transparent to-transparent animate-pulse-subtle"
            style={{ transform: 'rotate(-15deg) translateY(-20%)' }}
          />
          <div
            className="absolute -right-1/4 bottom-0 w-[100%] h-[80%] bg-gradient-to-tl from-fc-accent/8 via-indigo-900/15 to-transparent"
            style={{ transform: 'rotate(-15deg) translateY(10%)' }}
          />
          {/* Accent light beam */}
          <div
            className="absolute left-1/3 top-0 w-px h-[200%] bg-gradient-to-b from-transparent via-fc-accent/30 to-transparent opacity-60"
            style={{ transform: 'rotate(-15deg)' }}
          />
        </div>

        {/* Enhanced radial glow orbs */}
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-indigo-600/12 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute bottom-[-5%] right-1/4 w-[500px] h-[500px] bg-fc-accent/10 rounded-full blur-[80px] animate-float-slow" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/3 right-[-5%] w-[400px] h-[400px] bg-indigo-500/8 rounded-full blur-[60px]" />

        {/* Soft vignette overlay */}
        <div className="absolute inset-0 bg-vignette pointer-events-none" />
      </div>

      {/* Hero Player Image - Left side */}
      <div className="fixed left-0 bottom-0 z-10 w-[40%] lg:w-[35%] xl:w-[30%] h-full pointer-events-none hidden lg:block">
        <div className="relative w-full h-full">
          <div className="absolute bottom-0 left-0 w-full h-[85%]">
            <Image
              src="/hero.png"
              alt="Featured Player"
              fill
              className="object-contain object-bottom"
              priority
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = '0';
              }}
            />
            {/* Fallback gradient silhouette */}
            <div className="absolute inset-0 flex items-end justify-center opacity-40">
              <div className="w-3/4 h-4/5 bg-gradient-to-t from-fc-blue-600/40 via-fc-blue-700/20 to-transparent rounded-t-full blur-md" />
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-fc-accent/5 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Left Sidebar */}
      <aside className="fixed left-0 top-0 h-full z-30 hidden md:flex flex-col items-center py-20 px-2 gap-2 bg-gradient-to-b from-fc-blue-900/80 to-fc-dark/80 backdrop-blur-md border-r border-fc-blue-600/20 w-20">
        {sidebarItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveSidebar(item.label)}
            className={`group flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl transition-all duration-200 hover:bg-fc-blue-600/40 hover:scale-105 ${activeSidebar === item.label
              ? 'bg-fc-blue-600/50 shadow-lg shadow-fc-accent/20'
              : 'bg-fc-blue-800/30'
              }`}
          >
            <span className={`transition-colors duration-200 ${activeSidebar === item.label ? 'text-fc-accent' : 'text-fc-blue-300 group-hover:text-white'}`}>
              {item.icon}
            </span>
            <span className={`text-[9px] font-semibold tracking-wide text-center leading-tight ${activeSidebar === item.label ? 'text-fc-accent' : 'text-fc-blue-300 group-hover:text-white'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </aside>

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 px-4 lg:px-6 md:pl-24 bg-gradient-to-b from-fc-dark/90 to-transparent backdrop-blur-sm">
        <div className="h-full flex items-center justify-between max-w-[1800px] mx-auto">
          {/* Left: User info */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-fc-blue-800/50 border-2 border-fc-gold/50 flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center text-fc-gold font-bold text-lg">⚽</div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm lg:text-base tracking-wide">
                {playerName || 'Player'}
              </span>
              <div className="flex items-center gap-2">
                <span className="bg-fc-blue-700 text-fc-accent text-[10px] font-bold px-1.5 py-0.5 rounded">13</span>
                <div className="hidden sm:flex items-center gap-1">
                  <div className="w-16 h-1.5 bg-fc-blue-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-fc-accent to-fc-blue-400 rounded-full" style={{ width: '84%' }} />
                  </div>
                  <span className="text-[10px] text-fc-blue-300">337 / 400 XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Currencies */}
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-fc-blue-800/50 backdrop-blur-sm px-2 lg:px-3 py-1.5 rounded-lg border border-fc-blue-600/30">
                <Coins className="w-4 h-4 text-fc-gold" />
                <span className="text-fc-gold font-bold text-xs lg:text-sm">2,229,249</span>
              </div>
              <div className="flex items-center gap-1.5 bg-fc-blue-800/50 backdrop-blur-sm px-2 lg:px-3 py-1.5 rounded-lg border border-fc-blue-600/30">
                <span className="text-red-400">💎</span>
                <span className="text-red-400 font-bold text-xs lg:text-sm">1,045</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg bg-fc-blue-800/30 hover:bg-fc-blue-700/50 text-fc-blue-300 hover:text-white transition-all">
                <Mail className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-fc-blue-800/30 hover:bg-fc-blue-700/50 text-fc-blue-300 hover:text-white transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 min-h-screen pt-20 pb-20 px-4 lg:px-6 md:pl-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="lg:ml-[25%] xl:ml-[20%]">
            {/* Game Menu Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-lg mx-auto lg:mx-0"
            >
              {/* Title - Golden Ratio Typography */}
              <motion.div
                className="text-center lg:text-left mb-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl md:text-4xl font-display font-black mb-1 text-shadow-hero">
                  <span className="text-gradient-gold">FOOTBALL</span>
                </h1>
                <h2 className="text-2xl md:text-2xl font-display font-black text-white text-shadow-hero">AUCTION</h2>
                <p className="mt-2 text-fc-blue-300 text-base tracking-wide">Draft Your Dream Team</p>
              </motion.div>

              {/* Connection status - Enhanced visibility */}
              {isConnecting && (
                <div className="flex items-center justify-center lg:justify-start gap-2 text-fc-accent mb-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Connecting to server...</span>
                </div>
              )}

              {!isConnected && !isConnecting && (
                <div className="flex flex-col items-center lg:items-start gap-2 text-red-400 mb-4">
                  <span className="font-medium">Unable to connect to server</span>
                  <button onClick={() => connect()} className="text-sm text-fc-accent hover:underline font-medium">
                    Click to retry
                  </button>
                </div>
              )}

              {isConnected && (
                <div className="status-connected justify-center lg:justify-start mb-4">
                  <div className="status-dot" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              )}

              {/* Main Menu Card - Premium Glass */}
              <motion.div
                className="glass-premium p-4 lg:p-4"
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
                      {/* Player Name Input - Premium */}
                      <div>
                        <label className="block text-sm font-semibold text-fc-blue-200 mb-2">Your Name</label>
                        <input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Enter your name..."
                          className="input-premium px-4 py-3"
                          maxLength={20}
                        />
                      </div>

                      {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

                      {/* Action Blocks Grid - 2x2 Layout */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Play vs AI - Primary Block */}
                        <button
                          onClick={() => setMode('ai')}
                          disabled={!isConnected}
                          className="col-span-2 group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                          style={{
                            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(99, 102, 241, 0.2) 100%)',
                            border: '1px solid rgba(0, 229, 255, 0.3)',
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-fc-accent/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fc-accent to-indigo-500 flex items-center justify-center shadow-lg shadow-fc-accent/30">
                              <Bot className="w-7 h-7 text-white" />
                            </div>
                            <div className="text-left">
                              <p className="text-lg font-bold text-white">Play vs AI</p>
                              <p className="text-sm text-fc-blue-300">Practice against AI opponent</p>
                            </div>
                          </div>
                        </button>

                        {/* Create Multiplayer Block */}
                        <button
                          onClick={() => setMode('create')}
                          disabled={!isConnected}
                          className="group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                          style={{
                            background: 'rgba(30, 58, 138, 0.3)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                          }}
                        >
                          <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative flex flex-col items-center gap-2 py-2">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:border-indigo-400/50 transition-colors">
                              <Plus className="w-6 h-6 text-indigo-400" />
                            </div>
                            <p className="text-sm font-bold text-white">Create</p>
                            <p className="text-xs text-fc-blue-400">Multiplayer</p>
                          </div>
                        </button>

                        {/* Join Game Block */}
                        <button
                          onClick={() => setMode('join')}
                          disabled={!isConnected}
                          className="group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                          style={{
                            background: 'rgba(30, 58, 138, 0.3)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                          }}
                        >
                          <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative flex flex-col items-center gap-2 py-2">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:border-indigo-400/50 transition-colors">
                              <Users className="w-6 h-6 text-indigo-400" />
                            </div>
                            <p className="text-sm font-bold text-white">Join</p>
                            <p className="text-xs text-fc-blue-400">Game Room</p>
                          </div>
                        </button>

                        {/* Test Squad Builder Block */}
                        <button
                          onClick={handleTestSquad}
                          disabled={!isConnected || isLoading}
                          className="col-span-2 group relative overflow-hidden rounded-2xl p-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                          }}
                        >
                          <div className="absolute inset-0 bg-fc-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative flex items-center justify-center gap-3">
                            {isLoading ? <Loader2 className="w-5 h-5 text-fc-gold animate-spin" /> : <Target className="w-5 h-5 text-fc-gold" />}
                            <p className="text-sm font-bold text-fc-gold">{isLoading ? 'Creating...' : 'Test Squad Builder'}</p>
                          </div>
                        </button>
                      </div>

                      {/* Features Strip */}
                      <div className="flex items-center justify-center gap-6 pt-2">
                        <div className="flex items-center gap-2 text-fc-blue-400">
                          <Trophy className="w-4 h-4 text-fc-accent" />
                          <span className="text-xs font-medium">Compete</span>
                        </div>
                        <div className="flex items-center gap-2 text-fc-blue-400">
                          <Zap className="w-4 h-4 text-green-400" />
                          <span className="text-xs font-medium">Real-time</span>
                        </div>
                        <div className="flex items-center gap-2 text-fc-blue-400">
                          <Shield className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-medium">Strategy</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {mode === 'create' && (
                    <motion.div
                      key="create"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Create New Game</h3>
                        <p className="text-fc-blue-300 text-sm">Start a room and invite a friend</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-fc-blue-200 mb-2">Your Name</label>
                        <input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Enter your name..."
                          className="input-premium px-4 py-3"
                          maxLength={20}
                        />
                      </div>

                      {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

                      <div className="flex gap-3">
                        <button onClick={() => { setMode('menu'); setError(''); }} className="btn-secondary-hero flex-1 py-3 px-4 text-white">
                          Back
                        </button>
                        <button
                          onClick={handleCreateRoom}
                          disabled={isLoading}
                          className="btn-primary-hero flex-1 py-3 px-4 text-white flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Create</>}
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
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">Join Game</h3>
                        <p className="text-fc-blue-300 text-sm">Enter the room code to join</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-fc-blue-200 mb-2">Your Name</label>
                        <input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Enter your name..."
                          className="input-premium px-4 py-3"
                          maxLength={20}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-fc-blue-200 mb-2">Room Code</label>
                        <input
                          type="text"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          placeholder="Enter room code..."
                          className="input-premium px-4 py-3 text-center text-xl tracking-widest font-mono"
                          maxLength={8}
                        />
                      </div>

                      {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

                      <div className="flex gap-3">
                        <button onClick={() => { setMode('menu'); setError(''); }} className="btn-secondary-hero flex-1 py-3 px-4 text-white">
                          Back
                        </button>
                        <button
                          onClick={handleJoinRoom}
                          disabled={isLoading}
                          className="btn-primary-hero flex-1 py-3 px-4 text-white flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-5 h-5" /> Join</>}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {mode === 'ai' && (
                    <motion.div
                      key="ai"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                          <Bot className="w-6 h-6 text-fc-accent" />
                          Play vs AI
                        </h3>
                        <p className="text-fc-blue-300 text-sm">Practice against an AI opponent</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-fc-blue-200 mb-2">Your Name</label>
                        <input
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Enter your name..."
                          className="input-premium px-4 py-3"
                          maxLength={20}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-fc-blue-200 mb-3">AI Difficulty</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setAiDifficulty('easy')}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${aiDifficulty === 'easy' ? 'border-green-500 bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-fc-blue-600/50 hover:border-green-500/50 hover:bg-green-500/10'}`}
                          >
                            <Target className={`w-6 h-6 mx-auto mb-1 ${aiDifficulty === 'easy' ? 'text-green-400' : 'text-fc-blue-400'}`} />
                            <p className={`text-sm font-medium ${aiDifficulty === 'easy' ? 'text-green-400' : 'text-fc-blue-300'}`}>Easy</p>
                          </button>
                          <button
                            onClick={() => setAiDifficulty('medium')}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${aiDifficulty === 'medium' ? 'border-yellow-500 bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'border-fc-blue-600/50 hover:border-yellow-500/50 hover:bg-yellow-500/10'}`}
                          >
                            <Brain className={`w-6 h-6 mx-auto mb-1 ${aiDifficulty === 'medium' ? 'text-yellow-400' : 'text-fc-blue-400'}`} />
                            <p className={`text-sm font-medium ${aiDifficulty === 'medium' ? 'text-yellow-400' : 'text-fc-blue-300'}`}>Medium</p>
                          </button>
                          <button
                            onClick={() => setAiDifficulty('hard')}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${aiDifficulty === 'hard' ? 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-fc-blue-600/50 hover:border-red-500/50 hover:bg-red-500/10'}`}
                          >
                            <Flame className={`w-6 h-6 mx-auto mb-1 ${aiDifficulty === 'hard' ? 'text-red-400' : 'text-fc-blue-400'}`} />
                            <p className={`text-sm font-medium ${aiDifficulty === 'hard' ? 'text-red-400' : 'text-fc-blue-300'}`}>Hard</p>
                          </button>
                        </div>
                      </div>

                      {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

                      <div className="flex gap-3">
                        <button onClick={() => { setMode('menu'); setError(''); }} className="btn-secondary-hero flex-1 py-3 px-4 text-white">
                          Back
                        </button>
                        <button
                          onClick={handlePlayAI}
                          disabled={isLoading}
                          className="btn-primary-hero flex-1 py-3 px-4 text-white flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Bot className="w-5 h-5" /> Start Game</>}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Footer - Enhanced with subtle styling */}
              <motion.p
                className="text-center lg:text-left text-fc-blue-400/80 text-sm mt-4 tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="text-fc-gold">$1B Budget</span> • Real-time Bidding • Build Your Dream Team
              </motion.p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-gradient-to-t from-fc-dark via-fc-blue-900/95 to-fc-blue-900/80 backdrop-blur-lg border-t border-fc-blue-600/30">
        <div className="h-full max-w-4xl mx-auto px-2 lg:px-4">
          <div className="h-full flex items-center justify-around lg:justify-center lg:gap-2">
            {bottomTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-1 min-w-[64px] lg:min-w-[100px] h-full px-3 lg:px-6 transition-all duration-200 ${isActive ? 'text-fc-gold' : 'text-fc-blue-300 hover:text-white'}`}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-fc-gold via-amber-400 to-fc-gold rounded-b-full shadow-lg shadow-fc-gold/50" />
                  )}
                  <span className={`transition-all duration-200 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}`}>
                    {tab.icon}
                  </span>
                  <span className={`text-[10px] lg:text-xs font-bold tracking-wide ${isActive ? 'text-fc-gold' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
