'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn, getRarityBgColor, getPositionColor, getStatColor, formatCurrency } from '@/lib/utils';
import type { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  spotlight?: boolean;
  onClick?: () => void;
}

export function PlayerCard({ 
  player, 
  size = 'md', 
  showStats = false,
  spotlight = false,
  onClick 
}: PlayerCardProps) {
  const sizeClasses = {
    sm: 'w-36 h-48',
    md: 'w-60 h-96',
    lg: 'w-80 h-[480px]',
  };

  const imageSizes = {
    sm: { width: 120, height: 140 },
    md: { width: 220, height: 280 },
    lg: { width: 300, height: 360 },
  };

  // Rarity-based gradient colors
  const rarityGradients = {
    legendary: 'from-yellow-600 via-amber-500 to-yellow-400',
    epic: 'from-purple-700 via-violet-600 to-purple-500',
    rare: 'from-blue-700 via-blue-600 to-blue-500',
    common: 'from-gray-700 via-gray-600 to-gray-500',
  };

  const rarityGlow = {
    legendary: 'shadow-[0_0_40px_rgba(255,215,0,0.5)]',
    epic: 'shadow-[0_0_40px_rgba(168,85,247,0.5)]',
    rare: 'shadow-[0_0_40px_rgba(59,130,246,0.5)]',
    common: 'shadow-[0_0_20px_rgba(100,100,100,0.3)]',
  };

  const rarityBorder = {
    legendary: 'border-yellow-500/60',
    epic: 'border-purple-500/60',
    rare: 'border-blue-500/60',
    common: 'border-gray-500/60',
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl overflow-hidden cursor-pointer',
        sizeClasses[size],
        rarityGlow[player.rarity || 'common'],
        spotlight && 'animate-pulse-glow'
      )}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layout
    >
      {/* Background gradient based on rarity */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br',
        rarityGradients[player.rarity || 'common']
      )} />

      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="absolute inset-0 bg-white/20 rotate-45 translate-x-16 -translate-y-8" />
      </div>

      {/* Card border */}
      <div className={cn(
        'absolute inset-0 border-2 rounded-2xl',
        rarityBorder[player.rarity || 'common']
      )} />

      {/* Content */}
      <div className="relative h-full flex flex-col p-3">
        {/* Top section: Rating, Position, Nation */}
        <div className="flex justify-between items-start z-10">
          {/* Rating & Position */}
          <div className="flex flex-col items-center">
            <span className={cn(
              'font-display font-black leading-none',
              size === 'sm' && 'text-2xl',
              size === 'md' && 'text-4xl',
              size === 'lg' && 'text-5xl',
              'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
            )}>
              {player.rating}
            </span>
            <span className={cn(
              'font-bold uppercase tracking-wider',
              size === 'sm' && 'text-[10px]',
              size === 'md' && 'text-xs',
              size === 'lg' && 'text-sm',
              'text-white/90'
            )}>
              {player.position}
            </span>
          </div>

          {/* Nation & Club badges */}
          <div className="flex flex-col gap-1 items-end">
            {player.images?.nationFlag && (
              <div className={cn(
                'relative rounded overflow-hidden border border-white/30',
                size === 'sm' && 'w-6 h-4',
                size === 'md' && 'w-8 h-5',
                size === 'lg' && 'w-10 h-6',
              )}>
                <Image
                  src={player.images.nationFlag}
                  alt="Nation"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {player.images?.clubBadge && (
              <div className={cn(
                'relative',
                size === 'sm' && 'w-6 h-6',
                size === 'md' && 'w-8 h-8',
                size === 'lg' && 'w-10 h-10',
              )}>
                <Image
                  src={player.images.clubBadge}
                  alt="Club"
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Player Image - centered and prominent */}
        <div className="flex-1 relative flex items-end justify-center -mt-2">
          <div 
            className="relative"
            style={{ 
              width: imageSizes[size].width, 
              height: imageSizes[size].height 
            }}
          >
            <Image
              src={player.images?.playerFace || '/placeholder-player.png'}
              alt={player.name}
              fill
              className="object-contain object-bottom drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Player';
              }}
            />
          </div>
        </div>

        {/* Bottom section: Name & Info */}
        <div className="z-10 mt-auto">
          {/* Player name - bold stylized */}
          <div className="text-center mb-2">
            <h3 className={cn(
              'font-display font-black uppercase tracking-wide text-white',
              'drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-lg',
              size === 'lg' && 'text-2xl',
            )}>
              {player.name}
            </h3>
            {size !== 'sm' && player.version && (
              <p className={cn(
                'uppercase tracking-widest',
                size === 'md' && 'text-[10px]',
                size === 'lg' && 'text-xs',
                player.rarity === 'legendary' && 'text-yellow-300',
                player.rarity === 'epic' && 'text-purple-300',
                player.rarity === 'rare' && 'text-blue-300',
                !player.rarity && 'text-gray-300',
              )}>
                {player.version}
              </p>
            )}
          </div>

          {/* Stats grid for large cards */}
          {showStats && size === 'lg' && player.overallStats && (
            <div className="grid grid-cols-6 gap-1 bg-black/40 rounded-lg p-2 backdrop-blur-sm">
              {[
                { label: 'PAC', value: player.overallStats.paceOverall },
                { label: 'SHO', value: player.overallStats.shootingOverall },
                { label: 'PAS', value: player.overallStats.passingOverall },
                { label: 'DRI', value: player.overallStats.dribblingOverall },
                { label: 'DEF', value: player.overallStats.defendingOverall },
                { label: 'PHY', value: player.overallStats.physicalOverall },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className={cn(
                    'text-sm font-bold',
                    stat.value >= 90 && 'text-green-400',
                    stat.value >= 80 && stat.value < 90 && 'text-lime-400',
                    stat.value >= 70 && stat.value < 80 && 'text-yellow-400',
                    stat.value < 70 && 'text-orange-400',
                  )}>
                    {stat.value}
                  </div>
                  <div className="text-[8px] text-white/60 uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Price tag */}
          {size !== 'sm' && (
            <div className="mt-2 text-center">
              <span className={cn(
                'font-mono font-bold px-3 py-1 rounded-full',
                'bg-black/50 backdrop-blur-sm',
                size === 'md' && 'text-sm',
                size === 'lg' && 'text-base',
                'text-green-400'
              )}>
                {formatCurrency(player.basePrice * 1000000)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Spotlight effect for auction */}
      {spotlight && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

// Mini card for squad slots with player image
interface MiniPlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export function MiniPlayerCard({ player, onClick }: MiniPlayerCardProps) {
  const rarityColors = {
    legendary: 'from-yellow-600 to-amber-500 border-yellow-400',
    epic: 'from-purple-600 to-violet-500 border-purple-400',
    rare: 'from-blue-600 to-blue-500 border-blue-400',
    common: 'from-gray-600 to-gray-500 border-gray-400',
  };

  return (
    <motion.div
      className={cn(
        'w-full h-full rounded-lg overflow-hidden relative cursor-pointer',
        'bg-gradient-to-br border',
        rarityColors[player.rarity || 'common']
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      
      {/* Player face image */}
      <div className="absolute inset-0">
        <Image
          src={player.images?.playerFace || '/placeholder-player.png'}
          alt={player.name}
          fill
          className="object-cover object-top"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=?';
          }}
        />
      </div>
      
      {/* Rating badge */}
      <div className={cn(
        'absolute top-0.5 left-0.5 px-1 rounded text-[9px] font-bold',
        'bg-black/60 backdrop-blur-sm',
        player.rarity === 'legendary' && 'text-yellow-400',
        player.rarity === 'epic' && 'text-purple-400',
        player.rarity === 'rare' && 'text-blue-400',
        !player.rarity && 'text-white',
      )}>
        {player.rating}
      </div>

      {/* Position badge */}
      <div className="absolute top-0.5 right-0.5 px-1 rounded text-[8px] font-medium bg-black/60 backdrop-blur-sm text-white/80">
        {player.position}
      </div>
      
      {/* Player name at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-0.5 bg-black/70 backdrop-blur-sm">
        <p className="text-[7px] font-bold text-white truncate text-center leading-tight">
          {player.name.split(' ').pop()}
        </p>
      </div>
    </motion.div>
  );
}

// Player Detail Modal - Premium design
interface PlayerDetailModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  purchasePrice?: number;
}

export function PlayerDetailModal({ player, isOpen, onClose, purchasePrice }: PlayerDetailModalProps) {
  if (!isOpen || !player) return null;

  const rarityGradients = {
    legendary: 'from-yellow-600 via-amber-500 to-yellow-600',
    epic: 'from-purple-700 via-violet-600 to-purple-700',
    rare: 'from-blue-700 via-blue-600 to-blue-700',
    common: 'from-gray-700 via-gray-600 to-gray-700',
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      
      {/* Modal Content */}
      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card container */}
        <div className={cn(
          'relative rounded-3xl overflow-hidden',
          'shadow-[0_0_60px_rgba(0,0,0,0.5)]'
        )}>
          {/* Background gradient */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br',
            rarityGradients[player.rarity || 'common']
          )} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <span className="text-2xl text-white/80 hover:text-white">×</span>
          </button>

          {/* Content */}
          <div className="relative p-6">
            {/* Header: Rating, Position, Badges */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                {/* Rating */}
                <div className="text-center">
                  <span className={cn(
                    'text-6xl font-display font-black text-white',
                    'drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]'
                  )}>
                    {player.rating}
                  </span>
                  <div className={cn(
                    'text-lg font-bold uppercase px-3 py-0.5 rounded-full mt-1',
                    'bg-white/20 backdrop-blur-sm text-white'
                  )}>
                    {player.position}
                  </div>
                </div>
              </div>

              {/* Nation & Club */}
              <div className="flex flex-col gap-2 items-end">
                {player.images?.nationFlag && (
                  <div className="w-12 h-8 relative rounded overflow-hidden border-2 border-white/30">
                    <Image src={player.images.nationFlag} alt="Nation" fill className="object-cover" />
                  </div>
                )}
                {player.images?.clubBadge && (
                  <div className="w-12 h-12 relative">
                    <Image src={player.images.clubBadge} alt="Club" fill className="object-contain drop-shadow-lg" />
                  </div>
                )}
              </div>
            </div>

            {/* Player Image */}
            <div className="relative h-64 mb-4">
              <Image
                src={player.images?.playerFace || '/placeholder-player.png'}
                alt={player.name}
                fill
                className="object-contain object-bottom drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Player Name */}
            <div className="text-center mb-6">
              <h2 className="text-3xl font-display font-black uppercase text-white drop-shadow-lg">
                {player.name}
              </h2>
              <p className={cn(
                'text-sm uppercase tracking-widest mt-1',
                player.rarity === 'legendary' && 'text-yellow-300',
                player.rarity === 'epic' && 'text-purple-300',
                player.rarity === 'rare' && 'text-blue-300',
                !player.rarity && 'text-gray-300',
              )}>
                {player.version}
              </p>
            </div>

            {/* Stats Grid */}
            {player.overallStats && (
              <div className="grid grid-cols-6 gap-2 bg-black/40 rounded-xl p-4 backdrop-blur-sm mb-4">
                {[
                  { label: 'PAC', value: player.overallStats.paceOverall, color: 'from-green-500 to-emerald-600' },
                  { label: 'SHO', value: player.overallStats.shootingOverall, color: 'from-red-500 to-rose-600' },
                  { label: 'PAS', value: player.overallStats.passingOverall, color: 'from-blue-500 to-indigo-600' },
                  { label: 'DRI', value: player.overallStats.dribblingOverall, color: 'from-yellow-500 to-amber-600' },
                  { label: 'DEF', value: player.overallStats.defendingOverall, color: 'from-purple-500 to-violet-600' },
                  { label: 'PHY', value: player.overallStats.physicalOverall, color: 'from-orange-500 to-red-600' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className={cn(
                      'text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
                      stat.color
                    )}>
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-white/60 uppercase font-medium">{stat.label}</div>
                    {/* Mini stat bar */}
                    <div className="h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full bg-gradient-to-r', stat.color)}
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-white/50 text-xs uppercase mb-1">Age</p>
                <p className="text-xl font-bold text-white">{player.age}</p>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 text-center">
                <p className="text-white/50 text-xs uppercase mb-1">Base Price</p>
                <p className="text-lg font-bold text-green-400">{formatCurrency(player.basePrice * 1000000)}</p>
              </div>
              {purchasePrice ? (
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 text-center">
                  <p className="text-white/50 text-xs uppercase mb-1">Paid</p>
                  <p className="text-lg font-bold text-cyan-400">{formatCurrency(purchasePrice)}</p>
                </div>
              ) : (
                <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 text-center">
                  <p className="text-white/50 text-xs uppercase mb-1">Rarity</p>
                  <p className={cn(
                    'text-lg font-bold uppercase',
                    player.rarity === 'legendary' && 'text-yellow-400',
                    player.rarity === 'epic' && 'text-purple-400',
                    player.rarity === 'rare' && 'text-blue-400',
                    !player.rarity && 'text-gray-400',
                  )}>
                    {player.rarity || 'Common'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
