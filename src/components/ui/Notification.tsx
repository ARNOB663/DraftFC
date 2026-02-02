'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'info' | 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Notification({ message, type, onClose, duration = 4000 }: NotificationProps) {
  const initialDuration = duration;
  const remainingRef = useRef<number>(duration);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    startTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startTimer() {
    startTimeRef.current = Date.now();
    clearTimer();
    timerRef.current = setTimeout(() => {
      onClose();
    }, remainingRef.current);

    // Progress updater
    intervalRef.current = setInterval(() => {
      const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const rem = Math.max(0, remainingRef.current - elapsed);
      setProgress((rem / initialDuration) * 100);
    }, 100);
  }

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function handleMouseEnter() {
    if (isPaused) return;
    setIsPaused(true);
    if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
    clearTimer();
  }

  function handleMouseLeave() {
    if (!isPaused) return;
    setIsPaused(false);
    startTimer();
  }

  useEffect(() => {
    return () => {
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        className="max-w-sm"
      >
        <div 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => onClose()}
          className={`
            relative flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl cursor-pointer
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
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="ml-auto p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-white/60 hover:text-white" />
          </button>
          
          {/* Progress bar for auto-dismiss */}
          <div
            className={`absolute bottom-0 left-0 h-0.5 rounded-b-xl ${colorScheme.icon.replace('text-', 'bg-')}`}
            style={{ width: `${progress}%`, transition: isPaused ? 'none' : 'width 0.1s linear' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
