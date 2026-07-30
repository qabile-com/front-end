'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/core/lib/cn';
import { InlineSpinner } from '@/shared/ui';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const rafRef = useRef<number>(0);

  const isAtTop = useCallback(() => {
    return window.scrollY <= 1;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isAtTop() || isRefreshing) return;
    startYRef.current = e.touches[0].clientY;
    isPullingRef.current = true;
  }, [isAtTop, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPullingRef.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 5 && isAtTop()) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPullDistance(Math.min(diff, threshold * 1.5));
      });
    }
  }, [isAtTop, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (pullDistance >= threshold && onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
      return;
    }

    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh, isRefreshing]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 0 || isRefreshing;

  if (!onRefresh) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)}>
      <div
        aria-hidden="true"
        className={cn(
          'fixed left-0 right-0 top-0 z-50 flex items-center justify-center overflow-hidden transition-[height,opacity] duration-200',
          showIndicator ? 'h-12 opacity-100' : 'h-0 opacity-0',
        )}
        style={{ height: showIndicator ? 48 : 0 }}
      >
        <div className="flex items-center gap-2 text-ink-2">
          {isRefreshing ? (
            <>
              <InlineSpinner className="size-4 border-2 border-t-transparent" />
              <span className="text-[12px] font-bold">در حال بارگذاری...</span>
            </>
          ) : (
            <>
              <InlineSpinner
                className={cn('size-4 border-2 border-t-transparent transition-transform duration-200')}
                style={{ transform: `rotate(${progress * 360}deg)` }}
              />
              <span className="text-[12px] font-bold">
                {Math.round(progress * 100)}%
              </span>
            </>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
