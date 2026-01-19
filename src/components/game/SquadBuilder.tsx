'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useGameStore } from '@/stores/gameStore';
import { cn, formatCurrency, getAllPlayerPositions, getPositionDisplayColor } from '@/lib/utils';
import type { Player, Position, Formation } from '@/types';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Trophy,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  Wand2,
  Send,
  Loader2,
  Bot,
  User
} from 'lucide-react';
import { MiniPlayerCard } from './PlayerCard';

// Formation definitions (matching ScoringEngine)
const FORMATIONS: Formation[] = [
  { 
    name: '4-3-3', 
    displayName: '4-3-3', 
    structure: '4-3-3', 
    positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CM', 'LW', 'ST', 'RW'] 
  },
  { 
    name: '4-4-2', 
    displayName: '4-4-2', 
    structure: '4-4-2', 
    positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'LM', 'CM', 'CM', 'RM', 'ST', 'ST'] 
  },
  { 
    name: '4-2-3-1', 
    displayName: '4-2-3-1', 
    structure: '4-2-3-1', 
    positions: ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'LW', 'CAM', 'RM', 'ST'] 
  },
  { 
    name: '3-5-2', 
    displayName: '3-5-2', 
    structure: '3-5-2', 
    positions: ['GK', 'CB', 'CB', 'CB', 'LM', 'CDM', 'CM', 'CM', 'RM', 'ST', 'ST'] 
  },
  { 
    name: '5-3-2', 
    displayName: '5-3-2', 
    structure: '5-3-2', 
    positions: ['GK', 'LWB', 'CB', 'CB', 'CB', 'RWB', 'CM', 'CDM', 'CM', 'ST', 'ST'] 
  },
];

const SQUAD_BUILD_TIME = 5 * 60; // 5 minutes in seconds

interface SquadSlot {
  position: Position;
  player: Player | null;
  isValid: boolean;
  x: number;
  y: number;
}

interface SquadValidation {
  isValid: boolean;
  hasElevenPlayers: boolean;
  hasGoalkeeper: boolean;
  hasMinDefenders: boolean;
  hasMinMidfielders: boolean;
  hasMinForwards: boolean;
  errors: string[];
}

type FormationLine = { y: number; positions: Position[] };

const FORMATION_LAYOUTS: Record<string, FormationLine[]> = {
  '4-3-3': [
    { y: 88, positions: ['GK'] },
    { y: 70, positions: ['LB', 'CB', 'CB', 'RB'] },
    { y: 52, positions: ['CM', 'CM', 'CM'] },
    { y: 30, positions: ['LW', 'ST', 'RW'] },
  ],
  '4-4-2': [
    { y: 88, positions: ['GK'] },
    { y: 70, positions: ['LB', 'CB', 'CB', 'RB'] },
    { y: 52, positions: ['LM', 'CM', 'CM', 'RM'] },
    { y: 30, positions: ['ST', 'ST'] },
  ],
  '4-2-3-1': [
    { y: 88, positions: ['GK'] },
    { y: 70, positions: ['LB', 'CB', 'CB', 'RB'] },
    { y: 58, positions: ['CDM', 'CDM'] },
    { y: 42, positions: ['LW', 'CAM', 'RM'] },
    { y: 26, positions: ['ST'] },
  ],
  '3-5-2': [
    { y: 88, positions: ['GK'] },
    { y: 70, positions: ['CB', 'CB', 'CB'] },
    { y: 52, positions: ['LM', 'CDM', 'CM', 'CM', 'RM'] },
    { y: 30, positions: ['ST', 'ST'] },
  ],
  '5-3-2': [
    { y: 88, positions: ['GK'] },
    { y: 72, positions: ['LWB', 'CB', 'CB', 'CB', 'RWB'] },
    { y: 52, positions: ['CM', 'CDM', 'CM'] },
    { y: 30, positions: ['ST', 'ST'] },
  ],
};

