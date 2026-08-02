"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { PullToRefresh } from '@/shared/ui';
import { PWASplashScreen } from '@/shared/ui/pwa-splash-screen';

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const mountedRef = useRef(true);

  const handleReady = useCallback(() => {
    if (mountedRef.current) {
      setShowSplash(false);
    }
  }, []);

  useEffect(() => {
    const fallback = window.setTimeout(() => {
      if (mountedRef.current) {
        setShowSplash(false);
      }
    }, 5000);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(fallback);
    };
  }, []);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  if (!showSplash) {
    return <PullToRefresh onRefresh={handleRefresh}>{children}</PullToRefresh>;
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-[#050302] flex items-center justify-center">
      <PWASplashScreen onReady={handleReady} />
    </div>
  );
}
