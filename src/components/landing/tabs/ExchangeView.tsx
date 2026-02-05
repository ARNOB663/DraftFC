'use client';

import { ArrowLeftRight, RefreshCcw } from 'lucide-react';

export function ExchangeView() {
    return (
        <div className="animate-fade-in space-y-4">
            <h2 className="text-3xl font-black text-white italic">SQUAD EXCHANGE</h2>
            <div className="bg-fc-blue-900/40 backdrop-blur-xl rounded-2xl border border-fc-blue-600/30 p-8 flex flex-col items-center justify-center min-h-[400px]">
                <ArrowLeftRight className="w-16 h-16 text-indigo-400 opacity-50 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Squad Building Challenges</h3>
                <p className="text-fc-blue-300 text-center max-w-md">
                    Exchange your players for special rewards and unique player cards.
                </p>
                <button className="mt-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all">
                    <RefreshCcw className="w-4 h-4" />
                    View Challenges
                </button>
            </div>
        </div>
    );
}
