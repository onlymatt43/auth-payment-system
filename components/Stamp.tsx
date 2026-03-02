'use client';

import { useEffect, useState } from 'react';

export type StampType =
  | 'firstTime'
  | 'freeSpinAvailable'
  | 'freeSpinUsed'
  | 'jackpot'
  | 'bigWin'
  | 'aboutToPayForSpin'
  | 'rateLimit'
  | 'custom';

interface Stamp {
  id: string;
  type: StampType;
  title: string;
  message: string;
  emoji?: string; // Optional custom emoji
  action?: string;
  onAction?: () => void;
  duration?: number; // ms, 0 = persistent
}

/**
 * Stamp Context for global notification system
 */
export const createStampManager = () => {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [nextId, setNextId] = useState(0);

  const addStamp = (stamp: Omit<Stamp, 'id'>) => {
    const id = `stamp-${nextId}`;
    setNextId(prev => prev + 1);

    const newStamp: Stamp = {
      ...stamp,
      id,
      duration: stamp.duration ?? 5000, // Default 5 seconds
    };

    setStamps(prev => [...prev, newStamp]);

    // Auto-remove after duration if set (duration is always defined at this point)
    const duration = newStamp.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeStamp(id);
      }, duration);
    }

    return id;
  };

  const removeStamp = (id: string) => {
    setStamps(prev => prev.filter(s => s.id !== id));
  };

  return { stamps, addStamp, removeStamp };
};

/**
 * Floating Badge Stamp Component
 * Appears as a floating notification in bottom-right corner
 */
export function StampBadge({ stamp, onClose }: { stamp: Stamp; onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-xs transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } z-40`}
    >
      <div className="neon-border-blue glass-dark rounded-2xl p-4 flex items-start gap-4">
        {/* Icon/Emoji from emoji prop or title */}
        <div className="text-2xl flex-shrink-0">
          {stamp.emoji || stamp.title.split(' ')[0]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-white text-sm line-clamp-1">
            {stamp.emoji ? stamp.title : stamp.title.replace(/^[^\s]+\s/, '')} {/* Remove emoji from title only if no custom emoji */}
          </h3>
          <p className="text-gray-300 text-xs mt-1 line-clamp-2">{stamp.message}</p>

          {/* Action button */}
          {stamp.action && (
            <button
              onClick={() => {
                if (stamp.onAction) stamp.onAction();
                handleClose();
              }}
              className="mt-3 text-xs font-bold text-neon-yellow hover:text-neon-pink transition"
            >
              → {stamp.action}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition text-xl font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Stamp Container - shows all active stamps
 */
export function StampContainer({ stamps, onRemove }: { stamps: Stamp[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 space-y-3 pointer-events-none z-40">
      {stamps.map(stamp => (
        <div key={stamp.id} className="pointer-events-auto">
          <StampBadge stamp={stamp} onClose={() => onRemove(stamp.id)} />
        </div>
      ))}
    </div>
  );
}

/**
 * Hook to use stamps in any component
 */
export function useStamp() {
  const [stamps, setStamps] = useState<Stamp[]>([]);

  const addStamp = (stamp: Omit<Stamp, 'id'>) => {
    const id = `stamp-${Date.now()}-${Math.random()}`;

    const newStamp: Stamp = {
      ...stamp,
      id,
      duration: stamp.duration ?? 5000,
    };

    setStamps(prev => [...prev, newStamp]);

    const duration = newStamp.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeStamp(id);
      }, duration);
    }

    return id;
  };

  const removeStamp = (id: string) => {
    setStamps(prev => prev.filter(s => s.id !== id));
  };

  return { stamps, addStamp, removeStamp };
}
