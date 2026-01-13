'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'info' | 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Notification({ message, type, onClose, duration = 4000 }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    info: Info,
    success: CheckCircle,
    error: AlertCircle,
  };

  const colors = {
    info: {
      bg: 'bg-gradient-to-r from-blue-500/20 via-blue-500/15 to-cyan-500/20',
      border: 'border-blue-500/40',
      text: 'text-blue-300',
      icon: 'text-blue-400',
      glow: '0 0 20px rgba(59, 130, 246, 0.3)',
    },
    success: {
      bg: 'bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-teal-500/20',
      border: 'border-green-500/40',
      text: 'text-green-300',
      icon: 'text-green-400',
      glow: '0 0 20px rgba(34, 197, 94, 0.3)',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500/20 via-rose-500/15 to-orange-500/20',
      border: 'border-red-500/40',
      text: 'text-red-300',
      icon: 'text-red-400',
      glow: '0 0 20px rgba(239, 68, 68, 0.3)',
    },
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed top-20 right-4 z-50 max-w-sm"
      >
        <div 
          className={`
            relative flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl
            ${colorScheme.bg} ${colorScheme.border}
          `}
          style={{ boxShadow: colorScheme.glow }}
        >
          {/* Animated accent line */}
          <motion.div
            className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${colorScheme.icon.replace('text-', 'bg-')}`}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
          
          {/* Icon with pulse */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${colorScheme.icon}`} />
          </motion.div>
          
          {/* Message */}
          <span className={`font-medium text-sm ${colorScheme.text}`}>{message}</span>
          
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="ml-auto p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-white/60 hover:text-white" />
          </button>
          
          {/* Progress bar for auto-dismiss */}
          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 rounded-b-xl ${colorScheme.icon.replace('text-', 'bg-')}`}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
