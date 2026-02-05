'use client';

import { Trophy, Shield } from 'lucide-react';

export function LeaguesView() {
    return (
        <div className="animate-fade-in space-y-4">
            <h2 className="text-3xl font-black text-white italic">LEAGUES</h2>
            <div className="bg-fc-blue-900/40 backdrop-blur-xl rounded-2xl border border-fc-blue-600/30 p-8 flex flex-col items-center justify-center min-h-[400px]">
                <Trophy className="w-16 h-16 text-purple-400 opacity-50 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Division Rivals</h3>
                <p className="text-fc-blue-300 text-center max-w-md mb-6">
                    Climb the ranks and compete against players from around the world.
                </p>

                <div className="flex items-center gap-4 bg-fc-blue-800/30 px-6 py-3 rounded-xl border border-fc-blue-600/30">
                    <Shield className="w-8 h-8 text-purple-400" />
                    <div>
                        <p className="text-xs text-fc-blue-300 uppercase font-bold tracking-wider">Current Rank</p>
                        <p className="text-xl font-black text-white">DIVISION 4</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
