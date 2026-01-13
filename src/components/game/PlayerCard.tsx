'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 30 });

  // Glare position
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), { stiffness: 300, damping: 30 });

  // Parallax for player image
  const imageX = useSpring(useTransform(mouseX, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 20 });
  const imageY = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const sizeClasses = {
    sm: 'w-48 h-60',
    md: 'w-[360px] h-[480px]',
    lg: 'w-[480px] h-[640px]',
  };

  const imageSizes = {
    sm: { width: 200, height: 220 },
    md: { width: 380, height: 460 },
    lg: { width: 500, height: 600 },
  };

  // Rarity configurations
  const rarityConfig = {
    legendary: {
      accent: '#FFD700',
      glow: 'rgba(255, 215, 0, 0.6)',
      gradient: 'from-amber-100 via-yellow-50 to-orange-100',
      border: 'border-yellow-400/50',
      particles: true,
      holographic: true,
    },
    epic: {
      accent: '#A855F7',
      glow: 'rgba(168, 85, 247, 0.5)',
      gradient: 'from-purple-100 via-violet-50 to-fuchsia-100',
      border: 'border-purple-400/50',
      particles: false,
      holographic: true,
    },
    rare: {
      accent: '#3B82F6',
      glow: 'rgba(59, 130, 246, 0.4)',
      gradient: 'from-blue-100 via-indigo-50 to-cyan-100',
      border: 'border-blue-400/50',
      particles: false,
      holographic: false,
    },
    common: {
      accent: '#6B7280',
      glow: 'rgba(107, 114, 128, 0.3)',
      gradient: 'from-gray-100 via-slate-50 to-zinc-100',
      border: 'border-gray-400/30',
      particles: false,
      holographic: false,
    },
  };

  const config = rarityConfig[player.rarity || 'common'];

  return (
    <div 
      className="perspective-1000"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        ref={cardRef}
        className={cn(
          'relative rounded-2xl overflow-hidden cursor-pointer',
          'bg-gradient-to-br border-2',
          sizeClasses[size],
          config.gradient,
          config.border,
          'transform-gpu'
        )}
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
          boxShadow: isHovered 
            ? `0 30px 60px -10px ${config.glow}, 0 0 40px ${config.glow}`
            : spotlight 
              ? `0 20px 60px ${config.accent}40`
              : '0 10px 40px rgba(0,0,0,0.1)',
        }}
        initial={{ opacity: 0, y: 50, rotateX: -20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        whileTap={{ scale: 0.97 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {/* Animated border glow for legendary/epic */}
        {(player.rarity === 'legendary' || player.rarity === 'epic') && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none z-0"
            style={{
              background: `linear-gradient(45deg, ${config.accent}00, ${config.accent}60, ${config.accent}00)`,
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Holographic shine effect */}
        {config.holographic && isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-30 mix-blend-overlay opacity-60"
            style={{
              background: `
                linear-gradient(
                  ${glareX.get() + 45}deg,
                  transparent 20%,
                  rgba(255,255,255,0.4) 40%,
                  rgba(255,200,100,0.3) 50%,
                  rgba(100,200,255,0.3) 60%,
                  rgba(255,100,200,0.3) 70%,
                  transparent 80%
                )
              `,
            }}
          />
        )}

        {/* Mouse-following glare */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20 opacity-0"
          style={{
            opacity: isHovered ? 0.7 : 0,
            background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
          }}
        />

        {/* Large rating in background with parallax */}
        <motion.div 
          className="absolute right-0 top-1/4 font-display font-black opacity-[0.08] select-none"
          style={{ 
            fontSize: size === 'lg' ? '320px' : size === 'md' ? '220px' : '120px',
            lineHeight: 0.8,
            color: config.accent,
            x: isHovered ? imageX : 0,
            y: isHovered ? imageY : 0,
          }}
        >
          {player.rating}
        </motion.div>

        {/* Floating particles for legendary */}
        {config.particles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${config.accent} 0%, transparent 70%)`,
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  y: [-20, -40, -20],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}

        {/* Content container with z-depth */}
        <div 
          className="relative h-full flex flex-col p-4"
          style={{ transform: 'translateZ(20px)' }}
        >
          {/* Top: Position badge & Club/Nation */}
          <motion.div 
            className="flex justify-between items-start z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* Position badge with pulse effect */}
            <motion.div 
              className="relative px-3 py-1 rounded-full text-white font-bold text-sm"
              style={{ backgroundColor: config.accent }}
              whileHover={{ scale: 1.1 }}
            >
              {player.position}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: config.accent }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Club & Nation badges */}
            <div className="flex items-center gap-2">
              {player.images?.nationFlag && (
                <motion.div 
                  className={cn(
                    'relative rounded overflow-hidden shadow-lg',
                    size === 'sm' ? 'w-6 h-4' : 'w-8 h-5'
                  )}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                >
                  <Image
                    src={player.images.nationFlag}
                    alt="Nation"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              )}
              {player.images?.clubBadge && (
                <motion.div 
                  className={cn('relative', size === 'sm' ? 'w-6 h-6' : 'w-10 h-10')}
                  whileHover={{ scale: 1.2, rotate: -5 }}
                >
                  <Image
                    src={player.images.clubBadge}
                    alt="Club"
                    fill
                    className="object-contain drop-shadow-lg"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Player name with staggered animation */}
          <motion.div 
            className="mt-4 z-10"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className={cn(
              'font-display font-black text-gray-800 leading-tight',
              size === 'sm' && 'text-lg',
              size === 'md' && 'text-3xl',
              size === 'lg' && 'text-5xl',
            )}>
              {player.name.split(' ').slice(0, -1).join(' ')}
            </h3>
            <motion.h3 
              className={cn(
                'font-display font-black leading-tight',
                size === 'sm' && 'text-xl',
                size === 'md' && 'text-4xl',
                size === 'lg' && 'text-6xl',
              )}
              style={{ color: config.accent }}
              animate={isHovered ? { textShadow: `0 0 20px ${config.glow}` } : {}}
            >
              {player.name.split(' ').slice(-1)[0]}
            </motion.h3>
            
            {size !== 'sm' && (
              <motion.p 
                className="text-gray-500 text-sm mt-1 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="uppercase tracking-wider">{player.version}</span>
              </motion.p>
            )}
          </motion.div>

          {/* Player Image with parallax and floating animation */}
          <motion.div 
            className={cn(
              "absolute z-0",
              size === 'sm' ? 'right-0 bottom-0' : 'right-[-10%] bottom-0'
            )}
            style={{
              x: isHovered ? imageX : 0,
              y: isHovered ? imageY : 0,
            }}
            animate={!isHovered ? { 
              y: [0, -8, 0],
            } : {}}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: 'easeInOut' 
            }}
          >
            <div 
              className="relative"
              style={{ 
                width: imageSizes[size].width, 
                height: imageSizes[size].height,
                transform: 'translateZ(40px)',
              }}
            >
              <Image
                src={player.images?.playerFace || '/placeholder-player.png'}
                alt={player.name}
                fill
                className="object-contain object-bottom"
                style={{
                  filter: isHovered 
                    ? `drop-shadow(0 30px 60px ${config.glow})`
                    : size === 'lg' 
                      ? 'drop-shadow(0 20px 50px rgba(0,0,0,0.3))' 
                      : 'drop-shadow(0 10px 30px rgba(0,0,0,0.2))'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Player';
                }}
              />
            </div>
          </motion.div>

          {/* Rating display with counting animation */}
          <motion.div 
            className="mt-auto z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-end gap-2 mb-3">
              <motion.span 
                className={cn(
                  'font-display font-black',
                  size === 'sm' && 'text-4xl',
                  size === 'md' && 'text-6xl',
                  size === 'lg' && 'text-8xl',
                )}
                style={{ color: config.accent }}
                animate={isHovered ? { 
                  textShadow: `0 0 30px ${config.glow}`,
                  scale: 1.05,
                } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {player.rating}
              </motion.span>
              <span className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Overall</span>
            </div>

            {/* Stats bar with staggered reveal */}
            {size !== 'sm' && player.overallStats && (
              <motion.div 
                className="flex gap-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.5 } }
                }}
              >
                {[
                  { label: 'PAC', value: player.overallStats.paceOverall, color: '#22C55E' },
                  { label: 'SHO', value: player.overallStats.shootingOverall, color: '#EF4444' },
                  { label: 'PAS', value: player.overallStats.passingOverall, color: '#3B82F6' },
                  { label: 'DRI', value: player.overallStats.dribblingOverall, color: '#F59E0B' },
                  { label: 'DEF', value: player.overallStats.defendingOverall, color: '#8B5CF6' },
                  { label: 'PHY', value: player.overallStats.physicalOverall, color: '#F97316' },
                ].slice(0, size === 'md' ? 4 : 6).map((stat) => (
                  <motion.div 
                    key={stat.label} 
                    className="flex-1 rounded-lg py-2 px-1 text-center text-white relative overflow-hidden"
                    style={{ backgroundColor: stat.color }}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.8 },
                      visible: { opacity: 1, y: 0, scale: 1 }
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      zIndex: 10,
                      boxShadow: `0 5px 20px ${stat.color}80`
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
                      style={{ opacity: 0.3 }}
                    />
                    <div className={cn('font-bold relative', size === 'md' ? 'text-lg' : 'text-xl')}>
                      {stat.value}
                    </div>
                    <div className="text-[10px] opacity-80 uppercase relative">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Price tag */}
            {size !== 'sm' && (
              <motion.div 
                className="mt-3 flex justify-between items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <span className="text-gray-400 text-xs uppercase tracking-wider">Base Price</span>
                <motion.span 
                  className="font-bold text-lg"
                  style={{ color: config.accent }}
                  whileHover={{ scale: 1.1 }}
                >
                  {formatCurrency(player.basePrice * 1000000)}
                </motion.span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Spotlight shimmer effect */}
        {spotlight && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `linear-gradient(105deg, transparent 40%, ${config.accent}30 50%, transparent 60%)`,
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Edge highlight */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)`,
          }}
        />
      </motion.div>
    </div>
  );
}

// Mini card for squad slots with 3D flip effect
interface MiniPlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export function MiniPlayerCard({ player, onClick }: MiniPlayerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const rarityColors = {
    legendary: { bg: 'from-amber-100 to-yellow-200', accent: '#FFD700', border: 'border-yellow-400', glow: 'rgba(255,215,0,0.5)' },
    epic: { bg: 'from-purple-100 to-violet-200', accent: '#A855F7', border: 'border-purple-400', glow: 'rgba(168,85,247,0.4)' },
    rare: { bg: 'from-blue-100 to-indigo-200', accent: '#3B82F6', border: 'border-blue-400', glow: 'rgba(59,130,246,0.3)' },
    common: { bg: 'from-gray-100 to-slate-200', accent: '#6B7280', border: 'border-gray-400', glow: 'rgba(107,114,128,0.2)' },
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
      initial={{ scale: 0, opacity: 0, rotateY: -90 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ 
        scale: 1.12, 
        zIndex: 10,
        boxShadow: `0 10px 30px ${colors.glow}`,
      }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Player face image */}
      <motion.div 
        className="absolute inset-0"
        animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
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
      </motion.div>

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        animate={isHovered ? { backgroundPosition: ['200% 0', '-200% 0'] } : {}}
        transition={{ duration: 0.6 }}
      />
      
      {/* Rating badge with glow */}
      <motion.div 
        className="absolute top-0.5 left-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
        style={{ backgroundColor: colors.accent }}
        animate={isHovered ? { boxShadow: `0 0 10px ${colors.glow}` } : {}}
      >
        {player.rating}
      </motion.div>

      {/* Position */}
      <div className="absolute top-0.5 right-0.5 px-1 rounded text-[8px] font-medium bg-white/90 text-gray-700">
        {player.position}
      </div>
      
      {/* Player name */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 p-1 text-center"
        animate={isHovered ? { y: -2 } : { y: 0 }}
      >
        <p className="text-[8px] font-bold text-white truncate drop-shadow-lg">
          {player.name.split(' ').pop()}
        </p>
      </motion.div>
    </motion.div>
  );
}

// Player Detail Modal - Premium design with animations
interface PlayerDetailModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  purchasePrice?: number;
}

export function PlayerDetailModal({ player, isOpen, onClose, purchasePrice }: PlayerDetailModalProps) {
  if (!isOpen || !player) return null;

  const rarityConfig = {
    legendary: { accent: '#FFD700', glow: 'rgba(255,215,0,0.6)', gradient: 'from-amber-50 via-yellow-50 to-orange-50' },
    epic: { accent: '#A855F7', glow: 'rgba(168,85,247,0.5)', gradient: 'from-purple-50 via-violet-50 to-fuchsia-50' },
    rare: { accent: '#3B82F6', glow: 'rgba(59,130,246,0.4)', gradient: 'from-blue-50 via-indigo-50 to-cyan-50' },
    common: { accent: '#6B7280', glow: 'rgba(107,114,128,0.3)', gradient: 'from-gray-50 via-slate-50 to-zinc-50' },
  };

  const config = rarityConfig[player.rarity || 'common'];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <motion.div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      
      {/* Modal with 3D entrance */}
      <motion.div
        className={cn(
          'relative z-10 w-full max-w-4xl rounded-3xl overflow-hidden',
          'bg-gradient-to-br',
          config.gradient
        )}
        style={{
          boxShadow: `0 30px 100px ${config.glow}`
        }}
        initial={{ scale: 0.8, opacity: 0, rotateX: -15, y: 50 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, rotateX: 15, y: 50 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: `linear-gradient(45deg, ${config.accent}00, ${config.accent}40, ${config.accent}00)`,
            backgroundSize: '200% 200%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Large rating in background */}
        <motion.div 
          className="absolute right-0 top-0 font-display font-black opacity-5 select-none"
          style={{ fontSize: '400px', lineHeight: 0.8, color: config.accent }}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 0.05 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {player.rating}
        </motion.div>

        {/* Close button */}
        <motion.button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors shadow-lg"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-2xl text-gray-600">×</span>
        </motion.button>

        {/* Content */}
        <div className="relative flex flex-col lg:flex-row min-h-[500px]">
          {/* Left side - Info with staggered animations */}
          <motion.div 
            className="flex-1 p-8 lg:p-12 z-10"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
            }}
          >
            {/* Position badge */}
            <motion.div 
              className="inline-block px-4 py-1.5 rounded-full text-white font-bold text-sm mb-6"
              style={{ backgroundColor: config.accent }}
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
            >
              {player.position}
            </motion.div>

            {/* Player name */}
            <motion.h2 
              className="text-4xl lg:text-6xl font-display font-black text-gray-800 leading-tight"
              variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}
            >
              {player.name.split(' ').slice(0, -1).join(' ')}
            </motion.h2>
            <motion.h2 
              className="text-5xl lg:text-7xl font-display font-black leading-tight mb-4"
              style={{ color: config.accent }}
              variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}
            >
              {player.name.split(' ').slice(-1)[0]}
            </motion.h2>

            {/* Club & Nation */}
            <motion.div 
              className="flex items-center gap-4 mb-8"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
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
            </motion.div>

            {/* Player info grid */}
            <motion.div 
              className="grid grid-cols-3 gap-4 mb-8"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Age</p>
                <p className="text-2xl font-bold text-gray-800">{player.age}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Version</p>
                <p className="text-lg font-bold" style={{ color: config.accent }}>{player.version}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Rarity</p>
                <p className="text-lg font-bold uppercase" style={{ color: config.accent }}>
                  {player.rarity || 'Common'}
                </p>
              </div>
            </motion.div>

            {/* Rating display */}
            <motion.div 
              className="flex items-end gap-3 mb-8"
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            >
              <span className="text-8xl font-display font-black" style={{ color: config.accent }}>
                {player.rating}
              </span>
              <span className="text-gray-400 text-lg mb-4 uppercase tracking-wider">Overall Rating</span>
            </motion.div>

            {/* Stats cards */}
            {player.overallStats && (
              <motion.div 
                className="grid grid-cols-3 lg:grid-cols-6 gap-2"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {[
                  { label: 'PACE', value: player.overallStats.paceOverall, color: '#22C55E' },
                  { label: 'SHOOTING', value: player.overallStats.shootingOverall, color: '#EF4444' },
                  { label: 'PASSING', value: player.overallStats.passingOverall, color: '#3B82F6' },
                  { label: 'DRIBBLING', value: player.overallStats.dribblingOverall, color: '#F59E0B' },
                  { label: 'DEFENDING', value: player.overallStats.defendingOverall, color: '#8B5CF6' },
                  { label: 'PHYSICAL', value: player.overallStats.physicalOverall, color: '#F97316' },
                ].map((stat) => (
                  <motion.div 
                    key={stat.label}
                    className="rounded-xl py-3 px-2 text-center text-white"
                    style={{ backgroundColor: stat.color }}
                    variants={{ hidden: { opacity: 0, y: 20, scale: 0.8 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                    whileHover={{ scale: 1.1, boxShadow: `0 5px 20px ${stat.color}80` }}
                  >
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-[9px] opacity-80 uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Price info */}
            <motion.div 
              className="mt-8 flex gap-6"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Base Price</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(player.basePrice * 1000000)}
                </p>
              </div>
              {purchasePrice && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Purchase Price</p>
                  <p className="text-2xl font-bold" style={{ color: config.accent }}>
                    {formatCurrency(purchasePrice)}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Right side - Player Image with float animation */}
          <div className="relative lg:w-[450px] h-[350px] lg:h-auto">
            <motion.div 
              className="absolute inset-0 lg:relative lg:h-full flex items-end justify-center lg:justify-end"
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6, type: 'spring' }}
            >
              <motion.div 
                className="relative w-[300px] h-[350px] lg:w-[420px] lg:h-[500px]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Image
                  src={player.images?.playerFace || '/placeholder-player.png'}
                  alt={player.name}
                  fill
                  className="object-contain object-bottom"
                  style={{
                    filter: `drop-shadow(0 30px 60px ${config.glow})`
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
