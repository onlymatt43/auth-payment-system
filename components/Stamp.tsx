'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

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
  emoji?: string;
  action?: string;
  onAction?: () => void;
  duration?: number;
}

function stripEmoji(input: string): string {
  return input
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[\u2600-\u27BF]/g, '')
    .replace(/[\uFE0F]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getStampLink(stamp: Stamp): { href: string; label: string } {
  if (stamp.type === 'jackpot' || stamp.type === 'bigWin') {
    return { href: '/account', label: 'VOIR MON SOLDE' };
  }

  if (stamp.type === 'aboutToPayForSpin') {
    return { href: '/shop', label: 'ALLER AU PAIEMENT' };
  }

  const text = `${stamp.title} ${stamp.message}`.toLowerCase();

  if (text.includes('login') || text.includes('connecté') || text.includes('connecte') || text.includes('sign in')) {
    return { href: '/login', label: 'OUVRIR LOGIN' };
  }

  if (text.includes('email') || text.includes('courriel') || text.includes('profil')) {
    return { href: '/account', label: 'VOIR MON PROFIL' };
  }
  if (text.includes('insuffisant') || text.includes('insufficient') || text.includes('points')) {
    return { href: '/shop', label: 'ALLER AU PAIEMENT' };
  }

  return { href: '/how-it-works', label: 'COMMENT ÇA MARCHE' };
}

function TypewriterText({
  text,
  className,
  speed = 36,
  startDelay = 0,
  onDone,
}: {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
  onDone?: () => void;
}) {
  const [visibleChars, setVisibleChars] = useState(0);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    setVisibleChars(0);
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let doneCalled = false;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setVisibleChars((prev) => {
          if (prev >= text.length) {
            if (intervalId) clearInterval(intervalId);
            if (!doneCalled && onDoneRef.current) {
              doneCalled = true;
              onDoneRef.current();
            }
            return prev;
          }

          const next = prev + 1;
          if (next >= text.length && !doneCalled && onDoneRef.current) {
            doneCalled = true;
            onDoneRef.current();
          }
          return next;
        });
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  const done = visibleChars >= text.length;

  return (
    <span className={className}>
      {text.slice(0, visibleChars)}
      <span className={`stamp-cursor${done ? ' stamp-cursor-done' : ''}`}>|</span>
    </span>
  );
}

export const createStampManager = () => {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [nextId, setNextId] = useState(0);

  const addStamp = (stamp: Omit<Stamp, 'id'>) => {
    const id = `stamp-${nextId}`;
    setNextId((prev) => prev + 1);

    const newStamp: Stamp = {
      ...stamp,
      id,
      duration: stamp.duration ?? 0,
    };

    setStamps((prev) => [...prev, newStamp]);

    const duration = newStamp.duration ?? 0;
    if (duration > 0) {
      setTimeout(() => {
        removeStamp(id);
      }, duration);
    }

    return id;
  };

  const removeStamp = (id: string) => {
    setStamps((prev) => prev.filter((s) => s.id !== id));
  };

  return { stamps, addStamp, removeStamp };
};

function StampBadge({
  stamp,
  side,
  stackIndex,
  inline,
  onClose,
}: {
  stamp: Stamp;
  side: 'left' | 'right';
  stackIndex: number;
  inline: boolean;
  onClose: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [titleDone, setTitleDone] = useState(false);
  const [messageDone, setMessageDone] = useState(false);

  useEffect(() => {
    setTitleDone(false);
    setMessageDone(false);
  }, [stamp.id]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 900);
  };

  const cleanedTitle = useMemo(() => stripEmoji(stamp.title), [stamp.title]);
  const cleanedMessage = useMemo(() => stripEmoji(stamp.message), [stamp.message]);
  const link = useMemo(() => getStampLink(stamp), [stamp]);

  const floatingStyle = {
    transform: `translateY(calc(-50% + ${stackIndex * 132}px))`,
  };

  return (
    <div
      className={
        inline
          ? `w-full transition-all duration-900 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`
          : `absolute top-1/2 ${
              side === 'left' ? 'left-3 md:left-6' : 'right-3 md:right-6'
            } w-[min(30rem,calc(100vw-1.5rem))] transform transition-all duration-900 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } ${
              side === 'left'
                ? isVisible
                  ? 'translate-x-0'
                  : '-translate-x-12'
                : isVisible
                  ? 'translate-x-0'
                  : 'translate-x-12'
            }`
      }
      style={inline ? undefined : floatingStyle}
    >
      <div data-stamp-popup="true" className="rounded-2xl border border-amber-300/60 bg-black/80 p-5 shadow-[0_0_28px_rgba(251,191,36,0.35)] backdrop-blur-md">
        <div className="space-y-2">
          <TypewriterText
            text={cleanedTitle}
            className="stamp-gold-text block font-black text-base md:text-lg tracking-wide"
            speed={156}
            onDone={() => setTitleDone(true)}
          />
          <TypewriterText
            text={cleanedMessage}
            className="stamp-gold-text block opacity-90 text-sm md:text-base leading-snug"
            speed={96}
            startDelay={780}
            onDone={() => setMessageDone(true)}
          />
        </div>

        {titleDone && messageDone && (
          <Link
            href={link.href}
            onClick={handleClose}
            className="mt-4 inline-block text-xs md:text-sm font-bold tracking-[0.16em] text-amber-200 hover:text-amber-100 transition"
          >
            → {link.label}
          </Link>
        )}
      </div>
    </div>
  );
}

export function StampContainer({
  stamps,
  onRemove,
  variant = 'floating',
  empty,
}: {
  stamps: Stamp[];
  onRemove: (id: string) => void;
  variant?: 'floating' | 'inline';
  empty?: ReactNode;
}) {
  const inline = variant === 'inline';

  useEffect(() => {
    if (stamps.length === 0) return;

    const dismissAll = () => {
      for (const stamp of stamps) {
        onRemove(stamp.id);
      }
    };

    const handleUserAction = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-stamp-popup="true"]')) return;
      dismissAll();
    };

    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    for (const name of events) window.addEventListener(name, handleUserAction, { passive: true });

    return () => {
      for (const name of events) window.removeEventListener(name, handleUserAction as EventListener);
    };
  }, [stamps, onRemove]);

  if (stamps.length === 0 && inline) {
    return <>{empty ?? null}</>;
  }

  return (
    <div className={inline ? 'space-y-3' : 'fixed inset-0 pointer-events-none z-40'}>
      {stamps.map((stamp, index) => (
        <div key={stamp.id} className={inline ? '' : 'pointer-events-auto'}>
          <StampBadge
            stamp={stamp}
            side={index % 2 === 0 ? 'left' : 'right'}
            stackIndex={Math.floor(index / 2)}
            inline={inline}
            onClose={() => onRemove(stamp.id)}
          />
        </div>
      ))}
    </div>
  );
}

export function useStamp() {
  const [stamps, setStamps] = useState<Stamp[]>([]);

  const addStamp = (stamp: Omit<Stamp, 'id'>) => {
    const id = `stamp-${Date.now()}-${Math.random()}`;

    const newStamp: Stamp = {
      ...stamp,
      id,
      duration: stamp.duration ?? 0,
    };

    setStamps((prev) => [...prev, newStamp]);

    const duration = newStamp.duration ?? 0;
    if (duration > 0) {
      setTimeout(() => {
        removeStamp(id);
      }, duration);
    }

    return id;
  };

  const removeStamp = (id: string) => {
    setStamps((prev) => prev.filter((s) => s.id !== id));
  };

  return { stamps, addStamp, removeStamp };
}
