'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

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
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    success: 'bg-green-500/20 border-green-500/50 text-green-400',
    error: 'bg-red-500/20 border-red-500/50 text-red-400',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl ${colors[type]}`}>
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{message}</span>
          <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
