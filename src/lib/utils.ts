import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(2)}B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function formatBudget(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'text-rarity-legendary';
    case 'epic':
      return 'text-rarity-epic';
    case 'rare':
      return 'text-rarity-rare';
    default:
      return 'text-rarity-common';
  }
}

export function getRarityBgColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'bg-rarity-legendary/20 border-rarity-legendary/50';
    case 'epic':
      return 'bg-rarity-epic/20 border-rarity-epic/50';
    case 'rare':
      return 'bg-rarity-rare/20 border-rarity-rare/50';
    default:
      return 'bg-rarity-common/20 border-rarity-common/50';
  }
}

export function getPositionColor(position: string): string {
  const defPositions = ['GK', 'CB', 'LB', 'RB'];
  const midPositions = ['CDM', 'CM', 'CAM', 'LM', 'RM'];
  const attPositions = ['LW', 'RW', 'ST'];

  if (defPositions.includes(position)) return 'bg-blue-500';
  if (midPositions.includes(position)) return 'bg-green-500';
  if (attPositions.includes(position)) return 'bg-red-500';
  return 'bg-gray-500';
}

export function getStatColor(value: number): string {
  if (value >= 90) return 'text-green-400';
  if (value >= 80) return 'text-lime-400';
  if (value >= 70) return 'text-yellow-400';
  if (value >= 60) return 'text-orange-400';
  return 'text-red-400';
}

export function calculateBidIncrement(currentBid: number): number {
  if (currentBid >= 100000000) return 10000000; // $10M
  if (currentBid >= 50000000) return 5000000; // $5M
  if (currentBid >= 10000000) return 2000000; // $2M
  return 1000000; // $1M
}

export function getBidOptions(currentBid: number, budget: number): number[] {
  const increment = calculateBidIncrement(currentBid);
  const options: number[] = [];
  
  for (let i = 1; i <= 5; i++) {
    const bid = currentBid + (increment * i);
    if (bid <= budget) {
      options.push(bid);
    }
  }
  
  return options;
}

// ============================================
// POSITION UTILITIES
// ============================================

// All known positions
export const ALL_POSITIONS = ['GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF', 'LF', 'RF'];

// Position group colors for UI
export const POSITION_GROUP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GK: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  CB: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  LB: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  RB: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  LWB: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  RWB: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  CDM: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  CM: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  CAM: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  LM: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  RM: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  LW: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  RW: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  ST: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  CF: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  LF: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  RF: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
};

/**
 * Parse alternate positions from various formats
 * Handles: ["CDMCAM"], ["CDM", "CAM"], "CDMCAM", etc.
 */
export function parseAltPositions(altPositions: string[] | undefined): string[] {
  if (!altPositions || !Array.isArray(altPositions)) return [];
  
  const parsed: string[] = [];
  
  altPositions.forEach(pos => {
    if (typeof pos !== 'string') return;
    
    // If it's already a valid single position
    if (ALL_POSITIONS.includes(pos)) {
      parsed.push(pos);
      return;
    }
    
    // Parse combined string like "CDMCAM" or "LMCAM"
    let remaining = pos.toUpperCase();
    
    // Sort positions by length (longer first) to match correctly
    const sortedPositions = [...ALL_POSITIONS].sort((a, b) => b.length - a.length);
    
    while (remaining.length > 0) {
      let found = false;
      for (const position of sortedPositions) {
        if (remaining.startsWith(position)) {
          parsed.push(position);
          remaining = remaining.slice(position.length);
          found = true;
          break;
        }
      }
      if (!found) {
        // Skip unknown character
        remaining = remaining.slice(1);
      }
    }
  });
  
  // Remove duplicates
  return [...new Set(parsed)];
}

/**
 * Get all positions a player can play (main + alternates)
 */
export function getAllPlayerPositions(player: { position: string; altPositions?: string[] }): string[] {
  const positions = [player.position];
  const altPos = parseAltPositions(player.altPositions);
  return [...new Set([...positions, ...altPos])];
}

/**
 * Get position group (GK, DEF, MID, FWD)
 */
export function getPositionGroup(position: string): 'GK' | 'DEF' | 'MID' | 'FWD' {
  const POSITION_GROUPS: Record<string, string[]> = {
    GK: ['GK'],
    DEF: ['CB', 'LB', 'RB', 'LWB', 'RWB'],
    MID: ['CDM', 'CM', 'CAM', 'LM', 'RM'],
    FWD: ['LW', 'RW', 'ST', 'CF', 'LF', 'RF']
  };

  for (const [group, positions] of Object.entries(POSITION_GROUPS)) {
    if (positions.includes(position)) return group as 'GK' | 'DEF' | 'MID' | 'FWD';
  }
  return 'MID';
}

/**
 * Get position display color based on position type
 */
export function getPositionDisplayColor(position: string): { bg: string; text: string; border: string } {
  return POSITION_GROUP_COLORS[position] || { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' };
}
