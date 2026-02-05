'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SidebarNav } from './SidebarNav';
import { TopBar } from './TopBar';
import { MainCards } from './MainCards';
import { BottomNav } from './BottomNav';
import { GameOptions } from './GameOptions';
import { QuestsView } from './tabs/QuestsView';
import { LeaguesView } from './tabs/LeaguesView';
import { MarketView } from './tabs/MarketView';
import { ExchangeView } from './tabs/ExchangeView';
import { StoreView } from './tabs/StoreView';

export function LandingPage() {
    const [activeTab, setActiveTab] = useState('home');
    const [activeSidebar, setActiveSidebar] = useState<string | null>(null);

    return (
        <div className="relative min-h-screen overflow-hidden bg-fc-dark">
            {/* Background layers */}
            <div className="fixed inset-0 z-0">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-fc-dark via-fc-blue-900 to-fc-darker" />

                {/* Diagonal shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Large diagonal stripe 1 */}
                    <div
                        className="absolute -left-1/4 top-0 w-[150%] h-[150%] bg-gradient-to-br from-fc-blue-800/20 to-transparent"
                        style={{ transform: 'rotate(-15deg) translateY(-20%)' }}
                    />
                    {/* Large diagonal stripe 2 */}
                    <div
                        className="absolute -right-1/4 bottom-0 w-[100%] h-[80%] bg-gradient-to-tl from-indigo-900/30 to-transparent"
                        style={{ transform: 'rotate(-15deg) translateY(10%)' }}
                    />
                    {/* Accent line */}
                    <div
                        className="absolute left-1/4 top-0 w-1 h-[200%] bg-gradient-to-b from-transparent via-fc-accent/20 to-transparent"
                        style={{ transform: 'rotate(-15deg)' }}
                    />
                </div>

                {/* Radial glow effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-fc-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />

                {/* Subtle noise texture overlay */}
                <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
            </div>

            {/* Hero Player Image - Full Visibility & Interactive */}
            <div className="fixed left-0 bottom-0 z-25 w-[32%] lg:w-[30%] xl:w-[26%] h-full hidden md:block transition-transform duration-300">
                <div className="relative w-full h-full">
                    {/* Player image container - Full Height to ensure nothing is cut off */}
                    <div className="absolute inset-0 w-full h-full">
                        <Image
                            src="/hero.png"
                            alt="Featured Player"
                            fill
                            className="object-contain object-left-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                            priority
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.opacity = '0';
                            }}
                        />
                        {/* High quality glow behind player */}
                        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-fc-blue-600/20 via-transparent to-transparent opacity-40 pointer-events-none" />
                    </div>

                    {/* Accent glow for depth */}
                    <div className="absolute bottom-10 left-1/4 w-full h-1/2 bg-fc-accent/10 rounded-full blur-[120px] pointer-events-none" />
                </div>
            </div>

            {/* Navigation Components */}
            <SidebarNav />
            <TopBar />
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content Area - Perfectly Aligned */}
            <main className="relative z-20 min-h-screen pt-16 pb-20 px-4 lg:px-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-[1800px] mx-auto h-full">
                    {/* Positioned exactly to the right of the hero image to prevent overlap */}
                    <div className="md:ml-[32%] lg:ml-[30%] xl:ml-[26%] lg:pl-4 transition-all duration-500">

                        {/* Dynamic Content based on Active Tab */}
                        <div className="pt-4 lg:pt-8 min-h-[60vh]">
                            {activeTab === 'home' && (
                                <div className="space-y-8">
                                    <GameOptions />
                                    <MainCards />
                                </div>
                            )}
                            {activeTab === 'quests' && <QuestsView />}
                            {activeTab === 'leagues' && <LeaguesView />}
                            {activeTab === 'market' && <MarketView />}
                            {activeTab === 'exchange' && <ExchangeView />}
                            {activeTab === 'store' && <StoreView />}
                        </div>

                    </div>
                </div>
            </main>

            {/* Mobile Hero - Show smaller version at top on mobile */}
            <div className="md:hidden fixed top-16 left-0 w-1/2 h-48 z-5 pointer-events-none">
                <Image
                    src="/hero.png"
                    alt="Featured Player"
                    fill
                    className="object-contain object-left-bottom opacity-60"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.opacity = '0';
                    }}
                />
            </div>
        </div>
    );
}
