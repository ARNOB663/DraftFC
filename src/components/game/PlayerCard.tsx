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
    sm: 'w-40 h-52',
    md: 'w-72 h-96',
    lg: 'w-[400px] h-[520px]',
  };

  const imageSizes = {
    sm: { width: 140, height: 160 },
    md: { width: 260, height: 320 },
    lg: { width: 380, height: 450 },
  };

  // Rarity accent colors
  const rarityAccent = {
    legendary: '#FFD700',
    epic: '#A855F7',
    rare: '#3B82F6',
    common: '#6B7280',
  };

  const rarityBg = {
    legendary: 'from-amber-50 to-yellow-100',
    epic: 'from-purple-50 to-violet-100',
    rare: 'from-blue-50 to-indigo-100',
    common: 'from-gray-50 to-slate-100',
  };

  const accentColor = rarityAccent[player.rarity || 'common'];

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br',
        sizeClasses[size],
        rarityBg[player.rarity || 'common'],
        spotlight && 'shadow-2xl'
      )}
      style={{
        boxShadow: spotlight ? `0 20px 60px ${accentColor}40` : '0 10px 40px rgba(0,0,0,0.1)'
      }}
      whileHover={{ scale: 1.02, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      layout
    >
      {/* Large jersey number/rating in background */}
      <div 
        className="absolute right-0 top-1/4 font-display font-black opacity-10 select-none"
        style={{ 
          fontSize: size === 'lg' ? '280px' : size === 'md' ? '180px' : '100px',
          lineHeight: 0.8,
          color: accentColor,
        }}
      >
        {player.rating}
      </div>

      {/* Content container */}
      <div className="relative h-full flex flex-col p-4">
        {/* Top: Position badge & Club/Nation */}
        <div className="flex justify-between items-start z-10">
          {/* Position */}
          <div 
            className="px-3 py-1 rounded-full text-white font-bold text-sm"
            style={{ backgroundColor: accentColor }}
          >
            {player.position}
          </div>

          {/* Club & Nation badges */}
          <div className="flex items-center gap-2">
            {player.images?.nationFlag && (
              <div className={cn(
                'relative rounded overflow-hidden shadow-md',
                size === 'sm' ? 'w-6 h-4' : 'w-8 h-5'
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
                size === 'sm' ? 'w-6 h-6' : 'w-10 h-10'
              )}>
                <Image
                  src={player.images.clubBadge}
                  alt="Club"
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
            )}
          </div>
        </div>

        {/* Player name - left side */}
        <div className="mt-4 z-10">
          <h3 className={cn(
            'font-display font-black text-gray-800 leading-tight',
            size === 'sm' && 'text-lg',
            size === 'md' && 'text-3xl',
            size === 'lg' && 'text-5xl',
          )}>
            {player.name.split(' ').slice(0, -1).join(' ')}
          </h3>
          <h3 
            className={cn(
              'font-display font-black leading-tight',
              size === 'sm' && 'text-xl',
              size === 'md' && 'text-4xl',
              size === 'lg' && 'text-6xl',
            )}
            style={{ color: accentColor }}
          >
            {player.name.split(' ').slice(-1)[0]}
          </h3>
          
          {size !== 'sm' && (
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
              <span className="uppercase tracking-wider">{player.version}</span>
            </p>
          )}
        </div>

        {/* Player Image - large and prominent */}
        <div className="absolute right-0 bottom-0 z-0">
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
              className="object-contain object-bottom"
              style={{
                filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Player';
              }}
            />
          </div>
        </div>

        {/* Rating display */}
        <div className="mt-auto z-10">
          <div className="flex items-end gap-2 mb-3">
            <span 
              className={cn(
                'font-display font-black',
                size === 'sm' && 'text-4xl',
                size === 'md' && 'text-6xl',
                size === 'lg' && 'text-8xl',
              )}
              style={{ color: accentColor }}
            >
              {player.rating}
            </span>
            <span className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Overall</span>
          </div>

          {/* Stats bar - only for md and lg */}
          {size !== 'sm' && player.overallStats && (
            <div className="flex gap-2">
              {[
                { label: 'PAC', value: player.overallStats.paceOverall, color: '#22C55E' },
                { label: 'SHO', value: player.overallStats.shootingOverall, color: '#EF4444' },
                { label: 'PAS', value: player.overallStats.passingOverall, color: '#3B82F6' },
                { label: 'DRI', value: player.overallStats.dribblingOverall, color: '#F59E0B' },
                { label: 'DEF', value: player.overallStats.defendingOverall, color: '#8B5CF6' },
                { label: 'PHY', value: player.overallStats.physicalOverall, color: '#F97316' },
              ].slice(0, size === 'md' ? 4 : 6).map((stat) => (
                <div 
                  key={stat.label} 
                  className="flex-1 rounded-lg py-2 px-1 text-center text-white"
                  style={{ backgroundColor: stat.color }}
                >
                  <div className={cn(
                    'font-bold',
                    size === 'md' ? 'text-lg' : 'text-xl'
                  )}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] opacity-80 uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Price tag */}
          {size !== 'sm' && (
            <div className="mt-3 flex justify-between items-center">
              <span className="text-gray-400 text-xs uppercase tracking-wider">Base Price</span>
              <span 
                className="font-bold text-lg"
                style={{ color: accentColor }}
              >
                {formatCurrency(player.basePrice * 1000000)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Spotlight shimmer effect */}
      {spotlight && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(105deg, transparent 40%, ${accentColor}20 50%, transparent 60%)`,
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
}

// Mini card for squad slots
interface MiniPlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export function MiniPlayerCard({ player, onClick }: MiniPlayerCardProps) {
  const rarityColors = {
    legendary: { bg: 'from-amber-100 to-yellow-200', accent: '#FFD700', border: 'border-yellow-400' },
    epic: { bg: 'from-purple-100 to-violet-200', accent: '#A855F7', border: 'border-purple-400' },
    rare: { bg: 'from-blue-100 to-indigo-200', accent: '#3B82F6', border: 'border-blue-400' },
    common: { bg: 'from-gray-100 to-slate-200', accent: '#6B7280', border: 'border-gray-400' },
  };

  const colors = rarityColors[player.rarity || 'common'];

  return (
    <motion.div
      className={cn(
        'w-full h-full rounded-lg overflow-hidden relative cursor-pointer',
        'bg-gradient-to-br border-2',
        colors.bg,
        colors.border
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.08, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
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
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>
      
      {/* Rating badge */}
      <div 
        className="absolute top-0.5 left-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
        style={{ backgroundColor: colors.accent }}
      >
        {player.rating}
      </div>

      {/* Position */}
      <div className="absolute top-0.5 right-0.5 px-1 rounded text-[8px] font-medium bg-white/90 text-gray-700">
        {player.position}
      </div>
      
      {/* Player name */}
      <div className="absolute bottom-0 left-0 right-0 p-1 text-center">
        <p className="text-[8px] font-bold text-white truncate drop-shadow-lg">
          {player.name.split(' ').pop()}
        </p>
      </div>
    </motion.div>
  );
}

// Player Detail Modal - Premium NBA-style design
interface PlayerDetailModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  purchasePrice?: number;
}

export function PlayerDetailModal({ player, isOpen, onClose, purchasePrice }: PlayerDetailModalProps) {
  if (!isOpen || !player) return null;

  const rarityAccent = {
    legendary: '#FFD700',
    epic: '#A855F7',
    rare: '#3B82F6',
    common: '#6B7280',
  };

  const rarityBg = {
    legendary: 'from-amber-50 via-yellow-50 to-orange-50',
    epic: 'from-purple-50 via-violet-50 to-fuchsia-50',
    rare: 'from-blue-50 via-indigo-50 to-cyan-50',
    common: 'from-gray-50 via-slate-50 to-zinc-50',
  };

  const accentColor = rarityAccent[player.rarity || 'common'];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <motion.div
        className={cn(
          'relative z-10 w-full max-w-4xl rounded-3xl overflow-hidden',
          'bg-gradient-to-br',
          rarityBg[player.rarity || 'common']
        )}
        style={{
          boxShadow: `0 25px 80px ${accentColor}40`
        }}
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Large rating in background */}
        <div 
          className="absolute right-0 top-0 font-display font-black opacity-5 select-none"
          style={{ 
            fontSize: '400px',
            lineHeight: 0.8,
            color: accentColor,
          }}
        >
          {player.rating}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
        >
          <span className="text-2xl text-gray-600">×</span>
        </button>

        {/* Content */}
        <div className="relative flex flex-col lg:flex-row min-h-[500px]">
          {/* Left side - Info */}
          <div className="flex-1 p-8 lg:p-12 z-10">
            {/* Position badge */}
            <div 
              className="inline-block px-4 py-1.5 rounded-full text-white font-bold text-sm mb-6"
              style={{ backgroundColor: accentColor }}
            >
              {player.position}
            </div>

            {/* Player name */}
            <h2 className="text-4xl lg:text-6xl font-display font-black text-gray-800 leading-tight">
              {player.name.split(' ').slice(0, -1).join(' ')}
            </h2>
            <h2 
              className="text-5xl lg:text-7xl font-display font-black leading-tight mb-4"
              style={{ color: accentColor }}
            >
              {player.name.split(' ').slice(-1)[0]}
            </h2>

            {/* Club & Nation */}
            <div className="flex items-center gap-4 mb-8">
              {player.images?.clubBadge && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 relative">
                    <Image src={player.images.clubBadge} alt="Club" fill className="object-contain" />
                  </div>
                  <span className="text-gray-600">{player.club || 'Club'}</span>
                </div>
              )}
              {player.images?.nationFlag && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-5 relative rounded overflow-hidden">
                    <Image src={player.images.nationFlag} alt="Nation" fill className="object-cover" />
                  </div>
                  <span className="text-gray-600">{player.nation || 'Nation'}</span>
                </div>
              )}
            </div>

            {/* Player info grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Age</p>
                <p className="text-2xl font-bold text-gray-800">{player.age}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Version</p>
                <p className="text-lg font-bold" style={{ color: accentColor }}>{player.version}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Rarity</p>
                <p className="text-lg font-bold uppercase" style={{ color: accentColor }}>
                  {player.rarity || 'Common'}
                </p>
              </div>
            </div>

            {/* Rating display */}
            <div className="flex items-end gap-3 mb-8">
              <span 
                className="text-8xl font-display font-black"
                style={{ color: accentColor }}
              >
                {player.rating}
              </span>
              <span className="text-gray-400 text-lg mb-4 uppercase tracking-wider">Overall Rating</span>
            </div>

            {/* Stats cards */}
            {player.overallStats && (
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { label: 'PACE', value: player.overallStats.paceOverall, color: '#22C55E' },
                  { label: 'SHOOTING', value: player.overallStats.shootingOverall, color: '#EF4444' },
                  { label: 'PASSING', value: player.overallStats.passingOverall, color: '#3B82F6' },
                  { label: 'DRIBBLING', value: player.overallStats.dribblingOverall, color: '#F59E0B' },
                  { label: 'DEFENDING', value: player.overallStats.defendingOverall, color: '#8B5CF6' },
                  { label: 'PHYSICAL', value: player.overallStats.physicalOverall, color: '#F97316' },
                ].map((stat) => (
                  <div 
                    key={stat.label}
                    className="rounded-xl py-3 px-2 text-center text-white"
                    style={{ backgroundColor: stat.color }}
                  >
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-[9px] opacity-80 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Price info */}
            <div className="mt-8 flex gap-6">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Base Price</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(player.basePrice * 1000000)}
                </p>
              </div>
              {purchasePrice && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Purchase Price</p>
                  <p className="text-2xl font-bold" style={{ color: accentColor }}>
                    {formatCurrency(purchasePrice)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Player Image */}
          <div className="relative lg:w-[400px] h-[300px] lg:h-auto">
            <div className="absolute inset-0 lg:relative lg:h-full">
              <Image
                src={player.images?.playerFace || '/placeholder-player.png'}
                alt={player.name}
                fill
                className="object-contain object-bottom lg:object-right-bottom"
                style={{
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))'
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
