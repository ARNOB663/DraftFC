'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGameStore } from '@/stores/gameStore';
import { LayoutGrid, Loader2, Users, Plus, LogIn, Trophy, Zap, Shield, Bot, Brain, Target, Flame, Newspaper, Gift, Star, Gem, Mail, Settings, User, Coins, ShoppingCart, ArrowLeftRight, Store, ChevronRight } from 'lucide-react';
import type { AIDifficulty } from '@/types';

import { MarketView } from '@/components/landing/tabs/MarketView';
import { ExchangeView } from '@/components/landing/tabs/ExchangeView';
import { LeaguesView } from '@/components/landing/tabs/LeaguesView';
import { QuestsView } from '@/components/landing/tabs/QuestsView';
import { StoreView } from '@/components/landing/tabs/StoreView';
import { BottomNav } from '@/components/landing/BottomNav';

// Bottom Nav Tabs - Moved to component, keeping here only if needed for reference, but logic handles it.
// Actually, we can remove this array if we use the one in BottomNav or pass it. 
// But BottomNav has its own internal 'navTabs' definition which matches. 
// We will use the component's internal tabs or if it requires props? 
// Checking BottomNav definition: it has internal 'navTabs'. 
// So we can remove 'bottomTabs' from here entirely or keep it unused. 
// To be clean, I'll remove it if it's not used elsewhere.
// It WAS used in return statement map. Now we use BottomNav component.

