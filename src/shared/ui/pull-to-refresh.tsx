'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/core/lib/cn';
import { InlineSpinner } from './inline-spinner';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 82,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const activeScrollerRef = useRef<HTMLElement | Window | null>(null);
  const isPullingRef = useRef(false);
  const rafRef = useRef<number>(0);

  const isEnabled = useCallback(() => {
    return window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
  }, []);

  const isAtTop = useCallback((scroller: HTMLElement | Window | null) => {
    if (!scroller || scroller === window) return window.scrollY <= 1;
    return (scroller as HTMLElement).scrollTop <= 1;
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (!isEnabled() || isRefreshing || event.touches.length !== 1) return;

      const scroller = getScrollableParent(event.target);
      if (!isAtTop(scroller)) return;

      activeScrollerRef.current = scroller;
      startYRef.current = event.touches[0].clientY;
      isPullingRef.current = true;
    },
    [isAtTop, isEnabled, isRefreshing],
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing) return;

      const diff = event.touches[0].clientY - startYRef.current;
      if (diff <= 0) {
        setPullDistance(0);
        return;
      }

      if (diff > 5 && isAtTop(activeScrollerRef.current)) {
        event.preventDefault();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setPullDistance(Math.min(diff * 0.62, threshold * 1.65));
        });
      }
    },
    [isAtTop, isRefreshing, threshold],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    activeScrollerRef.current = null;

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
  }, [isRefreshing, onRefresh, pullDistance, threshold]);

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
  }, [handleTouchEnd, handleTouchMove, handleTouchStart]);

  if (!onRefresh) {
    return <>{children}</>;
  }

  const progress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 0 || isRefreshing;
  const indicatorHeight = isRefreshing ? 72 : Math.min(72, 18 + pullDistance * 0.55);

  return (
    <div className={cn('relative', className)}>
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-x-0 top-0 z-[90] flex items-end justify-center overflow-hidden bg-[linear-gradient(180deg,rgba(14,8,6,.96),rgba(14,8,6,.66),transparent)] pb-2 pt-[env(safe-area-inset-top)] transition-[height,opacity] duration-200',
          showIndicator ? 'opacity-100' : 'opacity-0',
        )}
        style={{ height: showIndicator ? indicatorHeight : 0 }}
      >
        <div className="border-hair flex min-h-10 items-center gap-2 rounded-full border bg-black/80 px-3 text-ink-2 shadow-[0_18px_54px_-26px_var(--glow)] backdrop-blur-xl">
          {isRefreshing ? (
            <>
              <InlineSpinner className="size-4 border-2 border-t-transparent text-ember" />
              <span className="text-[12px] font-black">در حال تازه‌سازی...</span>
            </>
          ) : (
            <>
              <InlineSpinner
                className="size-4 border-2 border-t-transparent text-ember transition-transform duration-200"
                style={{ transform: `rotate(${progress * 360}deg)` }}
              />
              <span className="text-[12px] font-black">
                {progress >= 1 ? 'رها کن برای تازه‌سازی' : 'برای تازه‌سازی بکش'}
              </span>
            </>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

function getScrollableParent(target: EventTarget | null): HTMLElement | Window {
  let element = target instanceof HTMLElement ? target : null;

  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const canScrollY = /(auto|scroll)/.test(style.overflowY);
    if (canScrollY && element.scrollHeight > element.clientHeight) {
      return element;
    }
    element = element.parentElement;
  }

  return window;
}
