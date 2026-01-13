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
    sm: 'w-24 p-2',
    md: 'w-48 p-4',
    lg: 'w-72 p-6',
  };

  const imageSizes = {
    sm: 60,
    md: 120,
    lg: 180,
  };

  return (
    <motion.div
      className={cn(
        'player-card cursor-pointer',
        `player-card-${player.rarity}`,
        sizeClasses[size],
        spotlight && 'auction-spotlight animate-pulse-glow'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layout
    >
      {/* Rarity glow effect */}
      <div className={cn(
        'absolute inset-0 opacity-30 blur-xl',
        player.rarity === 'legendary' && 'bg-rarity-legendary',
        player.rarity === 'epic' && 'bg-rarity-epic',
        player.rarity === 'rare' && 'bg-rarity-rare',
      )} />

      <div className="relative z-10">
        {/* Header: Rating & Position */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-center">
            <div className={cn(
              'text-2xl md:text-3xl font-display font-black',
              player.rarity === 'legendary' && 'text-rarity-legendary',
              player.rarity === 'epic' && 'text-rarity-epic',
              player.rarity === 'rare' && 'text-rarity-rare',
            )}>
              {player.rating}
            </div>
            <div className={cn(
              'text-xs font-bold px-2 py-0.5 rounded',
              getPositionColor(player.position),
              'text-white'
            )}>
              {player.position}
            </div>
          </div>

          {/* Nation flag */}
          {player.images?.nationFlag && (
            <div className="w-8 h-6 relative rounded overflow-hidden">
              <Image
                src={player.images.nationFlag}
                alt="Nation"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Player image */}
        <div className="relative mx-auto mb-3" style={{ width: imageSizes[size], height: imageSizes[size] }}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900/50 rounded-full" />
          <Image
            src={player.images?.playerFace || '/placeholder-player.png'}
            alt={player.name}
            fill
            className="object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Player';
            }}
          />
        </div>

        {/* Name */}
        <h3 className={cn(
          'font-bold text-center truncate',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-lg',
        )}>
          {player.name}
        </h3>

        {/* Version */}
        {size !== 'sm' && player.version && (
          <p className="text-xs text-dark-400 text-center truncate mt-1">
            {player.version}
          </p>
        )}

        {/* Club badge */}
        {size !== 'sm' && player.images?.clubBadge && (
          <div className="flex justify-center mt-2">
            <div className="w-8 h-8 relative">
              <Image
                src={player.images.clubBadge}
                alt="Club"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Stats (for large cards) */}
        {showStats && size === 'lg' && player.overallStats && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'PAC', value: player.overallStats.paceOverall },
              { label: 'SHO', value: player.overallStats.shootingOverall },
              { label: 'PAS', value: player.overallStats.passingOverall },
              { label: 'DRI', value: player.overallStats.dribblingOverall },
              { label: 'DEF', value: player.overallStats.defendingOverall },
              { label: 'PHY', value: player.overallStats.physicalOverall },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={cn('text-lg font-bold', getStatColor(stat.value))}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-dark-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Base price */}
        {size !== 'sm' && (
          <div className="mt-3 text-center">
            <span className="text-neon-green font-bold">
              {formatCurrency(player.basePrice * 1000000)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Mini card for squad slots with player image
interface MiniPlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export function MiniPlayerCard({ player, onClick }: MiniPlayerCardProps) {
  return (
    <motion.div
      className={cn(
        'w-full h-full rounded-lg border-2 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer',
        getRarityBgColor(player.rarity)
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Player face image */}
      <div className="absolute inset-0 opacity-80">
        <Image
          src={player.images?.playerFace || '/placeholder-player.png'}
          alt={player.name}
          fill
          className="object-cover object-top"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=?';
          }}
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>
      
      {/* Rating and position overlay */}
      <div className="relative z-10 mt-auto w-full px-1 pb-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-white drop-shadow-lg">{player.rating}</span>
          <span className="text-[8px] font-medium text-white/80 drop-shadow-lg">{player.position}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Player Detail Modal
interface PlayerDetailModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  purchasePrice?: number;
}

export function PlayerDetailModal({ player, isOpen, onClose, purchasePrice }: PlayerDetailModalProps) {
  if (!isOpen || !player) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <motion.div
        className="relative z-10 glass-card p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors"
        >
          <span className="text-xl">×</span>
        </button>

        {/* Player Header */}
        <div className="flex items-start gap-4 mb-6">
          {/* Player Image */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={player.images?.playerFace || '/placeholder-player.png'}
              alt={player.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'text-3xl font-display font-black',
                player.rarity === 'legendary' && 'text-rarity-legendary',
                player.rarity === 'epic' && 'text-rarity-epic',
                player.rarity === 'rare' && 'text-rarity-rare',
              )}>
                {player.rating}
              </span>
              <span className={cn(
                'text-sm font-bold px-2 py-0.5 rounded',
                getPositionColor(player.position),
                'text-white'
              )}>
                {player.position}
              </span>
            </div>
            <h3 className="text-xl font-bold truncate">{player.name}</h3>
            <p className="text-sm text-dark-400">{player.version}</p>
          </div>
        </div>

        {/* Club & Nation */}
        <div className="flex items-center gap-4 mb-6">
          {player.images?.clubBadge && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative">
                <Image src={player.images.clubBadge} alt="Club" fill className="object-contain" />
              </div>
              <span className="text-sm text-dark-300">{player.club || 'Club'}</span>
            </div>
          )}
          {player.images?.nationFlag && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-5 relative rounded overflow-hidden">
                <Image src={player.images.nationFlag} alt="Nation" fill className="object-cover" />
              </div>
              <span className="text-sm text-dark-300">{player.nation || 'Nation'}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        {player.overallStats && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-dark-400 mb-3">STATS</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Pace', value: player.overallStats.paceOverall, color: 'bg-green-500' },
                { label: 'Shooting', value: player.overallStats.shootingOverall, color: 'bg-red-500' },
                { label: 'Passing', value: player.overallStats.passingOverall, color: 'bg-blue-500' },
                { label: 'Dribbling', value: player.overallStats.dribblingOverall, color: 'bg-yellow-500' },
                { label: 'Defending', value: player.overallStats.defendingOverall, color: 'bg-purple-500' },
                { label: 'Physical', value: player.overallStats.physicalOverall, color: 'bg-orange-500' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-dark-400">{stat.label}</span>
                      <span className={cn('font-bold', getStatColor(stat.value))}>{stat.value}</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full', stat.color)}
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-dark-800/50 rounded-lg p-3">
            <p className="text-dark-400 text-xs mb-1">Age</p>
            <p className="font-bold">{player.age}</p>
          </div>
          <div className="bg-dark-800/50 rounded-lg p-3">
            <p className="text-dark-400 text-xs mb-1">Base Price</p>
            <p className="font-bold text-neon-green">{formatCurrency(player.basePrice * 1000000)}</p>
          </div>
          {purchasePrice && (
            <div className="bg-dark-800/50 rounded-lg p-3 col-span-2">
              <p className="text-dark-400 text-xs mb-1">Purchase Price</p>
              <p className="font-bold text-neon-cyan text-lg">{formatCurrency(purchasePrice)}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
