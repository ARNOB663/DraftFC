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

            {/* Hero Player Image - Fixed on left side */}
            <div className="fixed left-0 bottom-0 z-10 w-[45%] lg:w-[40%] xl:w-[35%] h-full pointer-events-none hidden md:block animate-slide-in-left">
                <div className="relative w-full h-full">
                    {/* Player image container */}
                    <div className="absolute bottom-0 left-0 w-full h-[90%]">
                        <Image
                            src="/hero.png"
                            alt="Featured Player"
                            fill
                            className="object-contain object-bottom"
                            priority
                            onError={(e) => {
                                // Hide image if not found
                                (e.target as HTMLImageElement).style.opacity = '0';
                            }}
                        />
                        {/* Fallback gradient silhouette if no image */}
                        <div className="absolute inset-0 flex items-end justify-center opacity-50">
                            <div className="w-3/4 h-4/5 bg-gradient-to-t from-fc-blue-600/30 via-fc-blue-700/20 to-transparent rounded-t-full blur-sm" />
                        </div>
                    </div>

                    {/* Glow effect behind player */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-fc-accent/5 rounded-full blur-3xl" />
                </div>
            </div>

            {/* Navigation Components */}
            <SidebarNav />
            <TopBar />
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Main Content Area */}
            <main className="relative z-20 min-h-screen pt-20 pb-20 lg:pb-24 px-4 lg:px-6">
                <div className="max-w-[1800px] mx-auto h-full">
                    {/* Content positioned to the right of hero */}
                    <div className="md:ml-[35%] lg:ml-[32%] xl:ml-[28%] lg:pl-8">

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
