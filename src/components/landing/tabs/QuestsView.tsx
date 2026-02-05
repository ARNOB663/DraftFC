'use client';

import { Target, Gift } from 'lucide-react';

export function QuestsView() {
    return (
        <div className="animate-fade-in space-y-4">
            <h2 className="text-3xl font-black text-white italic">QUESTS</h2>
            <div className="bg-fc-blue-900/40 backdrop-blur-xl rounded-2xl border border-fc-blue-600/30 p-8 flex flex-col items-center justify-center min-h-[400px]">
                <Target className="w-16 h-16 text-fc-gold opacity-50 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Daily Quests</h3>
                <p className="text-fc-blue-300 text-center max-w-md">
                    Complete daily challenges to earn XP and rewards. Check back later for new quests!
                </p>

                <div className="mt-8 w-full max-w-md space-y-3">
                    <div className="bg-fc-blue-800/50 p-4 rounded-xl border border-fc-blue-600/30 flex items-center gap-4">
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                            <Gift className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-sm">Play a Match</h4>
                            <div className="w-full bg-fc-blue-950 h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="bg-green-500 h-full w-1/3" />
                            </div>
                        </div>
                        <span className="text-green-400 font-bold text-sm">1/3</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
