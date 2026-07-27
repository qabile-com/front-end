'use client';

import { useEffect } from 'react';

let scrollLockCount = 0;
let originalBodyOverflow = '';
let originalBodyPosition = '';
let originalBodyTop = '';
let originalBodyWidth = '';
let originalHtmlOverflow = '';
let lockedScrollY = 0;

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    scrollLockCount += 1;

    if (scrollLockCount === 1) {
      lockedScrollY = window.scrollY;
      originalBodyOverflow = document.body.style.overflow;
      originalBodyPosition = document.body.style.position;
      originalBodyTop = document.body.style.top;
      originalBodyWidth = document.body.style.width;
      originalHtmlOverflow = document.documentElement.style.overflow;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${lockedScrollY}px`;
      document.body.style.width = '100%';
    }

    return () => {
      scrollLockCount = Math.max(0, scrollLockCount - 1);

      if (scrollLockCount === 0) {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        window.scrollTo(0, lockedScrollY);
      }
    };
  }, [locked]);
}
