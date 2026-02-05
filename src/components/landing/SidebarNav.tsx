'use client';

import { useState } from 'react';
import { Newspaper, Gift, Star, Gem, Menu, X } from 'lucide-react';

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href?: string;
}

const navItems: NavItem[] = [
    { icon: <Newspaper className="w-5 h-5" />, label: 'NEWS' },
    { icon: <Gift className="w-5 h-5" />, label: 'DAILY LOGIN' },
    { icon: <Star className="w-5 h-5" />, label: 'STAR PASS' },
    { icon: <Gem className="w-5 h-5" />, label: 'EARN GEMS' },
];

export function SidebarNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeItem, setActiveItem] = useState<string | null>(null);

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-fc-blue-800/80 backdrop-blur-sm rounded-lg border border-fc-blue-600/30 text-white hover:bg-fc-blue-700/80 transition-colors"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed left-0 top-0 h-full z-40
          flex flex-col items-center py-20 px-2 gap-2
          bg-gradient-to-b from-fc-blue-900/90 to-fc-dark/90 backdrop-blur-md
          border-r border-fc-blue-600/20
          transition-transform duration-300 ease-out
          lg:translate-x-0 lg:w-20 lg:py-24
          ${isOpen ? 'translate-x-0 w-20' : '-translate-x-full w-20'}
        `}
            >
                {navItems.map((item, index) => (
                    <button
                        key={item.label}
                        onClick={() => setActiveItem(item.label)}
                        className={`
              group flex flex-col items-center justify-center gap-1
              w-16 h-16 rounded-xl
              transition-all duration-200
              hover:bg-fc-blue-600/40 hover:scale-105
              ${activeItem === item.label
                                ? 'bg-fc-blue-600/50 shadow-lg shadow-fc-accent/20'
                                : 'bg-fc-blue-800/30'
                            }
            `}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <span className={`
              transition-colors duration-200
              ${activeItem === item.label ? 'text-fc-accent' : 'text-fc-blue-300 group-hover:text-white'}
            `}>
                            {item.icon}
                        </span>
                        <span className={`
              text-[9px] font-semibold tracking-wide text-center leading-tight
              ${activeItem === item.label ? 'text-fc-accent' : 'text-fc-blue-300 group-hover:text-white'}
            `}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </aside>
        </>
    );
}
