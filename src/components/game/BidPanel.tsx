'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn, formatCurrency, calculateBidIncrement } from '@/lib/utils';
import { Plus, Minus, Gavel, Check } from 'lucide-react';

interface BidPanelProps {
  currentBid: number;
  budget: number;
  canBid: boolean;
  isHighestBidder: boolean;
  onBid: (amount: number) => void;
  minIncrement: number;
}

export function BidPanel({
  currentBid,
  budget,
  canBid,
  isHighestBidder,
  onBid,
  minIncrement,
}: BidPanelProps) {
  const increment = calculateBidIncrement(currentBid);
  const [customBid, setCustomBid] = useState(currentBid + increment);

  // Quick bid options
  const quickBids = [
    { label: '+1M', amount: currentBid + 1000000 },
    { label: '+5M', amount: currentBid + 5000000 },
    { label: '+10M', amount: currentBid + 10000000 },
    { label: '+25M', amount: currentBid + 25000000 },
  ].filter(b => b.amount <= budget);

  const handleQuickBid = (amount: number) => {
    onBid(amount);
  };

  const handleCustomBid = () => {
    if (customBid > currentBid && customBid <= budget) {
      onBid(customBid);
    }
  };

  const adjustCustomBid = (delta: number) => {
    const newBid = customBid + delta;
    if (newBid > currentBid && newBid <= budget) {
      setCustomBid(newBid);
    }
  };

  if (isHighestBidder) {
    return (
      <motion.div
        className="glass-card p-6 text-center neon-glow-cyan"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="flex items-center justify-center gap-2 text-neon-cyan">
          <Check className="w-6 h-6" />
          <span className="text-xl font-bold">You're the highest bidder!</span>
        </div>
        <p className="text-dark-400 mt-2">Wait for other bids or the timer to end</p>
      </motion.div>
    );
  }

  if (!canBid) {
    return (
      <motion.div
        className="glass-card p-6 text-center"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <p className="text-dark-400">Cannot bid - insufficient budget</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass-card p-6 w-full max-w-md"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {/* Quick Bid Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {quickBids.map((bid) => (
          <motion.button
            key={bid.label}
            onClick={() => handleQuickBid(bid.amount)}
            className="py-3 px-2 bg-dark-800 hover:bg-dark-700 rounded-xl text-sm font-bold transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {bid.label}
          </motion.button>
        ))}
      </div>

      {/* Custom Bid */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => adjustCustomBid(-increment)}
          disabled={customBid - increment <= currentBid}
          className="p-3 rounded-xl bg-dark-800 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="flex-1 text-center">
          <p className="text-xs text-dark-400 mb-1">Custom Bid</p>
          <p className="text-2xl font-display font-bold text-neon-green">
            {formatCurrency(customBid)}
          </p>
        </div>

        <button
          onClick={() => adjustCustomBid(increment)}
          disabled={customBid + increment > budget}
          className="p-3 rounded-xl bg-dark-800 hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Place Bid Button */}
      <motion.button
        onClick={handleCustomBid}
        disabled={customBid <= currentBid || customBid > budget}
        className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Gavel className="w-5 h-5" />
        Place Bid
      </motion.button>

      {/* Budget reminder */}
      <p className="text-center text-dark-400 text-sm mt-3">
        Your budget: <span className="text-neon-green font-mono">{formatCurrency(budget)}</span>
      </p>
    </motion.div>
  );
}
