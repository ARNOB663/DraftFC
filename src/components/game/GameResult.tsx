'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { PlayerCard, MiniPlayerCard, PlayerDetailModal } from './PlayerCard';
import { cn, formatBudget, formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import type { Player, TeamAnalysis } from '@/types';
import { 
  Trophy, 
  Crown, 
  Star, 
  Users, 
  DollarSign, 
  Target,
  Sparkles,
  Home,
  RotateCcw,
  TrendingUp,
  Zap,
  Brain,
  Link2,
  Scale,
  Lightbulb,
  Shield,
  Swords,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';

// Radar Chart Component
function RadarChart({ 
  categories, 
  winnerValues, 
  loserValues, 
  winnerName, 
  loserName 
}: { 
  categories: string[];
  winnerValues: number[];
  loserValues: number[];
  winnerName: string;
  loserName: string;
}) {
  const size = 280;
  const center = size / 2;
  const maxValue = 100;
  const levels = 5;
  
  const getPoint = (value: number, index: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const radius = (value / maxValue) * (size / 2 - 40);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };

  const createPath = (values: number[]) => {
    return values.map((v, i) => {
      const point = getPoint(v, i, values.length);
      return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ') + ' Z';
  };

  return (
    <div className="relative">
      <svg width={size} height={size} className="mx-auto">
        {/* Background circles */}
        {[...Array(levels)].map((_, i) => (
          <polygon
            key={i}
            points={categories.map((_, idx) => {
              const point = getPoint(((i + 1) / levels) * maxValue, idx, categories.length);
              return `${point.x},${point.y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {categories.map((_, i) => {
          const point = getPoint(maxValue, i, categories.length);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Loser data area */}
        <motion.path
          d={createPath(loserValues)}
          fill="rgba(168, 85, 247, 0.2)"
          stroke="#A855F7"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />

        {/* Winner data area */}
        <motion.path
          d={createPath(winnerValues)}
          fill="rgba(34, 211, 238, 0.3)"
          stroke="#22D3EE"
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />

        {/* Data points */}
        {winnerValues.map((v, i) => {
          const point = getPoint(v, i, winnerValues.length);
          return (
            <motion.circle
              key={`winner-${i}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#22D3EE"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            />
          );
        })}

        {/* Labels */}
        {categories.map((cat, i) => {
          const point = getPoint(maxValue + 20, i, categories.length);
          return (
            <text
              key={cat}
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-400 text-[11px] font-medium"
            >
              {cat}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neon-cyan" />
          <span className="text-sm text-gray-300">{winnerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neon-purple" />
          <span className="text-sm text-gray-400">{loserName}</span>
        </div>
      </div>
    </div>
  );
}

// Pillar Score Card
function PillarCard({ 
  title, 
  icon: Icon, 
  winnerScore, 
  loserScore, 
  color,
  description,
  isExpanded,
  onToggle,
  details
}: {
  title: string;
  icon: any;
  winnerScore: number;
  loserScore: number;
  color: string;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
  details?: React.ReactNode;
}) {
  const diff = winnerScore - loserScore;
  const winnerPercentage = (winnerScore / 100) * 100;
  const loserPercentage = (loserScore / 100) * 100;

  return (
    <motion.div 
      className="bg-dark-800/50 rounded-2xl p-4 border border-dark-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h4 className="font-bold text-white">{title}</h4>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-neon-cyan">{winnerScore.toFixed(1)}</span>
              <span className="text-gray-500">vs</span>
              <span className="text-lg font-bold text-gray-400">{loserScore.toFixed(1)}</span>
            </div>
            <span className={cn(
              'text-xs font-medium',
              diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'
            )}>
              {diff > 0 ? '+' : ''}{diff.toFixed(1)} diff
            </span>
          </div>
          {details && (
            isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-4 space-y-2">
        <div className="relative h-2 bg-dark-700 rounded-full overflow-hidden">
          <motion.div 
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ backgroundColor: '#22D3EE' }}
            initial={{ width: 0 }}
            animate={{ width: `${winnerPercentage}%` }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </div>
        <div className="relative h-2 bg-dark-700 rounded-full overflow-hidden">
          <motion.div 
            className="absolute inset-y-0 left-0 rounded-full bg-neon-purple/60"
            initial={{ width: 0 }}
            animate={{ width: `${loserPercentage}%` }}
            transition={{ delay: 0.5, duration: 0.8 }}
          />
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && details && (
        <motion.div 
          className="mt-4 pt-4 border-t border-dark-700"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {details}
        </motion.div>
      )}
    </motion.div>
  );
}

// Squad Validation Status
function ValidationStatus({ validation, playerName }: { validation: any; playerName: string }) {
  const isValid = validation?.isValid ?? false;

  return (
    <div className={cn(
      'rounded-xl p-4 border',
      isValid 
        ? 'bg-green-500/10 border-green-500/30' 
        : 'bg-red-500/10 border-red-500/30'
    )}>
      <div className="flex items-center gap-3 mb-3">
        {isValid ? (
          <CheckCircle className="w-6 h-6 text-green-400" />
        ) : (
          <XCircle className="w-6 h-6 text-red-400" />
        )}
        <div>
          <p className="font-bold text-white">{playerName}</p>
          <p className={cn(
            'text-sm',
            isValid ? 'text-green-400' : 'text-red-400'
          )}>
            {isValid ? 'Valid Squad ✓' : 'Invalid Squad ✗'}
          </p>
        </div>
      </div>

      {validation?.positionCounts && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className={cn('rounded-lg p-2', validation.positionCounts.GK >= 1 ? 'bg-green-500/20' : 'bg-red-500/20')}>
            <p className="text-lg font-bold">{validation.positionCounts.GK}</p>
            <p className="text-xs text-gray-400">GK</p>
          </div>
          <div className={cn('rounded-lg p-2', validation.positionCounts.DEF >= 3 ? 'bg-green-500/20' : 'bg-red-500/20')}>
            <p className="text-lg font-bold">{validation.positionCounts.DEF}</p>
            <p className="text-xs text-gray-400">DEF</p>
          </div>
          <div className={cn('rounded-lg p-2', validation.positionCounts.MID >= 2 ? 'bg-green-500/20' : 'bg-red-500/20')}>
            <p className="text-lg font-bold">{validation.positionCounts.MID}</p>
            <p className="text-xs text-gray-400">MID</p>
          </div>
          <div className={cn('rounded-lg p-2', validation.positionCounts.FWD >= 1 ? 'bg-green-500/20' : 'bg-red-500/20')}>
            <p className="text-lg font-bold">{validation.positionCounts.FWD}</p>
            <p className="text-xs text-gray-400">FWD</p>
          </div>
        </div>
      )}

      {validation?.errors && validation.errors.length > 0 && (
        <div className="mt-3 space-y-1">
          {validation.errors.map((error: string, i: number) => (
            <p key={i} className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function GameResult() {
  const router = useRouter();
  const { gameResult, room, currentPlayer, reset } = useGameStore();
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  if (!gameResult || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Loading results...</p>
        </div>
      </div>
    );
  }

  const { 
    winner, 
    loser, 
    winnerScore, 
    loserScore, 
    scoreDifference, 
    mvp,
    bestTacticalChoice,
    bestValueSigning,
    matchSummary,
    radarComparison
  } = gameResult;

  const isWinner = currentPlayer?.id === winner.id;

  // Get analysis data (with fallback for legacy results)
  const winnerAnalysis = winnerScore.analysis;
  const loserAnalysis = loserScore.analysis;

  const handlePlayAgain = () => {
    reset();
    router.push('/');
  };

  const handleGoHome = () => {
    reset();
    router.push('/');
  };

  const togglePillar = (pillar: string) => {
    setExpandedPillar(expandedPillar === pillar ? null : pillar);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 overflow-y-auto bg-gradient-to-b from-dark-900 via-dark-900 to-dark-950">
      <div className="max-w-7xl mx-auto">
        {/* Winner Announcement */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Trophy animation */}
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <div className="relative">
              <Trophy className="w-20 h-20 text-rarity-legendary" />
              <motion.div
                className="absolute -inset-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                {[...Array(8)].map((_, i) => (
                  <Sparkles
                    key={i}
                    className="absolute w-4 h-4 text-rarity-legendary"
                    style={{
                      top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 8)}%`,
                      left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 8)}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-display font-black mb-2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isWinner ? (
              <span className="gradient-text-gold">VICTORY!</span>
            ) : (
              <span className="text-dark-300">DEFEAT</span>
            )}
          </motion.h1>

          <motion.p
            className="text-lg text-dark-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span className="text-neon-cyan font-bold">{winner.name}</span> wins with{' '}
            <span className="text-rarity-legendary font-bold">{winnerScore.totalScore.toFixed(1)}</span> points
            {matchSummary?.winByDefault && (
              <span className="text-yellow-400 ml-2">(Opponent had invalid squad)</span>
            )}
          </motion.p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Radar Chart & Summary */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            {/* Radar Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-neon-cyan" />
                Performance Comparison
              </h3>
              {radarComparison && (
                <RadarChart
                  categories={radarComparison.categories}
                  winnerValues={radarComparison.winnerValues}
                  loserValues={radarComparison.loserValues}
                  winnerName={winner.name}
                  loserName={loser.name}
                />
              )}
            </div>

            {/* Match Summary */}
            {matchSummary && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-green" />
                  Match Insights
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Dominant Pillar</span>
                    <span className="text-neon-cyan font-bold">{matchSummary.dominantPillar}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Closest Contest</span>
                    <span className="text-neon-purple font-bold">{matchSummary.closestPillar}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Score Difference</span>
                    <span className="text-rarity-legendary font-bold">{scoreDifference.toFixed(1)} pts</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Center Column - 5 Pillars Breakdown */}
          <motion.div 
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-rarity-legendary" />
              The 5 Pillars of Victory
            </h3>

            {/* Power Score */}
            <PillarCard
              title="Power Score"
              icon={Zap}
              winnerScore={winnerAnalysis?.power?.total ?? 0}
              loserScore={loserAnalysis?.power?.total ?? 0}
              color="#22D3EE"
              description="Raw football quality (30%)"
              isExpanded={expandedPillar === 'power'}
              onToggle={() => togglePillar('power')}
              details={
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-2">Winner Details:</p>
                    <p>Avg Overall: <span className="text-neon-cyan font-bold">{winnerAnalysis?.power?.avgOverall?.toFixed(1)}</span></p>
                    <p>Key Stats: <span className="text-neon-cyan font-bold">{winnerAnalysis?.power?.keyStatsAvg?.toFixed(1)}</span></p>
                    <p>Superstar Bonus: <span className="text-rarity-legendary font-bold">+{winnerAnalysis?.power?.superstarBonus}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-2">Loser Details:</p>
                    <p>Avg Overall: <span className="text-gray-400">{loserAnalysis?.power?.avgOverall?.toFixed(1)}</span></p>
                    <p>Key Stats: <span className="text-gray-400">{loserAnalysis?.power?.keyStatsAvg?.toFixed(1)}</span></p>
                    <p>Superstar Bonus: <span className="text-gray-400">+{loserAnalysis?.power?.superstarBonus}</span></p>
                  </div>
                </div>
              }
            />

            {/* Tactical Score */}
            <PillarCard
              title="Tactical Score"
              icon={Target}
              winnerScore={winnerAnalysis?.tactical?.total ?? 0}
              loserScore={loserAnalysis?.tactical?.total ?? 0}
              color="#22C55E"
              description="Position matching & formation (20%)"
              isExpanded={expandedPillar === 'tactical'}
              onToggle={() => togglePillar('tactical')}
              details={
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-2">Winner:</p>
                    <p>Natural Positions: <span className="text-green-400 font-bold">{winnerAnalysis?.tactical?.naturalPositions}</span></p>
                    <p>Formation Fit: <span className="text-green-400 font-bold">{winnerAnalysis?.tactical?.formationFit}%</span></p>
                    <p>Out of Position: <span className="text-red-400 font-bold">{winnerAnalysis?.tactical?.outOfPosition}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-2">Loser:</p>
                    <p>Natural Positions: <span className="text-gray-400">{loserAnalysis?.tactical?.naturalPositions}</span></p>
                    <p>Formation Fit: <span className="text-gray-400">{loserAnalysis?.tactical?.formationFit}%</span></p>
                    <p>Out of Position: <span className="text-gray-400">{loserAnalysis?.tactical?.outOfPosition}</span></p>
                  </div>
                </div>
              }
            />

            {/* Chemistry Score */}
            <PillarCard
              title="Chemistry Score"
              icon={Link2}
              winnerScore={winnerAnalysis?.chemistry?.total ?? 0}
              loserScore={loserAnalysis?.chemistry?.total ?? 0}
              color="#A855F7"
              description="Team links & synergy (20%)"
              isExpanded={expandedPillar === 'chemistry'}
              onToggle={() => togglePillar('chemistry')}
              details={
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-2">Winner Links:</p>
                    <p>Club Links: <span className="text-neon-purple font-bold">{winnerAnalysis?.chemistry?.clubLinks}</span></p>
                    <p>Nation Links: <span className="text-neon-purple font-bold">{winnerAnalysis?.chemistry?.nationLinks}</span></p>
                    <p>Strong Links: <span className="text-rarity-legendary font-bold">{winnerAnalysis?.chemistry?.details?.strongLinks}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-2">Loser Links:</p>
                    <p>Club Links: <span className="text-gray-400">{loserAnalysis?.chemistry?.clubLinks}</span></p>
                    <p>Nation Links: <span className="text-gray-400">{loserAnalysis?.chemistry?.nationLinks}</span></p>
                    <p>Strong Links: <span className="text-gray-400">{loserAnalysis?.chemistry?.details?.strongLinks}</span></p>
                  </div>
                </div>
              }
            />

            {/* Balance Score */}
            <PillarCard
              title="Squad Balance"
              icon={Scale}
              winnerScore={winnerAnalysis?.balance?.total ?? 0}
              loserScore={loserAnalysis?.balance?.total ?? 0}
              color="#F59E0B"
              description="Squad structure & coverage (15%)"
              isExpanded={expandedPillar === 'balance'}
              onToggle={() => togglePillar('balance')}
              details={
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-2">Winner Balance:</p>
                    <p>Position Coverage: <span className="text-yellow-400 font-bold">{winnerAnalysis?.balance?.positionCoverage}%</span></p>
                    <p>Wing Balance: <span className="text-yellow-400 font-bold">{winnerAnalysis?.balance?.wingBalance}%</span></p>
                    <p>Depth Score: <span className="text-yellow-400 font-bold">{winnerAnalysis?.balance?.depthScore}%</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-2">Loser Balance:</p>
                    <p>Position Coverage: <span className="text-gray-400">{loserAnalysis?.balance?.positionCoverage}%</span></p>
                    <p>Wing Balance: <span className="text-gray-400">{loserAnalysis?.balance?.wingBalance}%</span></p>
                    <p>Depth Score: <span className="text-gray-400">{loserAnalysis?.balance?.depthScore}%</span></p>
                  </div>
                </div>
              }
            />

            {/* Manager IQ Score */}
            <PillarCard
              title="Manager IQ"
              icon={Brain}
              winnerScore={winnerAnalysis?.managerIQ?.total ?? 0}
              loserScore={loserAnalysis?.managerIQ?.total ?? 0}
              color="#EC4899"
              description="Budget efficiency & smart drafting (15%)"
              isExpanded={expandedPillar === 'managerIQ'}
              onToggle={() => togglePillar('managerIQ')}
              details={
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-2">Winner Efficiency:</p>
                    <p>Budget Used: <span className="text-pink-400 font-bold">{formatCurrency(winnerAnalysis?.managerIQ?.details?.totalSpent || 0)}</span></p>
                    <p>Efficiency: <span className="text-pink-400 font-bold">{winnerAnalysis?.managerIQ?.budgetEfficiency?.toFixed(1)}</span></p>
                    <p>Steal Bids: <span className="text-green-400 font-bold">+{winnerAnalysis?.managerIQ?.stealBids}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-2">Loser Efficiency:</p>
                    <p>Budget Used: <span className="text-gray-400">{formatCurrency(loserAnalysis?.managerIQ?.details?.totalSpent || 0)}</span></p>
                    <p>Efficiency: <span className="text-gray-400">{loserAnalysis?.managerIQ?.budgetEfficiency?.toFixed(1)}</span></p>
                    <p>Steal Bids: <span className="text-gray-400">+{loserAnalysis?.managerIQ?.stealBids}</span></p>
                  </div>
                </div>
              }
            />
          </motion.div>
        </div>

        {/* Squad Validation */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <ValidationStatus 
            validation={winnerAnalysis?.validation} 
            playerName={`${winner.name} (Winner)`}
          />
          <ValidationStatus 
            validation={loserAnalysis?.validation} 
            playerName={`${loser.name}`}
          />
        </motion.div>

        {/* Awards Section */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          {/* MVP */}
          {mvp && (
            <div className="glass-card p-6 text-center neon-glow-gold border-rarity-legendary/30">
              <Crown className="w-10 h-10 text-rarity-legendary mx-auto mb-3" />
              <h4 className="font-bold text-rarity-legendary mb-1">Match MVP</h4>
              <p className="text-sm text-gray-400 mb-4">Highest rated player</p>
              <div 
                className="cursor-pointer mx-auto w-fit"
                onClick={() => setSelectedPlayer(mvp)}
              >
                <div className="w-24 h-28">
                  <MiniPlayerCard player={mvp} />
                </div>
                <p className="text-white font-bold mt-2">{mvp.name}</p>
                <p className="text-neon-cyan font-bold">{mvp.rating} OVR</p>
              </div>
            </div>
          )}

          {/* Best Tactical Choice */}
          {bestTacticalChoice && (
            <div className="glass-card p-6 text-center border-green-500/30">
              <Target className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <h4 className="font-bold text-green-400 mb-1">Best Tactical</h4>
              <p className="text-sm text-gray-400 mb-4">Perfect position fit</p>
              <div 
                className="cursor-pointer mx-auto w-fit"
                onClick={() => setSelectedPlayer(bestTacticalChoice)}
              >
                <div className="w-24 h-28">
                  <MiniPlayerCard player={bestTacticalChoice} />
                </div>
                <p className="text-white font-bold mt-2">{bestTacticalChoice.name}</p>
                <p className="text-green-400 font-bold">{bestTacticalChoice.position}</p>
              </div>
            </div>
          )}

          {/* Best Value Signing */}
          {bestValueSigning && (
            <div className="glass-card p-6 text-center border-pink-500/30">
              <DollarSign className="w-10 h-10 text-pink-400 mx-auto mb-3" />
              <h4 className="font-bold text-pink-400 mb-1">Best Value</h4>
              <p className="text-sm text-gray-400 mb-4">Smartest signing</p>
              <div 
                className="cursor-pointer mx-auto w-fit"
                onClick={() => setSelectedPlayer(bestValueSigning)}
              >
                <div className="w-24 h-28">
                  <MiniPlayerCard player={bestValueSigning} />
                </div>
                <p className="text-white font-bold mt-2">{bestValueSigning.name}</p>
                <p className="text-pink-400 font-bold">{bestValueSigning.rating} OVR</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Final Scores */}
        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          {/* Winner */}
          <div className={cn(
            'glass-card p-6',
            isWinner ? 'neon-glow-gold border-rarity-legendary/50' : 'neon-glow-cyan border-neon-cyan/50'
          )}>
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-8 h-8 text-rarity-legendary" />
              <div>
                <p className="text-xs text-rarity-legendary uppercase tracking-wide font-bold">Winner</p>
                <h3 className="text-xl font-bold">{winner.name}</h3>
              </div>
              <div className="ml-auto text-right">
                <p className="text-3xl font-display font-black text-rarity-legendary">
                  {winnerScore.totalScore.toFixed(1)}
                </p>
                <p className="text-xs text-gray-400">Final Score</p>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              <p>Squad: {winner.squad.length} players | Formation: {winnerAnalysis?.formation?.displayName || '4-3-3'}</p>
              <p>Remaining Budget: <span className="text-neon-green font-mono">{formatBudget(winner.budget)}</span></p>
            </div>
          </div>

          {/* Loser */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Runner Up</p>
                <h3 className="text-xl font-bold text-gray-300">{loser.name}</h3>
              </div>
              <div className="ml-auto text-right">
                <p className="text-3xl font-display font-black text-gray-400">
                  {loserScore.totalScore.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">Final Score</p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>Squad: {loser.squad.length} players | Formation: {loserAnalysis?.formation?.displayName || '4-3-3'}</p>
              <p>Remaining Budget: <span className="font-mono">{formatBudget(loser.budget)}</span></p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <button
            onClick={handlePlayAgain}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
          <button
            onClick={handleGoHome}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </motion.div>
      </div>

      {/* Player Detail Modal */}
      <PlayerDetailModal
        player={selectedPlayer}
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
}