function buildSlots(formation: Formation): SquadSlot[] {
  const lines = FORMATION_LAYOUTS[formation.name];
  const slots: SquadSlot[] = [];

  if (!lines) {
    const cols = 4;
    formation.positions.forEach((pos, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = 12 + (col * 76) / (cols - 1);
      const y = 18 + row * 16;
      slots.push({ position: pos, player: null, isValid: false, x, y });
    });
    return slots;
  }

  lines.forEach((line) => {
    const count = line.positions.length;
    line.positions.forEach((pos, idx) => {
      const x = count === 1 ? 50 : 10 + (80 * idx) / (count - 1);
      slots.push({ position: pos, player: null, isValid: false, x, y: line.y });
    });
  });

  return slots;
}

export function SquadBuilder() {
  const { room, currentPlayer, opponent, submitSquad, opponentSquadStatus } = useGameStore();
  const [selectedFormation, setSelectedFormation] = useState<Formation>(FORMATIONS[0]);
  const [squadSlots, setSquadSlots] = useState<SquadSlot[]>([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState<Player[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(SQUAD_BUILD_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormationPicker, setShowFormationPicker] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // Initialize squad slots based on formation
  useEffect(() => {
    if (selectedFormation) {
      setSquadSlots(buildSlots(selectedFormation));
    }
  }, [selectedFormation]);

  // Load players from current player's squad
  useEffect(() => {
    if (currentPlayer?.squad) {
      setUnassignedPlayers([...currentPlayer.squad]);
    }
  }, [currentPlayer]);

  // Auto-submit on timeout
  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    const filledSlots = squadSlots.filter(slot => slot.player !== null);
    if (filledSlots.length === 11) {
      const finalSquad = filledSlots.map(slot => slot.player!);
      setIsSubmitting(true);
      try {
        await submitSquad(finalSquad, selectedFormation);
      } catch (error) {
        console.error('Failed to auto-submit squad:', error);
        setIsSubmitting(false);
      }
    } else {
      // Submit whatever we have
      const finalSquad = filledSlots.map(slot => slot.player!);
      setIsSubmitting(true);
      try {
        await submitSquad(finalSquad, selectedFormation);
      } catch (error) {
        console.error('Failed to auto-submit squad:', error);
        setIsSubmitting(false);
      }
    }
  }, [squadSlots, selectedFormation, isSubmitting, submitSquad]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, handleAutoSubmit]);

  // Validate squad
  const validateSquad = useCallback((): SquadValidation => {
    const validation: SquadValidation = {
      isValid: false,
      hasElevenPlayers: false,
      hasGoalkeeper: false,
      hasMinDefenders: false,
      hasMinMidfielders: false,
      hasMinForwards: false,
      errors: [],
    };

    const filledSlots = squadSlots.filter(slot => slot.player !== null);
    validation.hasElevenPlayers = filledSlots.length === 11;

    if (!validation.hasElevenPlayers) {
      validation.errors.push(`Need exactly 11 players (currently ${filledSlots.length})`);
    }

    const gkCount = filledSlots.filter(slot => slot.position === 'GK').length;
    validation.hasGoalkeeper = gkCount >= 1;
    if (!validation.hasGoalkeeper) {
      validation.errors.push('Need at least 1 Goalkeeper');
    }

    const defCount = filledSlots.filter(slot => 
      ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(slot.position)
    ).length;
    validation.hasMinDefenders = defCount >= 3;
    if (!validation.hasMinDefenders) {
      validation.errors.push(`Need at least 3 Defenders (currently ${defCount})`);
    }

    const midCount = filledSlots.filter(slot => 
      ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(slot.position)
    ).length;
    validation.hasMinMidfielders = midCount >= 2;
    if (!validation.hasMinMidfielders) {
      validation.errors.push(`Need at least 2 Midfielders (currently ${midCount})`);
    }

    const fwdCount = filledSlots.filter(slot => 
      ['LW', 'RW', 'ST', 'CF', 'LF', 'RF'].includes(slot.position)
    ).length;
    validation.hasMinForwards = fwdCount >= 1;
    if (!validation.hasMinForwards) {
      validation.errors.push('Need at least 1 Forward');
    }

    // Check for duplicate players
    const playerIds = filledSlots.map(slot => slot.player?._id).filter(Boolean);
    const uniqueIds = new Set(playerIds);
    if (playerIds.length !== uniqueIds.size) {
      validation.errors.push('Duplicate players detected');
    }

    validation.isValid = 
      validation.hasElevenPlayers &&
      validation.hasGoalkeeper &&
      validation.hasMinDefenders &&
      validation.hasMinMidfielders &&
      validation.hasMinForwards &&
      playerIds.length === uniqueIds.size;

    return validation;
  }, [squadSlots]);

  const validation = validateSquad();

  // Check if player can play position
  const canPlayPosition = (player: Player, position: Position): boolean => {
    const allPositions = getAllPlayerPositions(player);
    return allPositions.includes(position);
  };

  // Handle player drop on slot
  const handlePlayerDrop = (slotIndex: number, player: Player | null) => {
    const slot = squadSlots[slotIndex];
    const newSlots = [...squadSlots];
    
    // If clicking on a slot with a player and no player selected, remove the player
    if (!player && slot.player) {
      const removedPlayer = slot.player;
      newSlots[slotIndex].player = null;
      newSlots[slotIndex].isValid = false;
      setSquadSlots(newSlots);
      setUnassignedPlayers(prev => [...prev, removedPlayer]);
      return;
    }

    if (!player) return;

    // Check if position is valid
    if (!canPlayPosition(player, slot.position)) {
      return;
    }

    // Remove player from previous slot if exists
    const previousSlotIndex = newSlots.findIndex(s => s.player?._id === player._id);
    
    if (previousSlotIndex !== -1) {
      newSlots[previousSlotIndex].player = null;
      newSlots[previousSlotIndex].isValid = false;
    }

    // If slot already has a player, move it to unassigned
    if (slot.player) {
      setUnassignedPlayers(prev => [...prev, slot.player!]);
    }

    // Add player to new slot
    newSlots[slotIndex].player = player;
    newSlots[slotIndex].isValid = true;

    setSquadSlots(newSlots);

    // Update unassigned players - remove the player we just placed
    setUnassignedPlayers(prev => prev.filter(p => p._id !== player._id));
  };

  // Handle formation change
  const handleFormationChange = (formation: Formation) => {
    const currentPlayers = squadSlots
      .filter(slot => slot.player !== null)
      .map(slot => ({ player: slot.player!, position: slot.position }));

    setSelectedFormation(formation);

    // Rebuild slots with new formation
    const newSlots: SquadSlot[] = buildSlots(formation).map((slot) => {
      const candidates = currentPlayers
        .filter(cp => cp.player && canPlayPosition(cp.player, slot.position))
        .map(cp => cp.player);

      if (candidates.length > 0) {
        const best = candidates.sort((a, b) => b.rating - a.rating)[0];
        const index = currentPlayers.findIndex(cp => cp.player?._id === best._id);
        if (index !== -1) currentPlayers.splice(index, 1);
        return { ...slot, player: best, isValid: true };
      }

      return slot;
    });

    setSquadSlots(newSlots);

    // Move invalid players to unassigned
    const invalidPlayers = currentPlayers
      .filter(cp => !formation.positions.some(pos => canPlayPosition(cp.player, pos)))
      .map(cp => cp.player);
    
    setUnassignedPlayers(prev => [...prev, ...invalidPlayers]);
  };

  // Auto-fill best XI
  const handleAutoFill = () => {
    if (!currentPlayer?.squad) return;

    const availablePlayers = [...currentPlayer.squad];
    const newSlots: SquadSlot[] = buildSlots(selectedFormation).map((slot) => {
      const candidates = availablePlayers.filter(p => {
        const allPositions = getAllPlayerPositions(p);
        return allPositions.includes(slot.position);
      });
      if (candidates.length > 0) {
        const best = candidates.sort((a, b) => b.rating - a.rating)[0];
        const index = availablePlayers.findIndex(p => p._id === best._id);
        if (index !== -1) availablePlayers.splice(index, 1);
        return { ...slot, player: best, isValid: true };
      }
      return slot;
    });

    setSquadSlots(newSlots);
    setUnassignedPlayers(availablePlayers);
  };

  // Calculate team stats
  const calculateTeamStats = () => {
    const filledSlots = squadSlots.filter(slot => slot.player !== null);
    if (filledSlots.length === 0) {
      return {
        overallRating: 0,
        chemistry: 0,
        budgetSpent: 0,
        starPlayer: null as Player | null,
      };
    }

    const players = filledSlots.map(slot => slot.player!);
    const avgRating = players.reduce((sum, p) => sum + p.rating, 0) / players.length;
    
    // Simple chemistry calculation (club/nation links)
    let chemistry = 0;
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        if (players[i].club && players[j].club && players[i].club === players[j].club) {
          chemistry += 4;
        }
        if (players[i].nation && players[j].nation && players[i].nation === players[j].nation) {
          chemistry += 2;
        }
      }
    }

    const budgetSpent = room?.soldPlayers
      .filter(sp => sp.buyerId === currentPlayer?.id)
      .reduce((sum, sp) => sum + sp.price, 0) || 0;

    const starPlayer = players.reduce((best, p) => 
      p.rating > best.rating ? p : best, players[0]
    );

    return {
      overallRating: Math.round(avgRating * 10) / 10,
      chemistry: Math.min(100, chemistry),
      budgetSpent,
      starPlayer,
    };
  };

  const teamStats = calculateTeamStats();

  // Get players fitting current formation
  const getPlayersFittingFormation = () => {
    if (!currentPlayer?.squad) return 0;
    
    const requiredPositions = new Set(selectedFormation.positions);
    return currentPlayer.squad.filter(player => {
      const allPositions = getAllPlayerPositions(player);
      return allPositions.some(pos => requiredPositions.has(pos as Position));
    }).length;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validation.isValid || isSubmitting) return;

    setIsSubmitting(true);
    
    const finalSquad = squadSlots
      .filter(slot => slot.player !== null)
      .map(slot => slot.player!);

    try {
      await submitSquad(finalSquad, selectedFormation);
    } catch (error) {
      console.error('Failed to submit squad:', error);
      setIsSubmitting(false);
    }
  };


  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400">Loading squad builder...</p>
        </div>
      </div>
    );
  }

  const timerColor = timeRemaining <= 60
    ? 'text-red-500 border-red-500'
    : timeRemaining <= 180
      ? 'text-yellow-500 border-yellow-500'
      : 'text-neon-cyan border-neon-cyan';

  const playersFitting = getPlayersFittingFormation();
  const playerLookup = useMemo(() => {
    const map = new Map<string, Player>();
    currentPlayer?.squad?.forEach((player) => map.set(player._id, player));
    return map;
  }, [currentPlayer?.squad]);

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header with Timer */}
      <div className="sticky top-0 z-50 bg-dark-950/95 backdrop-blur-xl border-b border-dark-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Left: Title */}
            <div>
              <h1 className="text-2xl font-display font-black gradient-text">BUILD YOUR XI</h1>
              <p className="text-sm text-dark-400">Select formation and place your players</p>
            </div>

            {/* Center: Timer */}
            <motion.div
              className={cn(
                'flex items-center gap-4 px-6 py-3 rounded-full border-2 transition-all',
                'bg-dark-900/80 backdrop-blur-sm',
                timerColor,
                timeRemaining <= 60 && 'animate-pulse'
              )}
              animate={timeRemaining <= 60 ? {
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 0 rgba(239, 68, 68, 0)',
                  '0 0 30px rgba(239, 68, 68, 0.6)',
                  '0 0 0 rgba(239, 68, 68, 0)'
                ]
              } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Clock className="w-6 h-6" />
              <span className="text-3xl font-display font-black tabular-nums">
                {formatTime(timeRemaining)}
              </span>
            </motion.div>

            {/* Right: Opponent Status */}
            <div className="flex items-center gap-3">
              {opponent && (
                <div className="flex items-center gap-2 text-dark-400">
                  {opponent.isAI ? (
                    <Bot className="w-5 h-5 text-neon-purple" />
                  ) : (
                    <User className="w-5 h-5 text-neon-purple" />
                  )}
                  <span className="text-sm">{opponent.name}</span>
                  {opponentSquadStatus === 'submitted' && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Panel: Formation Selector & Unassigned Players */}
          <div className="lg:col-span-3 space-y-4">
            {/* Formation Picker */}
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-neon-cyan" />
                  Formation
                </h3>
                <button
                  onClick={() => setShowFormationPicker(!showFormationPicker)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  {showFormationPicker ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Current Formation Display */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold">{selectedFormation.displayName}</span>
                  <span className="text-xs text-dark-400">
                    {playersFitting}/11 fitting
                  </span>
                </div>
                {/* Mini pitch preview */}
                <div className="grid grid-cols-4 gap-1 p-2 bg-dark-800/50 rounded-lg">
                  {selectedFormation.positions.map((pos, i) => {
                    const posColors = getPositionDisplayColor(pos);
                    return (
                      <div
                        key={i}
                        className={cn(
                          'aspect-square rounded text-xs font-bold flex items-center justify-center',
                          posColors.bg,
                          posColors.text,
                          posColors.border,
                          'border'
                        )}
                      >
                        {pos}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Formation Dropdown */}
              <AnimatePresence>
                {showFormationPicker && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {FORMATIONS.map(formation => (
                      <button
                        key={formation.name}
                        onClick={() => {
                          handleFormationChange(formation);
                          setShowFormationPicker(false);
                        }}
                        className={cn(
                          'w-full p-3 rounded-lg border text-left transition-all',
                          selectedFormation.name === formation.name
                            ? 'bg-neon-cyan/20 border-neon-cyan'
                            : 'bg-dark-800/50 border-dark-700 hover:border-neon-cyan/50'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold">{formation.displayName}</span>
                          {formation.name === '4-3-3' && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-dark-400">
                          {formation.positions.filter(p => p === 'GK').length} GK,{' '}
                          {formation.positions.filter(p => ['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(p)).length} DEF,{' '}
                          {formation.positions.filter(p => ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p)).length} MID,{' '}
                          {formation.positions.filter(p => ['LW', 'RW', 'ST', 'CF'].includes(p)).length} FWD
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auto-Fill Button */}
              <button
                onClick={handleAutoFill}
                className="w-full mt-4 btn-secondary flex items-center justify-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Auto-Fill Best XI
              </button>
            </div>

            {/* Unassigned Players */}
            <div className="glass-card p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-purple" />
                Available Players ({unassignedPlayers.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {unassignedPlayers.map(player => (
                  <motion.div
                    key={player._id}
                    onClick={() => setSelectedPlayer(player)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', player._id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className={cn(
                      'p-2 rounded-lg border cursor-pointer transition-all',
                      'bg-dark-800/50 border-dark-700 hover:border-neon-cyan/50',
                      selectedPlayer?._id === player._id && 'border-neon-cyan bg-neon-cyan/20'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-16 flex-shrink-0">
                        <MiniPlayerCard player={player} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{player.name}</p>
                        <p className="text-xs text-dark-400">{player.position}</p>
                        <p className="text-xs text-neon-cyan font-bold">{player.rating} OVR</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {unassignedPlayers.length === 0 && (
                  <p className="text-center text-dark-500 text-sm py-4">
                    All players assigned
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Center: Pitch */}
          <div className="lg:col-span-6">
            <PitchView
              formation={selectedFormation}
              squadSlots={squadSlots}
              onPlayerDrop={handlePlayerDrop}
              hoveredSlot={hoveredSlot}
              setHoveredSlot={setHoveredSlot}
              selectedPlayer={selectedPlayer}
              onClearSelection={() => setSelectedPlayer(null)}
              playerLookup={playerLookup}
            />
          </div>

          {/* Right Panel: Validation & Stats */}
          <div className="lg:col-span-3 space-y-4">
            {/* Validation Status */}
            <div className={cn(
              'glass-card p-4 border-2',
              validation.isValid
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-red-500/50 bg-red-500/10'
            )}>
              <div className="flex items-center gap-3 mb-4">
                {validation.isValid ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
                <div>
                  <p className="font-bold">Squad Status</p>
                  <p className={cn(
                    'text-sm',
                    validation.isValid ? 'text-green-400' : 'text-red-400'
                  )}>
                    {validation.isValid ? 'Valid ✓' : 'Invalid ✗'}
                  </p>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2 text-sm">
                <div className={cn(
                  'flex items-center gap-2',
                  validation.hasElevenPlayers ? 'text-green-400' : 'text-red-400'
                )}>
                  {validation.hasElevenPlayers ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>11 Players</span>
                </div>
                <div className={cn(
                  'flex items-center gap-2',
                  validation.hasGoalkeeper ? 'text-green-400' : 'text-red-400'
                )}>
                  {validation.hasGoalkeeper ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>Goalkeeper</span>
                </div>
                <div className={cn(
                  'flex items-center gap-2',
                  validation.hasMinDefenders ? 'text-green-400' : 'text-red-400'
                )}>
                  {validation.hasMinDefenders ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>Defense (3+)</span>
                </div>
                <div className={cn(
                  'flex items-center gap-2',
                  validation.hasMinMidfielders ? 'text-green-400' : 'text-red-400'
                )}>
                  {validation.hasMinMidfielders ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>Midfield (2+)</span>
                </div>
                <div className={cn(
                  'flex items-center gap-2',
                  validation.hasMinForwards ? 'text-green-400' : 'text-red-400'
                )}>
                  {validation.hasMinForwards ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>Attack (1+)</span>
                </div>
              </div>

              {validation.errors.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dark-700">
                  {validation.errors.map((error, i) => (
                    <p key={i} className="text-xs text-red-400 flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Squad Summary */}
            <div className="glass-card p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-rarity-legendary" />
                Squad Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-dark-400 text-sm">Formation</span>
                  <span className="font-bold">{selectedFormation.displayName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-400 text-sm">Overall Rating</span>
                  <span className="font-bold text-neon-cyan">{teamStats.overallRating}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-400 text-sm">Chemistry</span>
                  <span className="font-bold text-neon-purple">{teamStats.chemistry}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-400 text-sm">Budget Spent</span>
                  <span className="font-bold text-neon-green">{formatCurrency(teamStats.budgetSpent)}</span>
                </div>
                {teamStats.starPlayer && (
                  <div className="pt-3 border-t border-dark-700">
                    <p className="text-xs text-dark-400 mb-2">Star Player</p>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-12">
                        <MiniPlayerCard player={teamStats.starPlayer} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{teamStats.starPlayer.name}</p>
                        <p className="text-xs text-rarity-legendary font-bold">
                          {teamStats.starPlayer.rating} OVR
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!validation.isValid || isSubmitting}
              className={cn(
                'w-full btn-primary flex items-center justify-center gap-2',
                (!validation.isValid || isSubmitting) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Final Squad
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pitch View Component
function PitchView({
  formation,
  squadSlots,
  onPlayerDrop,
  hoveredSlot,
  setHoveredSlot,
  selectedPlayer,
  onClearSelection,
  playerLookup,
}: {
  formation: Formation;
  squadSlots: SquadSlot[];
  onPlayerDrop: (slotIndex: number, player: Player | null) => void;
  hoveredSlot: number | null;
  setHoveredSlot: (index: number | null) => void;
  selectedPlayer: Player | null;
  onClearSelection: () => void;
  playerLookup: Map<string, Player>;
}) {
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  return (
    <div className="glass-card p-6">
      <div className="relative aspect-[3/4] pitch-field overflow-hidden">
        <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
          <span className="pitch-badge">COMPO</span>
          <span className="pitch-subtitle">{formation.displayName}</span>
        </div>

        {/* Field lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none pitch-lines">
          <rect x="2%" y="2%" width="96%" height="96%" rx="18" ry="18" />
          {/* Center circle */}
          <circle
            cx="50%"
            cy="50%"
            r="25%"
            fill="none"
          />
          {/* Center line */}
          <line
            x1="2%"
            y1="50%"
            x2="98%"
            y2="50%"
          />
          {/* Penalty boxes */}
          <rect
            x="6%"
            y="22%"
            width="18%"
            height="56%"
            fill="none"
          />
          <rect
            x="76%"
            y="22%"
            width="18%"
            height="56%"
            fill="none"
          />
          {/* Six-yard boxes */}
          <rect x="2%" y="35%" width="10%" height="30%" fill="none" />
          <rect x="88%" y="35%" width="10%" height="30%" fill="none" />
        </svg>

        {/* Position Slots */}
        <div className="absolute inset-0">
          {squadSlots.map((slot, index) => {
            const posColors = getPositionDisplayColor(slot.position);
            const isHovered = hoveredSlot === index;
            const canDrop = selectedPlayer ? canPlayPosition(selectedPlayer, slot.position) : true;
            const isDragOver = dragOverSlot === index;

            return (
              <div
                key={`${slot.position}-${index}`}
                onMouseEnter={() => {
                  if (selectedPlayer) {
                    setHoveredSlot(index);
                  }
                }}
                onMouseLeave={() => setHoveredSlot(null)}
                onDragEnter={() => setDragOverSlot(index)}
                onDragLeave={() => setDragOverSlot(null)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const playerId = e.dataTransfer.getData('text/plain');
                  const droppedPlayer = playerLookup.get(playerId);
                  if (droppedPlayer) {
                    onPlayerDrop(index, droppedPlayer);
                    onClearSelection();
                  }
                  setDragOverSlot(null);
                }}
                onClick={() => {
                  if (selectedPlayer && canDrop) {
                    onPlayerDrop(index, selectedPlayer);
                    onClearSelection();
                  } else if (slot.player) {
                    onPlayerDrop(index, null);
                  }
                }}
                className={cn(
                  'pitch-slot',
                  slot.player ? 'pitch-slot-filled' : 'pitch-slot-empty',
                  isHovered && selectedPlayer && canDrop && 'pitch-slot-eligible',
                  isDragOver && 'pitch-slot-dragover',
                  selectedPlayer && !canDrop && 'pitch-slot-blocked'
                )}
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              >
                {/* Position Label */}
                <div className={cn('pitch-position', posColors.bg, posColors.text, posColors.border)}>
                  {slot.position}
                </div>

                {/* Player Plate */}
                {slot.player ? (
                  <div
                    className="pitch-player"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', slot.player?._id || '');
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                  >
                    <div className="pitch-player-face">
                      <Image
                        src={slot.player.images?.playerFace || '/placeholder-player.png'}
                        alt={slot.player.name}
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="pitch-player-name">
                      <span className="pitch-player-number">{slot.player.rating}</span>
                      <span className="pitch-player-text">
                        {slot.player.name.split(' ').slice(-1)[0]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="pitch-slot-hint">Drop player</span>
                )}

                {/* Invalid indicator */}
                {slot.player && !slot.isValid && (
                  <div className="pitch-slot-warning">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper function (duplicated from component for use in PitchView)
function canPlayPosition(player: Player, position: Position): boolean {
  const allPositions = getAllPlayerPositions(player);
  return allPositions.includes(position);
}
