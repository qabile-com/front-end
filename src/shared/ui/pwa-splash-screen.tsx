"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/core/lib/cn';

const SPLASH_INITIAL_DELAY_MS = 250;
const SPLASH_SHRINK_DELAY_MS = 500;
const SPLASH_PULSE_DELAY_MS = 750;
const SPLASH_EXIT_MS = 220;

interface PWASplashScreenProps {
  onReady: () => void;
}

export function PWASplashScreen({ onReady }: PWASplashScreenProps) {
  const [phase, setPhase] = useState<'initial' | 'show-icon' | 'shrink' | 'pulse' | 'fade-out'>('initial');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isReady) return;

    const timer1 = setTimeout(() => {
      setPhase('show-icon');
    }, SPLASH_INITIAL_DELAY_MS);

    const timer2 = setTimeout(() => {
      setPhase('shrink');
    }, SPLASH_SHRINK_DELAY_MS);

    const timer3 = setTimeout(() => {
      setPhase('pulse');
    }, SPLASH_PULSE_DELAY_MS);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isReady]);

  useEffect(() => {
    if (phase === 'fade-out') {
      const timer = setTimeout(() => {
        onReady();
      }, SPLASH_EXIT_MS);
      return () => clearTimeout(timer);
    }
  }, [phase, onReady]);

  const markReady = () => {
    setIsReady(true);
    if (phase !== 'fade-out') {
      setPhase('fade-out');
    }
  };

  if (phase === 'initial') {
    return (
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center"
        style={{ background: '#000' }}
        role="status"
        aria-label="در حال بارگذاری"
      >
        <div className="sr-only">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-[1000] flex items-center justify-center transition-opacity duration-300',
        phase === 'fade-out' && 'opacity-0 pointer-events-none'
      )}
      style={{ background: '#000' }}
      role="status"
      aria-label="در حال بارگذاری"
    >
      <img
        src="/icons/icon-192.png"
        alt="قبیله ققنوس"
        className={cn(
          'transition-all duration-300 ease-out',
          phase === 'show-icon' && 'w-[220px] h-[220px]',
          phase === 'shrink' && 'w-[183px] h-[183px]',
          phase === 'pulse' && 'w-[183px] h-[183px] animate-pulse',
          phase === 'fade-out' && 'w-[183px] h-[183px] opacity-0'
        )}
        onLoad={markReady}
      />
    </div>
  );
}

export function PWASplashProvider({ children }: { children: React.ReactNode }) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setIsAppReady(true);
      setTimeout(() => setShowSplash(false), SPLASH_EXIT_MS);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (!isAppReady && showSplash) {
    return (
      <PWASplashScreen onReady={() => setShowSplash(false)} />
    );
  }

  return <>{children}</>;
}