export default function HomePage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'ai'>('menu');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('home');

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
    <div className="relative min-h-screen overflow-hidden bg-fc-dark flex flex-col items-center">
      {/* Background layers - Premium Esports Aesthetic */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-hero-premium" />
        <div className="absolute inset-0 bg-grid-subtle opacity-40" />
        {/* Animated diagonal light streaks */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-1/4 top-0 w-[150%] h-[150%] bg-gradient-to-br from-fc-purple/10 via-transparent to-transparent animate-pulse-subtle"
            style={{ transform: 'rotate(-15deg) translateY(-20%)' }}
          />
          <div
            className="absolute -right-1/4 bottom-0 w-[100%] h-[80%] bg-gradient-to-tl from-fc-cyan/8 via-fc-blue-900/15 to-transparent"
            style={{ transform: 'rotate(-15deg) translateY(10%)' }}
          />
        </div>
        {/* Soft vignette overlay */}
        <div className="absolute inset-0 bg-vignette pointer-events-none" />
      </div>

      {/* Top Bar - Wide & Sleek */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 px-6 md:px-12 bg-gradient-to-b from-fc-dark/95 to-transparent backdrop-blur-sm">
        <div className="h-full flex items-center justify-between max-w-[1500px] mx-auto w-full">
          {/* Left: User info */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-fc-blue-800/50 border-2 border-fc-gold/50 flex-shrink-0 shadow-lg shadow-fc-gold/20">
              <div className="absolute inset-0 flex items-center justify-center text-fc-gold font-bold text-base">⚽</div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-sm tracking-wide uppercase font-display leading-tight">
                {playerName || 'Player'}
              </span>
              <div className="flex items-center gap-2">
                <span className="bg-fc-blue-700 text-fc-cyan text-[9px] font-bold px-1.5 py-0.5 rounded border border-fc-cyan/30">LVL 13</span>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-fc-blue-900/80 rounded-full overflow-hidden border border-fc-blue-700/50">
                    <div className="h-full bg-gradient-to-r from-fc-cyan to-fc-blue-500 rounded-full" style={{ width: '84%' }} />
                  </div>
                  <span className="text-[9px] text-fc-blue-300 font-medium">337 XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Currencies */}
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-fc-mid/80 backdrop-blur-md px-3 py-1 rounded-full border border-fc-gold/30 shadow-lg shadow-black/20">
                <Coins className="w-3.5 h-3.5 text-fc-gold fill-fc-gold" />
                <span className="text-fc-gold font-black text-xs tracking-wider">2.2M</span>
              </div>
              <div className="flex items-center gap-1.5 bg-fc-mid/80 backdrop-blur-md px-3 py-1 rounded-full border border-fc-purple/30 shadow-lg shadow-black/20">
                <Gem className="w-3.5 h-3.5 text-fc-purple fill-fc-purple" />
                <span className="text-fc-purple font-black text-xs tracking-wider">1,045</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full bg-fc-mid/80 hover:bg-fc-blue-800 border border-white/10 text-fc-blue-300 hover:text-white transition-all hover:scale-105">
                <Mail className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full bg-fc-mid/80 hover:bg-fc-blue-800 border border-white/10 text-fc-blue-300 hover:text-white transition-all hover:scale-105">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - AAA Dashboard Layout (Wide & Low Profile) */}
      <main className="relative z-20 min-h-screen w-full px-4 md:px-8 pt-28 pb-24 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1600px] w-full mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && mode === 'menu' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:h-[450px]"
              >
                {/* Left Panel - AI Challenge (Featured) - Low Profile */}
                <motion.div
                  className="col-span-1 lg:col-span-5 relative h-[300px] lg:h-full group overflow-hidden rounded-2xl border border-fc-purple/30 bg-fc-mid shadow-2xl shadow-black/40"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Background Image - Haaland */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src="/dummy_image/image1.png"
                      alt="AI Challenge - Haaland"
                      fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-fc-dark via-fc-mid/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-fc-purple/50 to-transparent mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" />
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-6 z-10 flex flex-col items-start bg-gradient-to-t from-fc-dark/95 via-fc-dark/60 to-transparent">
                    <div className="mb-2 px-2 py-0.5 bg-fc-purple text-white text-[9px] font-black uppercase tracking-widest rounded shadow-lg shadow-fc-purple/40">
                      Featured
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase leading-none tracking-tighter mb-2 drop-shadow-xl">
                      AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-fc-purple to-fc-cyan">Challenge</span>
                    </h2>
                    <p className="text-white/80 text-xs md:text-sm mb-4 font-medium max-w-xs drop-shadow-md leading-relaxed hidden lg:block">
                      Master your strategy against elite AI opponents.
                    </p>

                    <button
                      onClick={() => setMode('ai')}
                      className="group/btn relative px-5 py-2.5 bg-white rounded-lg overflow-hidden shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-fc-purple to-fc-blue-600 opacity-90" />
                      <div className="absolute inset-0 bg-white/30 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                      <span className="relative flex items-center gap-2 text-white font-black text-sm uppercase tracking-wider">
                        Play vs AI <ChevronRight className="w-4 h-4" />
                      </span>
                    </button>

                    {/* Connection Status Indicator */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-fc-green animate-pulse' : 'bg-red-500'}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${isConnected ? 'text-fc-green' : 'text-red-500'}`}>
                        {isConnected ? 'Connected' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Right Grid - Modes - Strict 3-Row Grid */}
                <div className="col-span-1 lg:col-span-7 grid grid-rows-3 gap-3 h-full">

                  {/* Row 1: Real-Time Match (Green) */}
                  <motion.button
                    onClick={() => setMode('create')}
                    className="row-span-1 relative group overflow-hidden rounded-2xl border border-fc-green/30 bg-fc-mid shadow-lg w-full h-full"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-fc-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute -right-16 -top-16 w-56 h-56 bg-fc-green/10 rounded-full blur-3xl group-hover:bg-fc-green/20 transition-colors" />

                    <div className="relative h-full flex flex-row justify-between items-center p-5">
                      <div className="text-left z-10">
                        <div className="flex items-center gap-1.5 mb-1 text-fc-green">
                          <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Live</span>
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-black text-white uppercase italic tracking-tight drop-shadow-lg">
                          Real-Time Match
                        </h3>
                      </div>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 transform rotate-12">
                        <Trophy className="w-20 h-20 text-fc-green drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                      </div>
                    </div>
                  </motion.button>



                  {/* Row 2: Split Container (Squad Builder & Join Game) */}
                  <div className="row-span-1 grid grid-cols-2 gap-3">
                    {/* Squad Builder (Gold) */}
                    <motion.button
                      onClick={handleTestSquad}
                      className="relative group overflow-hidden rounded-2xl border border-fc-yellow/30 bg-fc-mid shadow-lg w-full h-full"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-fc-yellow/10 to-transparent" />
                      <div className="relative h-full flex flex-col justify-end p-5 text-left z-10">
                        <Shield strokeWidth={2.5} className="w-8 h-8 text-fc-yellow mb-2 group-hover:scale-110 transition-transform drop-shadow-glow" />
                        <h3 className="text-lg font-black text-white uppercase leading-none mb-1">Squad Builder</h3>
                        <p className="text-fc-yellow text-[9px] font-bold uppercase tracking-wider">Strategy</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
                    </motion.button>

                    {/* Join Game (Cyan) */}
                    <motion.button
                      onClick={() => setMode('join')}
                      className="relative group overflow-hidden rounded-2xl border border-fc-cyan/30 bg-fc-mid shadow-lg w-full h-full"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute inset-0 z-0">
                        <Image
                          src="/dummy_image/image2.png"
                          alt="Join Game"
                          fill
                          className="object-cover object-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 mix-blend-luminosity group-hover:mix-blend-normal"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-fc-mid via-fc-mid/50 to-transparent" />
                      </div>
                      <div className="relative h-full flex flex-col justify-end p-5 text-left z-10">
                        <Users className="w-8 h-8 text-fc-cyan mb-2 drop-shadow-glow group-hover:rotate-12 transition-transform" />
                        <h3 className="text-lg font-black text-white uppercase leading-none mb-1 drop-shadow-md">Join Game</h3>
                        <p className="text-fc-cyan text-[9px] font-bold uppercase tracking-wider">Lobbies</p>
                      </div>
                    </motion.button>
                  </div>

                  {/* Row 3: Casual Mode / Stats (Blue) */}
                  <motion.div
                    className="row-span-1 relative group overflow-hidden rounded-2xl border border-fc-blue-700 bg-gradient-to-r from-fc-blue-900/60 to-fc-mid/60 backdrop-blur-md shadow-lg w-full h-full"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="h-full flex items-center justify-between px-6 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="px-2 py-0.5 bg-fc-blue-600 text-white text-[8px] font-bold uppercase tracking-widest rounded w-fit">Season 1</span>
                        <span className="text-white text-lg font-black uppercase italic">Road to Glory</span>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-center group-hover:scale-110 transition-transform">
                          <span className="block text-xl font-black text-white">12</span>
                          <span className="text-[9px] text-fc-blue-300 uppercase font-bold tracking-wider">Games</span>
                        </div>
                        <div className="text-center group-hover:scale-110 transition-transform">
                          <span className="block text-xl font-black text-fc-green">8</span>
                          <span className="text-[9px] text-fc-blue-300 uppercase font-bold tracking-wider">Wins</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab !== 'home' && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {activeTab === 'market' && <MarketView />}
                {activeTab === 'exchange' && <ExchangeView />}
                {activeTab === 'leagues' && <LeaguesView />}
                {activeTab === 'quests' && <QuestsView />}
                {activeTab === 'store' && <StoreView />}
              </motion.div>
            )}

            {mode !== 'menu' && (
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-xl mx-auto w-full bg-fc-mid/95 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-30"
              >
                {/* Back Button */}
                <button
                  onClick={() => setMode('menu')}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </button>

                {/* Forms - Keeping compact style */}
                {mode === 'create' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-white uppercase italic">Create Match</h3>
                      <p className="text-fc-blue-300 text-sm">Start your own game room</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-fc-blue-200 uppercase tracking-wide">Your Name</label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full bg-fc-dark/50 border border-fc-blue-600/50 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-fc-cyan transition-colors"
                        placeholder="ENTER NAME..."
                      />
                    </div>

                    {error && <p className="text-red-500 font-bold text-center bg-red-500/10 py-2 rounded-lg text-sm">{error}</p>}

                    <button
                      onClick={handleCreateRoom}
                      disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-fc-cyan to-fc-blue-600 rounded-lg text-white font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Plus className="w-5 h-5" /> Create Room</>}
                    </button>
                  </div>
                )}

                {/* Join & AI Forms omitted for brevity but would be same style */}
                {mode === 'join' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-white uppercase italic">Join Game</h3>
                      <p className="text-fc-blue-300 text-sm">Enter room code to connect</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-fc-blue-200 uppercase tracking-wide">Your Name</label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full bg-fc-dark/50 border border-fc-blue-600/50 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-fc-cyan transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-fc-blue-200 uppercase tracking-wide">Room Code</label>
                      <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="w-full bg-fc-dark/50 border border-fc-blue-600/50 rounded-lg px-4 py-3 text-white text-center text-xl font-mono tracking-[0.5em] placeholder-white/30 focus:outline-none focus:border-fc-cyan transition-colors uppercase"
                        maxLength={8}
                      />
                    </div>
                    <button
                      onClick={handleJoinRoom}
                      disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-fc-green to-emerald-600 rounded-lg text-white font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><LogIn className="w-5 h-5" /> Join Room</>}
                    </button>
                  </div>
                )}

                {mode === 'ai' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-white uppercase italic">VS AI</h3>
                      <p className="text-fc-blue-300 text-sm">Single Player Challenge</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-fc-blue-200 uppercase tracking-wide">Your Name</label>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full bg-fc-dark/50 border border-fc-blue-600/50 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-fc-purple transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-fc-blue-200 uppercase tracking-wide">Difficulty</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['easy', 'medium', 'hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setAiDifficulty(diff)}
                            className={`py-2.5 rounded-lg border-2 font-bold uppercase text-[10px] transition-all ${aiDifficulty === diff
                              ? diff === 'easy' ? 'border-fc-green bg-fc-green/20 text-fc-green'
                                : diff === 'medium' ? 'border-fc-yellow bg-fc-yellow/20 text-fc-yellow'
                                  : 'border-red-500 bg-red-500/20 text-red-500'
                              : 'border-white/10 text-white/50 hover:border-white/30'}`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handlePlayAI}
                      disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-fc-purple to-indigo-600 rounded-lg text-white font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Bot className="w-5 h-5" /> Start Match</>}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main >

      <BottomNav
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id);
          setMode('menu');
        }}
      />
    </div >
  );
}
