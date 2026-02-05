'use client';

import Image from 'next/image';
import { Mail, Settings, User, Coins } from 'lucide-react';

interface Currency {
    icon: React.ReactNode;
    value: string;
    color: string;
}

const currencies: Currency[] = [
    {
        icon: <Coins className="w-4 h-4" />,
        value: '2,229,249',
        color: 'text-fc-gold'
    },
    {
        icon: <span className="w-4 h-4 flex items-center justify-center text-red-400">💎</span>,
        value: '1,045',
        color: 'text-red-400'
    },
    {
        icon: <span className="w-4 h-4 flex items-center justify-center text-green-400 font-bold text-xs">FP</span>,
        value: '0',
        color: 'text-green-400'
    },
];

export function TopBar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-30 h-16 px-4 lg:px-6 lg:pl-24">
            <div className="h-full flex items-center justify-between max-w-[1800px] mx-auto">
                {/* Left side - User info */}
                <div className="flex items-center gap-3 animate-slide-in-left">
                    {/* Club Badge */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-fc-blue-800/50 border-2 border-fc-gold/50 flex-shrink-0">
                        <Image
                            src="/badge.png"
                            alt="Club Badge"
                            fill
                            className="object-contain p-1"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-fc-gold font-bold text-lg">
                            ⚽
                        </div>
                    </div>

                    {/* User info */}
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm lg:text-base tracking-wide">
                            Slikgoats
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="bg-fc-blue-700 text-fc-accent text-[10px] font-bold px-1.5 py-0.5 rounded">
                                13
                            </span>
                            <div className="flex items-center gap-1">
                                <div className="w-20 h-1.5 bg-fc-blue-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-fc-accent to-fc-blue-400 rounded-full transition-all duration-500"
                                        style={{ width: '84%' }}
                                    />
                                </div>
                                <span className="text-[10px] text-fc-blue-300">337 / 400 XP</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Currencies and actions */}
                <div className="flex items-center gap-2 lg:gap-4 animate-slide-in-right">
                    {/* Currencies */}
                    <div className="hidden sm:flex items-center gap-2 lg:gap-3">
                        {currencies.map((currency, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1.5 bg-fc-blue-800/50 backdrop-blur-sm px-2 lg:px-3 py-1.5 rounded-lg border border-fc-blue-600/30 hover:border-fc-blue-500/50 transition-colors cursor-pointer"
                            >
                                <span className={currency.color}>{currency.icon}</span>
                                <span className={`${currency.color} font-bold text-xs lg:text-sm tabular-nums`}>
                                    {currency.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Action icons */}
                    <div className="flex items-center gap-1 lg:gap-2">
                        <button className="p-2 rounded-lg bg-fc-blue-800/30 hover:bg-fc-blue-700/50 text-fc-blue-300 hover:text-white transition-all duration-200">
                            <Mail className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg bg-fc-blue-800/30 hover:bg-fc-blue-700/50 text-fc-blue-300 hover:text-white transition-all duration-200">
                            <User className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg bg-fc-blue-800/30 hover:bg-fc-blue-700/50 text-fc-blue-300 hover:text-white transition-all duration-200">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
