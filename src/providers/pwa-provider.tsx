'use client';

import { useEffect } from 'react';

export function PwaProvider() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const shouldRegister =
      process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SW === 'true';

    if (!shouldRegister) return;

    window.addEventListener('load', () => {
      void navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
    });
  }, []);

  return null;
}
