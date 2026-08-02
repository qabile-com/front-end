"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { PullToRefresh } from '@/shared/ui';
import { PWASplashScreen } from '@/shared/ui/pwa-splash-screen';

const SPLASH_EXIT_MS = 260;
const SPLASH_FALLBACK_MS = 2200;

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isSplashExiting, setIsSplashExiting] = useState(false);
  const mountedRef = useRef(true);
  const exitTimeoutRef = useRef<number | null>(null);

  const handleReady = useCallback(() => {
    if (mountedRef.current && !exitTimeoutRef.current) {
      setIsSplashExiting(true);
      exitTimeoutRef.current = window.setTimeout(() => {
        exitTimeoutRef.current = null;
        setShowSplash(false);
      }, SPLASH_EXIT_MS);
    }
  }, []);

  useEffect(() => {
    const fallback = window.setTimeout(() => {
      handleReady();
    }, SPLASH_FALLBACK_MS);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(fallback);
      if (exitTimeoutRef.current) {
        window.clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [handleReady]);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  if (!showSplash) {
    return <PullToRefresh onRefresh={handleRefresh}>{children}</PullToRefresh>;
  }

  return (
    <div
      className={`fixed inset-0 z-[1000] bg-[#050302] flex items-center justify-center transition-opacity duration-300 ease-out motion-reduce:transition-none ${
        isSplashExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <PWASplashScreen onReady={handleReady} />
    </div>
  );
}
