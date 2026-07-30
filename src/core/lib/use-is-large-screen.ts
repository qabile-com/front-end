'use client';

import { useEffect, useState } from 'react';

export function useIsLargeScreen(breakpoint = 1024) {
  const [isLarge, setIsLarge] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia(`(min-width: ${breakpoint}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const handler = (event: MediaQueryListEvent) => setIsLarge(event.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return isLarge;
}
