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
  const [isPulling, setIsPulling] = useState(false);
  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAtTop = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollTop <= 0;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isAtTop() || isRefreshing) return;
    startYRef.current = e.touches[0].clientY;
    setIsPulling(true);
  }, [isAtTop, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 0 && isAtTop()) {
      setPullDistance(Math.min(diff, threshold * 1.5));
      e.preventDefault();
    }
  }, [isPulling, isRefreshing, isAtTop, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    setIsPulling(false);

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
  }, [isPulling, pullDistance, threshold, onRefresh, isRefreshing]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);
    el.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const progress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-y-auto overscroll-behavior-contain min-h-0', className)}
    >
      <div
        aria-hidden="true"
        className={cn(
          'flex items-center justify-center overflow-hidden transition-[height,opacity] duration-200',
          showIndicator ? 'h-12 opacity-100' : 'h-0 opacity-0',
        )}
        style={{ height: showIndicator ? Math.max(pullDistance, 48) : 0 }}
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

      <div
        style={{
          transform: `translateY(${isRefreshing ? 48 : pullDistance * 0.5}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
