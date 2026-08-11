'use client';

import { useEffect } from 'react';
import { isServiceWorkerSupported } from '@/shared/lib/service-worker';

export function PwaProvider() {
  useEffect(() => {
    if (!isServiceWorkerSupported()) return;

    const shouldRegister =
      process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SW === 'true';

    if (!shouldRegister) return;

    const register = () => {
      void navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
    };

    // `load` may already have fired by the time this effect runs (e.g. on client-side
    // navigation into the app), in which case the listener would never fire and the worker
    // would never register.
    if (document.readyState === 'complete') {
      register();
      return;
    }

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
