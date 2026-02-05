'use client';

import { Store, Coins } from 'lucide-react';

export function StoreView() {
    return (
        <div className="animate-fade-in space-y-4">
            <h2 className="text-3xl font-black text-white italic">STORE</h2>
            <div className="bg-fc-blue-900/40 backdrop-blur-xl rounded-2xl border border-fc-blue-600/30 p-8 flex flex-col items-center justify-center min-h-[400px]">
                <Store className="w-16 h-16 text-fc-gold opacity-50 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Pack Store</h3>
                <p className="text-fc-blue-300 text-center max-w-md">
                    Open packs to find the best players for your team. value packs available now!
                </p>
                <div className="mt-6 flex items-center gap-2 bg-fc-gold/20 text-fc-gold px-4 py-2 rounded-lg border border-fc-gold/30">
                    <Coins className="w-4 h-4" />
                    <span className="font-bold text-sm">Special Offers Available</span>
                </div>
            </div>
        </div>
    );
}
