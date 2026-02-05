import React, { ComponentType } from 'react';
import { Target, Trophy, ShoppingCart, ArrowLeftRight, Store, Home } from 'lucide-react';

interface NavTab {
    icon: ComponentType<{ className?: string }>;
    label: string;
    id: string;
}

const navTabs: NavTab[] = [
    { icon: Home, label: 'HOME', id: 'home' },
    { icon: Target, label: 'QUESTS', id: 'quests' },
    { icon: Trophy, label: 'LEAGUES', id: 'leagues' },
    { icon: ShoppingCart, label: 'MARKET', id: 'market' },
    { icon: ArrowLeftRight, label: 'EXCHANGE', id: 'exchange' },
    { icon: Store, label: 'STORE', id: 'store' },
];

interface BottomNavProps {
    activeTab: string;
    onTabChange: (id: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-gradient-to-t from-fc-dark via-fc-blue-900/95 to-fc-blue-900/90 backdrop-blur-lg border-t border-fc-blue-600/30">
            <div className="h-full max-w-4xl mx-auto px-2 lg:px-4">
                <div className="h-full flex items-center justify-around lg:justify-center lg:gap-1 overflow-x-auto scrollbar-hide">
                    {navTabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`
                  relative flex flex-col items-center justify-center gap-0.5
                  min-w-[60px] lg:min-w-[90px] h-full px-2 lg:px-4
                  transition-all duration-200
                  ${isActive
                                        ? 'text-fc-gold'
                                        : 'text-fc-blue-300 hover:text-white'
                                    }
                `}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-fc-gold via-amber-400 to-fc-gold rounded-b-full shadow-lg shadow-fc-gold/50" />
                                )}

                                {/* Icon with glow effect when active */}
                                <span className={`
                  transition-all duration-200
                  ${isActive ? 'scale-105 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}
                `}>
                                    <Icon className="w-4 h-4" />
                                </span>

                                {/* Label */}
                                <span className={`
                  text-[9px] lg:text-[10px] font-bold tracking-tight
                  transition-all duration-200
                  ${isActive ? 'text-fc-gold' : ''}
                `}>
                                    {tab.label}
                                </span>

                                {/* Hover/active background glow */}
                                <div className={`
                  absolute inset-0 rounded-lg transition-opacity duration-200
                  ${isActive
                                        ? 'opacity-100 bg-fc-gold/10'
                                        : 'opacity-0 hover:opacity-100 hover:bg-fc-blue-600/20'
                                    }
                `} />
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
