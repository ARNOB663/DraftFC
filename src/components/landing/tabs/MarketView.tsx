'use client';

import { ShoppingCart, TrendingUp } from 'lucide-react';

export function MarketView() {
    return (
        <div className="animate-fade-in space-y-4">
            <h2 className="text-3xl font-black text-white italic">TRANSFER MARKET</h2>
            <div className="bg-fc-blue-900/40 backdrop-blur-xl rounded-2xl border border-fc-blue-600/30 p-8 flex flex-col items-center justify-center min-h-[400px]">
                <ShoppingCart className="w-16 h-16 text-blue-400 opacity-50 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Transfer Market</h3>
                <p className="text-fc-blue-300 text-center max-w-md">
                    Buy and sell players to build your ultimate squad. Market updates live every hour.
                </p>
                <div className="mt-6 flex items-center gap-2 text-green-400 bg-green-900/20 px-4 py-2 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold text-sm">Market is Open</span>
                </div>
            </div>
        </div>
    );
}
