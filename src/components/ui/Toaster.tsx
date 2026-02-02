'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Notification } from './Notification';

type ToastType = 'info' | 'success' | 'error';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToasterContextValue = {
  notify: (message: string, type?: ToastType, duration?: number) => void;
};

const ToasterContext = createContext<ToasterContextValue | null>(null);

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const toast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, toast]);

    // Auto remove
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration + 200);
  }, []);

  const contextValue = useMemo(() => ({ notify }), [notify]);

  return (
    <ToasterContext.Provider value={contextValue}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <Notification key={t.id} message={t.message} type={t.type} duration={t.duration} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </ToasterContext.Provider>
  );
}

export function useToaster() {
  const ctx = useContext(ToasterContext);
  if (!ctx) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return ctx;
}
