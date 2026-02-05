'use client';

import { useState } from 'react';
import { Bot, Target, Plus, Users, Loader2 } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';

export function GameOptions() {
    const { connect, isConnected, createRoom, createAIGame, createTestSquadRoom, joinRoom } = useGameStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'ai'>('menu');
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    const handleCreateRoom = async () => {
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await createRoom(playerName.trim());
        } catch (err: any) {
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

    if (mode === 'menu') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {/* Play vs AI */}
                <button
                    onClick={() => setMode('ai')}
                    disabled={!isConnected}
                    className="group relative h-32 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20 bg-gradient-to-br from-cyan-900/40 via-cyan-800/40 to-cyan-900/40 border border-cyan-500/30 backdrop-blur-sm"
                >
                    <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
                    <div className="relative h-full p-6 flex flex-col items-center justify-center gap-2">
                        <Bot className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="text-white font-bold text-lg">Play vs AI</span>
                    </div>
                </button>

                {/* Test Squad Builder */}
                <button
                    onClick={() => setMode('create')} // Prepare to enter name for squad builder too? Or separate? 
                    // The original code had a name input first for everything.
                    // Let's simplified this: The user needs to enter name first for ANY action if not set.
                    // For now, let's just use the modal approach for each or a shared name input.
                    // Re-using the logic from the massive page.tsx, let's make a unified specialized view for "Enter Name" if needed?
                    // Or just keep the modes.
                    // Let's stick to the modes for now since that's what the user is used to, but styled better.
                    className="hidden" // Hiding this loop-back for a sec, actually let's just make the main buttons open the specific modes
                />


                <div className="col-span-1 md:col-span-2 space-y-4">
                    <div className="mb-6 bg-fc-blue-900/40 p-4 rounded-xl border border-fc-blue-600/30">
                        <label className="block text-sm font-medium text-fc-blue-300 mb-2">Your Name</label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="Enter your name..."
                            className="w-full px-4 py-3 bg-fc-blue-800/50 border border-fc-blue-600/50 rounded-xl text-white placeholder-fc-blue-400 focus:outline-none focus:border-fc-accent transition-colors"
                            maxLength={20}
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setMode('ai')}
                            disabled={!isConnected}
                            className="p-4 bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border border-cyan-500/30 hover:border-cyan-400/50 rounded-xl flex items-center gap-4 transition-all hover:bg-cyan-600/30 group"
                        >
                            <div className="p-3 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30 group-hover:scale-110 transition-all">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold">Play vs AI</h3>
                                <p className="text-cyan-200/60 text-xs">Practice Match</p>
                            </div>
                        </button>

                        <button
                            onClick={handleTestSquad}
                            disabled={!isConnected || isLoading}
                            className="p-4 bg-gradient-to-br from-fc-gold/10 to-amber-600/10 border border-fc-gold/30 hover:border-fc-gold/50 rounded-xl flex items-center gap-4 transition-all hover:bg-fc-gold/20 group"
                        >
                            <div className="p-3 rounded-lg bg-fc-gold/20 text-fc-gold group-hover:bg-fc-gold/30 group-hover:scale-110 transition-all">
                                <Target className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold">Squad Builder</h3>
                                <p className="text-amber-200/60 text-xs">Test Draft</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('create')}
                            disabled={!isConnected}
                            className="p-4 bg-gradient-to-br from-blue-600/20 to-indigo-800/20 border border-blue-500/30 hover:border-blue-400/50 rounded-xl flex items-center gap-4 transition-all hover:bg-blue-600/30 group"
                        >
                            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 group-hover:scale-110 transition-all">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold">Create Game</h3>
                                <p className="text-blue-200/60 text-xs">Multiplayer</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setMode('join')}
                            disabled={!isConnected}
                            className="p-4 bg-gradient-to-br from-purple-600/20 to-pink-800/20 border border-purple-500/30 hover:border-purple-400/50 rounded-xl flex items-center gap-4 transition-all hover:bg-purple-600/30 group"
                        >
                            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30 group-hover:scale-110 transition-all">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-white font-bold">Join Game</h3>
                                <p className="text-purple-200/60 text-xs">Enter Code</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'ai') {
        return (
            <div className="bg-fc-blue-900/40 backdrop-blur-xl rounded-2xl border border-fc-blue-600/30 p-6 animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Bot className="w-6 h-6 text-fc-accent" />
                    Play vs AI
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-fc-blue-300 mb-3">Select Difficulty</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['easy', 'medium', 'hard'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setAiDifficulty(level as any)}
                                    className={`p-4 rounded-xl border-2 transition-all ${aiDifficulty === level
                                            ? level === 'easy' ? 'border-green-500 bg-green-500/20'
                                                : level === 'medium' ? 'border-yellow-500 bg-yellow-500/20'
                                                    : 'border-red-500 bg-red-500/20'
                                            : 'border-fc-blue-600 bg-fc-blue-800/30 hover:bg-fc-blue-700/50'
                                        }`}
                                >
                                    <span className={`block capitalize font-bold ${aiDifficulty === level ? 'text-white' : 'text-fc-blue-300'
                                        }`}>
                                        {level}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setMode('menu')}
                            className="flex-1 py-3 px-4 bg-fc-blue-700/50 hover:bg-fc-blue-600/50 border border-fc-blue-500/30 text-white font-bold rounded-xl transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={handlePlayAI}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-fc-accent to-fc-blue-500 hover:from-fc-accent/90 hover:to-fc-blue-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Game'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'create') {
        return (
            <div className="bg-fc-blue-900/40 backdrop-blur-xl rounded-2xl border border-fc-blue-600/30 p-6 animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-6 h-6 text-blue-400" />
                    Create Multiplayer
                </h3>

                <p className="text-fc-blue-300 mb-6">Create a room and invite a friend to play against you.</p>

                <div className="flex gap-3">
                    <button
                        onClick={() => setMode('menu')}
                        className="flex-1 py-3 px-4 bg-fc-blue-700/50 hover:bg-fc-blue-600/50 border border-fc-blue-500/30 text-white font-bold rounded-xl transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleCreateRoom}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Room'}
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'join') {
        return (
            <div className="bg-fc-blue-900/40 backdrop-blur-xl rounded-2xl border border-fc-blue-600/30 p-6 animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-400" />
                    Join Game
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-fc-blue-300 mb-2">Room Code</label>
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            placeholder="Enter code..."
                            className="w-full px-4 py-3 bg-fc-blue-800/50 border border-fc-blue-600/50 rounded-xl text-white placeholder-fc-blue-400 focus:outline-none focus:border-purple-500 text-center text-xl tracking-widest font-mono transition-colors"
                            maxLength={8}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setMode('menu')}
                            className="flex-1 py-3 px-4 bg-fc-blue-700/50 hover:bg-fc-blue-600/50 border border-fc-blue-500/30 text-white font-bold rounded-xl transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleJoinRoom}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Room'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
