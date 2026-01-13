'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { cn, formatCurrency, parseAltPositions, getPositionDisplayColor } from '@/lib/utils';
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
            {/* Position badges - Main + Alternates - High Contrast Design */}
            <div className="flex flex-wrap gap-1.5 max-w-[60%]">
              {/* Main position badge - Always high contrast */}
              <motion.div 
                className="relative px-3 py-1 rounded-full font-black tracking-wide"
                style={{ 
                  // Dark background with white text for maximum contrast
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  color: '#ffffff',
                  border: `2px solid ${config.accent}`,
                  boxShadow: `0 4px 12px ${config.glow}, 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)',
                  fontSize: size === 'lg' ? '14px' : size === 'md' ? '12px' : '10px',
                  WebkitTextStroke: '0.5px rgba(255,255,255,0.3)',
                }}
                whileHover={{ scale: 1.1 }}
              >
                {player.position}
                {/* Accent glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ 
                    boxShadow: `0 0 10px ${config.accent}, inset 0 0 10px ${config.accent}40`,
                  }}
                  animate={{ 
                    boxShadow: [
                      `0 0 10px ${config.accent}`,
                      `0 0 20px ${config.accent}`,
                      `0 0 10px ${config.accent}`
                    ],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              
              {/* Alternate positions - High contrast with dark backgrounds */}
              {size !== 'sm' && parseAltPositions(player.altPositions).slice(0, 3).map((altPos) => {
                const posColors = getPositionDisplayColor(altPos);
                return (
                  <motion.div
                    key={altPos}
                    className="px-2 py-0.5 rounded-full font-bold border-2"
                    style={{ 
                      // Dark background for all alternate positions
                      backgroundColor: 'rgba(0, 0, 0, 0.75)',
                      color: '#ffffff',
                      borderColor: posColors.border.replace('border-', '').replace('/50', ''),
                      fontSize: size === 'lg' ? '11px' : '10px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.5)',
                      WebkitTextStroke: '0.5px rgba(255,255,255,0.2)',
                      boxShadow: `0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {altPos}
                  </motion.div>
                );
              })}
            </div>

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

          {/* Player name with staggered animation - Enhanced visibility with dark backdrop */}
          <motion.div 
            className="mt-4 z-10 relative"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Dark semi-transparent backdrop for name readability */}
            <motion.div
              className="absolute -inset-2 rounded-lg -z-10"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            />
            
            {/* First name - White with strong shadow for contrast */}
            <h3 
              className={cn(
                'font-display font-black leading-tight relative',
                size === 'sm' && 'text-lg',
                size === 'md' && 'text-3xl',
                size === 'lg' && 'text-5xl',
              )}
              style={{
                color: '#ffffff',
                textShadow: `
                  0 0 10px rgba(0,0,0,0.8),
                  0 2px 4px rgba(0,0,0,0.9),
                  0 4px 8px rgba(0,0,0,0.7),
                  0 0 20px rgba(0,0,0,0.5)
                `,
                WebkitTextStroke: size === 'lg' ? '1.5px rgba(0,0,0,0.6)' : size === 'md' ? '1px rgba(0,0,0,0.6)' : '0.5px rgba(0,0,0,0.6)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
              }}
            >
              {player.name.split(' ').slice(0, -1).join(' ')}
            </h3>
            
            {/* Last name - Accent color with dark outline for contrast */}
            <motion.h3 
              className={cn(
                'font-display font-black leading-tight relative',
                size === 'sm' && 'text-xl',
                size === 'md' && 'text-4xl',
                size === 'lg' && 'text-6xl',
              )}
              style={{ 
                color: config.accent,
                textShadow: `
                  0 0 20px ${config.glow},
                  0 0 40px ${config.glow}40,
                  0 4px 8px rgba(0,0,0,0.9),
                  0 8px 16px rgba(0,0,0,0.7),
                  0 0 30px rgba(0,0,0,0.6)
                `,
                WebkitTextStroke: size === 'lg' ? '2px rgba(0,0,0,0.8)' : size === 'md' ? '1.5px rgba(0,0,0,0.8)' : '1px rgba(0,0,0,0.8)',
                filter: `drop-shadow(0 0 10px ${config.glow}) drop-shadow(0 4px 8px rgba(0,0,0,0.8))`,
              }}
              animate={isHovered ? { 
                textShadow: `
                  0 0 30px ${config.glow},
                  0 0 60px ${config.glow}60,
                  0 6px 12px rgba(0,0,0,0.9),
                  0 0 40px rgba(0,0,0,0.7)
                `,
                filter: `drop-shadow(0 0 20px ${config.glow}) drop-shadow(0 6px 12px rgba(0,0,0,0.9))`
              } : {}}
            >
              {player.name.split(' ').slice(-1)[0]}
            </motion.h3>
            
            {size !== 'sm' && (
              <motion.div 
                className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  borderColor: config.accent,
                  backdropFilter: 'blur(8px)',
                  boxShadow: `0 2px 8px rgba(0,0,0,0.5), 0 0 12px ${config.glow}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span 
                  className="uppercase tracking-widest font-bold"
                  style={{ 
                    fontSize: size === 'lg' ? '14px' : '12px',
                    color: '#ffffff',
                    textShadow: `
                      0 0 8px ${config.glow},
                      0 2px 4px rgba(0,0,0,0.8),
                      0 0 12px rgba(0,0,0,0.6)
                    `,
                    WebkitTextStroke: '0.5px rgba(0,0,0,0.5)',
                  }}
                >
                  {player.version}
                </span>
              </motion.div>
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

          {/* Rating display with enhanced visibility - Dark backdrop */}
          <motion.div 
            className="mt-auto z-10 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Dark backdrop for rating */}
            <motion.div
              className="absolute -inset-3 rounded-xl -z-10"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(12px)',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
                border: `1px solid ${config.accent}40`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            />
            
            <div className="flex items-end gap-3 mb-3 px-2">
              <motion.span 
                className={cn(
                  'font-display font-black relative',
                  size === 'sm' && 'text-4xl',
                  size === 'md' && 'text-6xl',
                  size === 'lg' && 'text-8xl',
                )}
                style={{ 
                  color: '#ffffff',
                  textShadow: `
                    0 0 20px ${config.glow},
                    0 0 40px ${config.glow}60,
                    0 4px 8px rgba(0,0,0,0.9),
                    0 8px 16px rgba(0,0,0,0.7),
                    0 0 30px rgba(0,0,0,0.6)
                  `,
                  WebkitTextStroke: size === 'lg' ? '2.5px rgba(0,0,0,0.9)' : size === 'md' ? '2px rgba(0,0,0,0.9)' : '1.5px rgba(0,0,0,0.9)',
                  filter: `drop-shadow(0 0 15px ${config.glow}) drop-shadow(0 4px 8px rgba(0,0,0,0.9))`,
                }}
                animate={isHovered ? { 
                  textShadow: `
                    0 0 30px ${config.glow},
                    0 0 60px ${config.glow}80,
                    0 6px 12px rgba(0,0,0,0.9),
                    0 0 40px rgba(0,0,0,0.7)
                  `,
                  scale: 1.08,
                  filter: `drop-shadow(0 0 25px ${config.glow}) drop-shadow(0 6px 12px rgba(0,0,0,0.9))`
                } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {player.rating}
              </motion.span>
              <span 
                className="mb-2 uppercase tracking-widest font-bold relative"
                style={{
                  fontSize: size === 'lg' ? '14px' : '12px',
                  color: '#ffffff',
                  textShadow: `
                    0 2px 4px rgba(0,0,0,0.8),
                    0 0 8px rgba(0,0,0,0.6)
                  `,
                  WebkitTextStroke: '0.5px rgba(0,0,0,0.7)',
                }}
              >
                Overall
              </span>
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
                    className="flex-1 rounded-xl py-2 px-1 text-center text-white relative overflow-hidden"
                    style={{ 
                      backgroundColor: stat.color,
                      boxShadow: `0 4px 12px ${stat.color}50, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.8 },
                      visible: { opacity: 1, y: 0, scale: 1 }
                    }}
                    whileHover={{ 
                      scale: 1.12, 
                      zIndex: 10,
                      boxShadow: `0 8px 24px ${stat.color}80, inset 0 1px 0 rgba(255,255,255,0.3)`,
                    }}
                  >
                    {/* Shine sweep effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
                      style={{ opacity: 0.4 }}
                    />
                    {/* Stat value with enhanced visibility */}
                    <div 
                      className={cn('font-black relative', size === 'md' ? 'text-lg' : 'text-xl')}
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.2)',
                      }}
                    >
                      {stat.value}
                    </div>
                    {/* Stat label */}
                    <div 
                      className="text-[10px] uppercase font-semibold tracking-wide relative"
                      style={{
                        textShadow: '0 1px 1px rgba(0,0,0,0.2)',
                        opacity: 0.95,
                      }}
                    >
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Price tag with enhanced visibility - Dark backdrop */}
            {size !== 'sm' && (
              <motion.div 
                className="mt-3 flex justify-between items-center px-4 py-2.5 rounded-xl border-2"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  borderColor: config.accent,
                  backdropFilter: 'blur(12px)',
                  boxShadow: `0 4px 16px rgba(0,0,0,0.5), 0 0 20px ${config.glow}40, inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <span 
                  className="uppercase tracking-widest font-bold"
                  style={{
                    fontSize: '11px',
                    color: '#ffffff',
                    textShadow: `
                      0 2px 4px rgba(0,0,0,0.8),
                      0 0 8px rgba(0,0,0,0.6)
                    `,
                    WebkitTextStroke: '0.5px rgba(0,0,0,0.7)',
                  }}
                >
                  Base Price
                </span>
                <motion.span 
                  className="font-black text-lg"
                  style={{ 
                    color: '#ffffff',
                    textShadow: `
                      0 0 12px ${config.glow},
                      0 0 24px ${config.glow}60,
                      0 2px 4px rgba(0,0,0,0.9),
                      0 0 20px rgba(0,0,0,0.7)
                    `,
                    WebkitTextStroke: '1px rgba(0,0,0,0.8)',
                    filter: `drop-shadow(0 0 8px ${config.glow})`,
                  }}
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
      
      {/* Rating badge with enhanced glow */}
      <motion.div 
        className="absolute top-1 left-1 px-2 py-0.5 rounded-md font-black text-white"
        style={{ 
          backgroundColor: colors.accent,
          fontSize: '11px',
          boxShadow: `0 2px 6px ${colors.glow}`,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
        animate={isHovered ? { boxShadow: `0 0 12px ${colors.glow}, 0 2px 8px ${colors.glow}` } : {}}
      >
        {player.rating}
      </motion.div>

      {/* Position with better visibility */}
      <div 
        className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md font-bold text-gray-800"
        style={{
          fontSize: '9px',
          backgroundColor: 'rgba(255,255,255,0.95)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        }}
      >
        {player.position}
      </div>
      
      {/* Player name with enhanced visibility */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 p-1.5 text-center"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
        }}
        animate={isHovered ? { y: -2 } : { y: 0 }}
      >
        <p 
          className="font-black text-white truncate"
          style={{
            fontSize: '10px',
            textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)',
            letterSpacing: '0.5px',
          }}
        >
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
            {/* All Positions - Main + Alternates */}
            <motion.div 
              className="flex flex-wrap gap-2 mb-6"
              variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
            >
              {/* Main position */}
              <div 
                className="px-5 py-2 rounded-full text-white font-black tracking-wide"
                style={{ 
                  backgroundColor: config.accent,
                  boxShadow: `0 4px 16px ${config.glow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  fontSize: '15px',
                }}
              >
                {player.position}
                <span className="ml-2 text-xs opacity-80 font-normal">Main</span>
              </div>
              
              {/* Alternate positions */}
              {parseAltPositions(player.altPositions).map((altPos) => {
                const posColors = getPositionDisplayColor(altPos);
                return (
                  <div
                    key={altPos}
                    className={cn(
                      'px-4 py-2 rounded-full font-bold border-2',
                      posColors.bg,
                      posColors.border
                    )}
                    style={{ 
                      fontSize: '14px',
                      color: '#374151',
                    }}
                  >
                    {altPos}
                    <span className="ml-2 text-xs opacity-60 font-normal">Alt</span>
                  </div>
                );
              })}
              
              {/* Show count if no alternates */}
              {parseAltPositions(player.altPositions).length === 0 && (
                <div className="px-4 py-2 rounded-full bg-gray-200/50 text-gray-500 text-sm font-medium">
                  No alternate positions
                </div>
              )}
            </motion.div>

            {/* Player name with enhanced visibility */}
            <motion.h2 
              className="text-4xl lg:text-6xl font-display font-black leading-tight"
              style={{
                color: '#1f2937',
                textShadow: '0 2px 4px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.8)',
              }}
              variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } }}
            >
              {player.name.split(' ').slice(0, -1).join(' ')}
            </motion.h2>
            <motion.h2 
              className="text-5xl lg:text-7xl font-display font-black leading-tight mb-4"
              style={{ 
                color: config.accent,
                textShadow: `0 2px 12px ${config.glow}, 0 4px 20px rgba(0,0,0,0.15)`,
              }}
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

            {/* Player info grid with enhanced visibility */}
            <motion.div 
              className="grid grid-cols-3 gap-4 mb-8 p-4 rounded-2xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
              }}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
              <div>
                <p 
                  className="uppercase tracking-widest mb-1 font-semibold"
                  style={{ fontSize: '11px', color: '#6b7280' }}
                >
                  Age
                </p>
                <p 
                  className="text-2xl font-black"
                  style={{ color: '#1f2937', textShadow: '0 1px 0 rgba(255,255,255,0.8)' }}
                >
                  {player.age}
                </p>
              </div>
              <div>
                <p 
                  className="uppercase tracking-widest mb-1 font-semibold"
                  style={{ fontSize: '11px', color: '#6b7280' }}
                >
                  Version
                </p>
                <p 
                  className="text-lg font-black" 
                  style={{ color: config.accent, textShadow: `0 1px 4px ${config.glow}` }}
                >
                  {player.version}
                </p>
              </div>
              <div>
                <p 
                  className="uppercase tracking-widest mb-1 font-semibold"
                  style={{ fontSize: '11px', color: '#6b7280' }}
                >
                  Rarity
                </p>
                <p 
                  className="text-lg font-black uppercase" 
                  style={{ color: config.accent, textShadow: `0 1px 4px ${config.glow}` }}
                >
                  {player.rarity || 'Common'}
                </p>
              </div>
            </motion.div>

            {/* Rating display with enhanced visibility */}
            <motion.div 
              className="flex items-end gap-4 mb-8"
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
            >
              <span 
                className="text-8xl font-display font-black" 
                style={{ 
                  color: config.accent,
                  textShadow: `0 4px 16px ${config.glow}, 0 0 40px ${config.glow}`,
                }}
              >
                {player.rating}
              </span>
              <span 
                className="mb-4 uppercase tracking-widest font-bold"
                style={{
                  fontSize: '16px',
                  color: '#4b5563',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                }}
              >
                Overall Rating
              </span>
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
                    style={{ 
                      backgroundColor: stat.color,
                      boxShadow: `0 4px 12px ${stat.color}50, inset 0 1px 0 rgba(255,255,255,0.25)`,
                    }}
                    variants={{ hidden: { opacity: 0, y: 20, scale: 0.8 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                    whileHover={{ scale: 1.1, boxShadow: `0 8px 24px ${stat.color}80` }}
                  >
                    <div 
                      className="text-2xl font-black"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                    >
                      {stat.value}
                    </div>
                    <div 
                      className="text-[9px] uppercase tracking-wider font-semibold"
                      style={{ textShadow: '0 1px 1px rgba(0,0,0,0.2)', opacity: 0.95 }}
                    >
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Price info with enhanced visibility */}
            <motion.div 
              className="mt-8 flex gap-6 p-4 rounded-2xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
              }}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
              <div>
                <p 
                  className="uppercase tracking-widest mb-1 font-semibold"
                  style={{ fontSize: '11px', color: '#6b7280' }}
                >
                  Base Price
                </p>
                <p 
                  className="text-2xl font-black"
                  style={{ color: '#16a34a', textShadow: '0 2px 8px rgba(22,163,74,0.3)' }}
                >
                  {formatCurrency(player.basePrice * 1000000)}
                </p>
              </div>
              {purchasePrice && (
                <div>
                  <p 
                    className="uppercase tracking-widest mb-1 font-semibold"
                    style={{ fontSize: '11px', color: '#6b7280' }}
                  >
                    Purchase Price
                  </p>
                  <p 
                    className="text-2xl font-black" 
                    style={{ color: config.accent, textShadow: `0 2px 8px ${config.glow}` }}
                  >
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
