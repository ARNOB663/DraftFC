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
