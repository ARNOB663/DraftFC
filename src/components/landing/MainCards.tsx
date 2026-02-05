'use client';

import Image from 'next/image';
import { Trophy, Users, Zap, Swords } from 'lucide-react';

export function MainCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 animate-fade-in">
            {/* Team of the Week - Large card spanning 2 columns */}
            <div className="md:col-span-2 lg:col-span-2 group">
                <div className="relative h-44 lg:h-52 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-fc-gold/20">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-fc-gold/90 via-amber-500/80 to-yellow-600/90" />

                    {/* Pattern overlay */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full p-5 lg:p-6 flex flex-col justify-between">
                        <h2 className="text-xl lg:text-2xl font-black text-white tracking-wide drop-shadow-lg">
                            TEAM OF THE WEEK
                        </h2>

                        {/* Player silhouettes placeholder */}
                        <div className="absolute right-4 bottom-4 flex items-end gap-2 opacity-80">
                            <div className="w-16 h-20 lg:w-20 lg:h-24 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                                <Users className="w-8 h-8 text-white/60" />
                            </div>
                            <div className="w-16 h-20 lg:w-20 lg:h-24 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                                <Users className="w-8 h-8 text-white/60" />
                            </div>
                        </div>

                        {/* EA Sports badge */}
                        <div className="absolute bottom-4 left-5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                            <span className="text-white font-bold text-sm">EA SPORTS</span>
                        </div>
                    </div>

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-fc-gold/40 to-transparent pointer-events-none" />
                </div>
            </div>

            {/* My Team card */}
            <div className="group">
                <div className="relative h-44 lg:h-52 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-fc-blue-500/20 bg-gradient-to-br from-fc-blue-800 via-fc-blue-700 to-fc-blue-900">
                    {/* Content */}
                    <div className="relative h-full p-4 lg:p-5 flex flex-col">
                        <h3 className="text-lg lg:text-xl font-bold text-white mb-1">MY TEAM</h3>
                        <p className="text-fc-blue-300 text-xs lg:text-sm">4-2-3-1 NARROW</p>

                        {/* Team info */}
                        <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {/* Club badge placeholder */}
                                <div className="w-10 h-10 rounded-full bg-fc-gold/20 border border-fc-gold/40 flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-fc-gold" />
                                </div>
                                {/* Rating badges */}
                                <div className="flex items-center gap-1">
                                    <div className="bg-fc-gold text-fc-dark font-black text-xs px-2 py-1 rounded">
                                        100
                                    </div>
                                    <div className="bg-amber-600 text-white font-bold text-xs px-2 py-1 rounded">
                                        66
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Team value */}
                        <div className="mt-3 pt-3 border-t border-fc-blue-600/30">
                            <p className="text-fc-gold text-xl lg:text-2xl font-black">50,780,000</p>
                            <p className="text-fc-blue-300 text-xs">TEAM VALUE</p>
                        </div>
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-fc-blue-500/30 to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Live Events */}
            <div className="group">
                <div className="relative h-32 lg:h-36 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20 bg-gradient-to-br from-cyan-600 via-blue-600 to-fc-blue-700">
                    {/* Crystal/diamond pattern overlay */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute right-0 top-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_right,rgba(255,255,255,0.2),transparent_70%)]" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full p-4 lg:p-5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-300" />
                                LIVE EVENTS
                            </h3>
                            <p className="text-cyan-200 text-xs mt-1">Play for rewards</p>
                        </div>

                        {/* Event indicator */}
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-300 text-xs font-medium">Active now</span>
                        </div>
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-cyan-400/30 to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Division Rivals */}
            <div className="group md:col-span-1">
                <div className="relative h-32 lg:h-36 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20 bg-gradient-to-br from-blue-700 via-fc-blue-700 to-indigo-800">
                    {/* Abstract pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.3),transparent_60%)]" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full p-4 lg:p-5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                                <Swords className="w-5 h-5 text-red-400" />
                                DIVISION RIVALS
                            </h3>
                            <p className="text-blue-200 text-xs mt-1">Play against other players</p>
                        </div>

                        {/* Rank indicator */}
                        <div className="flex items-center gap-2">
                            <div className="bg-purple-500/30 border border-purple-400/50 px-2 py-0.5 rounded">
                                <span className="text-purple-200 text-xs font-bold">Division 4</span>
                            </div>
                        </div>
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-blue-400/30 to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
