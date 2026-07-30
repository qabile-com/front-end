"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/core/lib/cn';

interface PWASplashScreenProps {
  onReady: () => void;
}

export function PWASplashScreen({ onReady }: PWASplashScreenProps) {
  const [phase, setPhase] = useState<'initial' | 'show-icon' | 'shrink' | 'pulse' | 'fade-out'>('initial');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('show-icon');
    }, 1200);

    const timer2 = setTimeout(() => {
      setPhase('shrink');
    }, 1500);

    const timer3 = setTimeout(() => {
      setPhase('pulse');
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  useEffect(() => {
    if (phase === 'fade-out') {
      const timer = setTimeout(() => {
        onReady();
      }, 300);
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
      setTimeout(() => setShowSplash(false), 300);
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